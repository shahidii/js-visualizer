import { EngineState, ExecutionContext, LexicalEnvironment, MemoryObject, Value } from './types';

export class StateManager {
  private history: string[] = [];
  private currentState: EngineState;

  constructor() {
    this.currentState = this.getInitialState();
  }

  private getInitialState(): EngineState {
    const globalEnvId = 'env_global';
    const globalContextId = 'ctx_global';
    
    const globalEnv: LexicalEnvironment = {
      id: globalEnvId,
      bindings: {},
      outer: null,
    };

    const globalContext: ExecutionContext = {
      id: globalContextId,
      type: 'global',
      lexicalEnvironment: globalEnvId,
      variableEnvironment: globalEnvId,
      thisValue: { type: 'object', id: 'obj_window' },
      phase: 'creation',
    };

    const windowObj: MemoryObject = {
      id: 'obj_window',
      type: 'object',
      properties: {},
      prototype: null,
      name: 'window',
    };

    return {
      callStack: [globalContext],
      heap: { 'obj_window': windowObj },
      environments: { [globalEnvId]: globalEnv },
      microtaskQueue: [],
      macrotaskQueue: [],
      console: [],
      currentASTNode: null,
    };
  }

  public saveStep() {
    this.history.push(JSON.stringify(this.currentState));
  }

  public rollback(): EngineState | null {
    if (this.history.length > 0) {
      const lastState = this.history.pop()!;
      this.currentState = JSON.parse(lastState);
      return this.currentState;
    }
    return null;
  }

  public getState(): EngineState {
    return this.currentState;
  }

  public updateState(change: Partial<EngineState>) {
    this.currentState = { ...this.currentState, ...change };
  }

  public setState(state: EngineState) {
    this.currentState = state;
  }
}
