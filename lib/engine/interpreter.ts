import * as acorn from 'acorn';
import { StateManager } from './state-manager';
import { EngineStep, Value, EngineState, MemoryObject, LexicalEnvironment } from './types';

export class Interpreter {
  private stateManager: StateManager;
  private steps: EngineStep[] = [];
  private ast: any = null;

  constructor() {
    this.stateManager = new StateManager();
  }

  public parse(code: string) {
    this.ast = acorn.parse(code, {
      ecmaVersion: 'latest',
      locations: true,
      sourceType: 'module',
    });
    return this.ast;
  }

  public *execute(code: string) {
    this.ast = this.parse(code);
    yield* this.visit(this.ast);
  }

  private *visit(node: any): Generator<EngineStep, Value | void, any> {
    if (!node) return;

    switch (node.type) {
      case 'Program':
        // 1. Creation Phase (Hoisting)
        yield* this.hoist(node.body);
        
        // 2. Execution Phase
        for (const stmt of node.body) {
          yield* this.visit(stmt);
          yield* this.drainMicrotasks();
        }
        break;

      case 'VariableDeclaration':
        for (const decl of node.declarations) {
          const value = (yield* this.visit(decl.init)) as unknown as Value;
          const name = (decl.id as any).name;
          const kind = node.kind as 'var' | 'let' | 'const';
          
          this.stateManager.saveStep();
          const state = this.stateManager.getState();
          const currentEnvId = state.callStack[state.callStack.length - 1].lexicalEnvironment;
          const env: LexicalEnvironment = { ...state.environments[currentEnvId] };
          env.bindings[name] = { value: value, kind };
          
          const step: EngineStep = {
            type: 'BIND_VARIABLE',
            description: `Binding ${kind} ${name} to value`,
            stateChange: { 
              environments: { ...state.environments, [currentEnvId]: env },
              currentASTNode: node
            },
            astNode: node
          };
          this.stateManager.updateState(step.stateChange);
          yield step;
        }
        break;

      case 'Literal':
        return { type: 'primitive', value: node.value };

      case 'Identifier':
        return this.resolveIdentifier(node.name);

      case 'BinaryExpression': {
        const left = (yield* this.visit(node.left)) as unknown as Value;
        const right = (yield* this.visit(node.right)) as unknown as Value;
        let result: any;
        if (node.operator === '+') result = (left as any).value + (right as any).value;
        if (node.operator === '-') result = (left as any).value - (right as any).value;
        if (node.operator === '*') result = (left as any).value * (right as any).value;
        if (node.operator === '/') result = (left as any).value / (right as any).value;
        return { type: 'primitive', value: result };
      }

      case 'ObjectExpression': {
        const objId = `obj_${Math.random().toString(36).substr(2, 9)}`;
        const properties: Record<string, Value> = {};
        for (const prop of node.properties) {
          const key = prop.key.name || prop.key.value;
          const val = (yield* this.visit(prop.value)) as unknown as Value;
          properties[key] = val;
        }
        
        const state = this.stateManager.getState();
        const obj: MemoryObject = {
          id: objId,
          type: 'object',
          properties,
          prototype: 'obj_window', // Simplified
        };

        const step: EngineStep = {
          type: 'ALLOCATE_OBJECT',
          description: `Allocated new object ${objId}`,
          stateChange: { 
            heap: { ...state.heap, [objId]: obj },
            currentASTNode: node
          },
          astNode: node
        };
        this.stateManager.updateState(step.stateChange);
        yield step;
        return { type: 'object', id: objId };
      }

      case 'FunctionDeclaration': {
        const name = node.id.name;
        const funcId = `func_${name}_${Math.random().toString(36).substr(2, 5)}`;
        const state = this.stateManager.getState();
        
        const funcObj: MemoryObject = {
          id: funcId,
          type: 'function',
          properties: {},
          prototype: null, // Simplified
          functionBody: node.body,
          name: name
        };

        const currentEnvId = state.callStack[state.callStack.length - 1].lexicalEnvironment;
        const env: LexicalEnvironment = { ...state.environments[currentEnvId] };
        env.bindings[name] = { value: { type: 'object', id: funcId }, kind: 'var' };

        const step: EngineStep = {
          type: 'BIND_VARIABLE',
          description: `Hoisting function ${name}`,
          stateChange: { 
            heap: { ...state.heap, [funcId]: funcObj },
            environments: { ...state.environments, [currentEnvId]: env },
            currentASTNode: node
          },
          astNode: node
        };
        this.stateManager.updateState(step.stateChange);
        yield step;
        break;
      }

      case 'ExpressionStatement':
        yield* this.visit(node.expression);
        break;

      case 'CallExpression':
        if (node.callee.type === 'MemberExpression' && 
            node.callee.object.name === 'console' && 
            node.callee.property.name === 'log') {
          const args = [];
          for (const arg of node.arguments) {
            const val = yield* this.visit(arg);
            args.push(val);
          }
          
          const step: EngineStep = {
            type: 'EVALUATE_EXPRESSION',
            description: 'console.log called',
            stateChange: { 
              console: [...this.stateManager.getState().console, { type: 'log', content: args }],
              currentASTNode: node
            },
            astNode: node
          };
          this.stateManager.updateState(step.stateChange);
          yield step;
        } else if (node.callee.name === 'setTimeout') {
          const callback = yield* this.visit(node.arguments[0]);
          const delay = yield* this.visit(node.arguments[1]);
          
          const step: EngineStep = {
            type: 'ENQUEUE_JOB',
            description: `Enqueuing macrotask (setTimeout with delay ${JSON.stringify(delay)})`,
            stateChange: { 
              macrotaskQueue: [...this.stateManager.getState().macrotaskQueue, { callback, delay }],
              currentASTNode: node
            },
            astNode: node
          };
          this.stateManager.updateState(step.stateChange);
          yield step;
        }
        break;

      case 'NewExpression':
        if (node.callee.name === 'Promise') {
          const promiseId = `promise_${Math.random().toString(36).substr(2, 9)}`;
          const state = this.stateManager.getState();
          const promiseObj: MemoryObject = {
            id: promiseId,
            type: 'object',
            properties: { 
              '[[PromiseState]]': { type: 'primitive', value: 'pending' },
              '[[PromiseResult]]': { type: 'primitive', value: undefined }
            },
            prototype: 'obj_window', // Simplified
          };
          
          const step: EngineStep = {
            type: 'ALLOCATE_OBJECT',
            description: `Created new Promise ${promiseId}`,
            stateChange: { 
              heap: { ...state.heap, [promiseId]: promiseObj },
              currentASTNode: node
            },
            astNode: node
          };
          this.stateManager.updateState(step.stateChange);
          yield step;
          return { type: 'object', id: promiseId };
        }
        break;

      case 'MemberExpression': {
        const obj = (yield* this.visit(node.object)) as unknown as Value;
        if (obj.type === 'object') {
          const property = node.property.name || node.property.value;
          // In a real engine, we lookup in the heap...
          return { type: 'primitive', value: undefined }; // Simplified
        }
        break;
      }

      default:
        console.warn('Unhandled node type:', node.type);
    }
  }

