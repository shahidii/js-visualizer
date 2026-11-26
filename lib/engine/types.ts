export type Value = 
  | { type: 'primitive'; value: string | number | boolean | null | undefined }
  | { type: 'object'; id: string };

export interface MemoryObject {
  id: string;
  properties: Record<string, Value>;
  prototype: string | null; // ID of the prototype object
  type: 'object' | 'function' | 'array';
  functionBody?: any; // AST node
  name?: string;
}

export interface LexicalEnvironment {
  id: string;
  bindings: Record<string, { value: Value; kind: 'var' | 'let' | 'const' }>;
  outer: string | null; // ID of the outer lexical environment
}

export interface ExecutionContext {
  id: string;
  type: 'global' | 'function' | 'eval';
  lexicalEnvironment: string; // ID
  variableEnvironment: string; // ID
  thisValue: Value;
  phase: 'creation' | 'execution';
  functionName?: string;
}

export interface EngineState {
  callStack: ExecutionContext[];
  heap: Record<string, MemoryObject>;
  environments: Record<string, LexicalEnvironment>;
  microtaskQueue: any[];
  macrotaskQueue: any[];
  console: { type: 'log' | 'error' | 'warn'; content: any }[];
  currentASTNode: any;
}

export type StepType = 
  | 'CREATE_CONTEXT'
  | 'POP_CONTEXT'
  | 'BIND_VARIABLE'
  | 'ALLOCATE_OBJECT'
  | 'RESOLVE_IDENTIFIER'
  | 'EVALUATE_EXPRESSION'
  | 'ENQUEUE_JOB'
  | 'DEQUEUE_JOB'
  | 'PROMISE_STATE_CHANGE';

export interface EngineStep {
  type: StepType;
  description: string;
  stateChange: Partial<EngineState>;
  astNode?: any;
}
