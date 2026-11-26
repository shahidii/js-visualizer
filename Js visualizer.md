
## 0. Core Principle (Non-Negotiable)

**Debugger ≠ line-based**
This visualizer steps through **engine phases**, not just source lines.

Every “step” corresponds to:

* Spec-level operation
* Runtime state transition

---

## 1. Overall Screen Layout (Authoritative Order)

![Image](https://developer.chrome.com/static/docs/devtools/javascript/image/debugger-in-wide-window.png)

![Image](https://media.geeksforgeeks.org/wp-content/uploads/20191021114256/881.png)

![Image](https://blog.openreplay.com/images/explaining-javascript-s-execution-context-and-stack/images/mFQtgsb.png)

![Image](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Execution_model/runtime-environment-diagram.svg)

```
┌─────────────────────────────────────────────┐
│ Code Editor (VS Code style)                  │
│ ─────────────────────────────────────────── │
│ ▶ Run  ⏸ Pause  ⏮ Step Back  ⏭ Step Forward │
└─────────────────────────────────────────────┘

┌──────────────┬──────────────────────────────┐
│ Console      │ Call Stack                    │
│ (Terminal)   │ Execution Context Stack       │
└──────────────┴──────────────────────────────┘

┌─────────────────────────────────────────────┐
│ Global Execution Context (Expanded)          │
└─────────────────────────────────────────────┘

┌──────────────┬──────────────┬───────────────┐
│ Memory Heap  │ Stack Memory │ Scope Chain    │
└──────────────┴──────────────┴───────────────┘

┌─────────────────────────────────────────────┐
│ Event Loop + Queues + Web APIs               │
└─────────────────────────────────────────────┘
```

This order matches **actual engine reasoning flow**.

---

## 2. Code Editor (Top)

### Requirements

* Monaco Editor (VS Code core)
* Breakpoints
* Highlight current AST node, not just line
* Inline markers:

  * Hoisting
  * TDZ
  * Async boundary
  * Closure capture

### Controls

* ▶ Run (continuous)
* ⏸ Pause
* ⏭ Step (semantic step)
* ⏮ Step back (state rewind)
* Reset

**Step ≠ next line**
Step = next runtime action.

---

## 3. Console / Terminal (Right Below Editor)

### Behaves like real console

* `console.log`
* Errors
* Promise states when logged
* Object references, expandable

### Critical

Logged objects update **live**, not snapshot.

This teaches reference behavior.

---

## 4. Call Stack + Execution Context Stack

### Call Stack (Visual)

Shows:

```
foo()
bar()
Global()
```

### Selecting a frame reveals:

#### Execution Context Internals

* Context type (Global / Function / Module)
* Phase

  * Creation
  * Execution
* `this` binding
* Lexical Environment
* Variable Environment

Animate:

* Push on call
* Pop on return
* Pause on creation phase

---

## 5. Global Execution Context (Dedicated Panel)

Always visible.

Shows:

* Global object bindings
* Global lexical env
* Global variable env
* `this === window | globalThis`

Why separate?
Because everything roots here.

---

## 6. Memory Model Panel (Core Learning Area)

### 6.1 Stack Memory

* Primitive values
* Function call frames
* Execution context references

Example:

```
a → 10
b → ref → Object #12
```

---

### 6.2 Heap Memory

Objects displayed as nodes:

```
Object #12
  x: 10
  y: Object #19
  [[Prototype]] → Object #3
```

Features:

* Reference arrows
* Shared references highlighted
* GC eligibility preview

---

### 6.3 Scope Chain Graph

Graph view:

```
foo LE ──▶ block LE ──▶ global LE
```

When resolving identifier:

* Active lookup path highlighted
* Owning scope emphasized

This makes closures obvious.

---

## 7. Prototype Chain Inspector (Contextual)

When selecting:

* Object
* Function
* Class

Show:

* `obj`
* `obj.__proto__`
* `constructor.prototype`
* End at `null`

Animate property access resolution.

---

## 8. Event Loop System (Bottom)

![Image](https://miro.medium.com/1%2AVJsawOs5rNQxQiJYzgwJxQ.png)

![Image](https://media2.dev.to/dynamic/image/width%3D800%2Cheight%3D%2Cfit%3Dscale-down%2Cgravity%3Dauto%2Cformat%3Dauto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fi%2Fqx1tsr9ao6f2quxdzyzs.png)

![Image](https://miro.medium.com/v2/resize%3Afit%3A1400/1%2AzqOl9dPFII2XpDGijRZCqA.jpeg)

### Components

* Call Stack
* Web APIs
* Microtask Queue
* Macrotask Queue
* Animation Frame Queue (optional)

### Visual Rules

* Microtasks drain fully
* One macrotask per tick
* Call stack must be empty

Animate:

* Promise resolution
* `then` enqueue
* Queue draining

---

## 9. Promise / Async Internals Panel

When promise is selected:

```
Promise #7
State: fulfilled
Value: 42
Reactions:
  then → Promise #8
```

For async functions:

* Implicit promise creation
* Resume points
* Await suspension

---

## 10. Hoisting & TDZ Phase Toggle

Toggle: **Creation Phase View**

Before execution:

* `var` → undefined
* `let/const` → <uninitialized>
* Functions allocated

Stepping from creation → execution shows hoisting truthfully.

---

## 11. `this` Binding Resolver

On function entry:

* Highlight rule applied:

  * new
  * explicit
  * implicit
  * default
  * arrow (lexical)

Shows exact reason, not description.

---

## 12. Strict / Sloppy Mode Toggle

One switch.

Visual differences:

* `this` default
* Silent errors vs throws
* Global leakage

---

## 13. Time Travel Debugging (Mandatory)

Because JS is deterministic.

Requirements:

* Full runtime state snapshots
* Reverse stepping
* No console hacks

This is what makes it superior to Chrome DevTools.

---

## 14. Execution Step Taxonomy (Very Important)

Steps include:

* Create execution context
* Bind parameters
* Hoist declarations
* Resolve identifier
* Evaluate expression
* Enqueue job
* Dequeue job
* Resolve promise
* GC mark phase (optional)

User steps through **engine logic**, not code.

---

## 15. What This Tool Teaches That Others Don’t

* Why closures retain memory
* Why async order behaves weird
* Why `this` changes
* Why prototype lookup works
* Why objects mutate across scopes
* Why GC does or doesn’t collect

---

## Final Reality Check

If the tool can visually explain:

```js
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0);
}
```

without **any text explanation**, then the design is correct.

---

* exact runtime data structures
* step-by-step execution of one code sample
* map ECMAScript spec → visual actions