  private *hoist(body: any[]) {
    for (const stmt of body) {
      if (stmt.type === 'FunctionDeclaration') {
        yield* this.visit(stmt); // We already implemented hoisting in FunctionDeclaration visitor
      } else if (stmt.type === 'VariableDeclaration' && stmt.kind === 'var') {
        for (const decl of stmt.declarations) {
          const name = (decl.id as any).name;
          const state = this.stateManager.getState();
          const currentEnvId = state.callStack[state.callStack.length - 1].lexicalEnvironment;
          const env: LexicalEnvironment = { ...state.environments[currentEnvId] };
          
          if (!env.bindings[name]) {
            env.bindings[name] = { value: { type: 'primitive', value: undefined }, kind: 'var' };
            const step: EngineStep = {
              type: 'BIND_VARIABLE',
              description: `Hoisting variable ${name} (Creation Phase)`,
              stateChange: { 
                environments: { ...state.environments, [currentEnvId]: env },
                currentASTNode: stmt
              },
              astNode: stmt
            };
            this.stateManager.updateState(step.stateChange);
            yield step;
          }
        }
      }
    }
  }

  private *drainMicrotasks() {
    const state = this.stateManager.getState();
    while (state.microtaskQueue.length > 0) {
      const task = state.microtaskQueue[0];
      const remainingQueue = state.microtaskQueue.slice(1);
      
      const step: EngineStep = {
        type: 'DEQUEUE_JOB',
        description: 'Draining microtask queue (Promise callback)',
        stateChange: { microtaskQueue: remainingQueue },
      };
      this.stateManager.updateState(step.stateChange);
      yield step;
    }
  }

  private resolveIdentifier(name: string): Value {
    const state = this.stateManager.getState();
    let currentEnvId: string | null = state.callStack[state.callStack.length - 1].lexicalEnvironment;
    
    while (currentEnvId) {
      const env: LexicalEnvironment = state.environments[currentEnvId];
      if (env.bindings[name]) {
        return env.bindings[name].value;
      }
      currentEnvId = env.outer;
    }
    
    return { type: 'primitive', value: undefined };
  }
}
