import { useReducer } from "react";

import Button from "./Button";

/**
 * ReducerDemo - Demonstrates useReducer Hook
 * 
 * KEY CONCEPTS:
 * 1. useReducer: Alternative to useState for complex state logic
 *    - Better for state that involves multiple sub-values
 *    - Predictable state updates through actions
 *    - Easier to test and debug
 * 
 * 2. Reducer Pattern: Pure function that takes (state, action) and returns new state
 *    - Actions describe "what happened" rather than "how to update"
 *    - State updates are centralized in one place
 *    - Follows Redux pattern but for local component state
 * 
 * 3. TypeScript Integration: Strong typing for actions and state
 *    - Prevents invalid action types
 *    - Provides better IDE support and error checking
 */

const initialState = { count: 0 };

type Action =
  | { type: "INCREMENT"; payload: number }
  | { type: "DECREMENT"; payload: string };

function reducer(state: typeof initialState, action: Action) {
  switch (action.type) {
    case "INCREMENT":
      return { count: state.count + action.payload };
    case "DECREMENT":
      return { count: state.count - Number(action.payload) };
    default:
      throw new Error();
  }
}

export default function ReducerDemo() {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <section>
      <p>Count: <strong>{state.count}</strong></p>
      <div className="space-x-2">
        <Button onClick={() => dispatch({ type: "DECREMENT", payload: "5" })}>
          -5
        </Button>
        <Button onClick={() => dispatch({ type: "INCREMENT", payload: 5 })}>
          +5
        </Button>
      </div>
      <small>
        useReducer provides predictable state updates through actions.
        <br />
        <strong>Try clicking the buttons to see centralized state management!</strong>
      </small>
    </section>
  );
}
