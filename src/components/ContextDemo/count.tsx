import { useCount } from "./count-context";

function CountDisplay() {
  const { state } = useCount();

  return (
    <div>
      The current count is {state.count}.
    </div>
  );
}

function Counter() {
  const { dispatch } = useCount();

  return (
    <div className="space-x-2">
      <button onClick={() => dispatch({ type: 'INCREMENT', payload: 1 })}>Increment</button>
      <button onClick={() => dispatch({ type: 'DECREMENT', payload: 1 })}>Decrement</button>
    </div>
  );
}

export { CountDisplay, Counter };