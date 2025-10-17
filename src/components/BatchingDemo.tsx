import { useRef, useState } from 'react';

/**
 * BatchingDemo - Demonstrates React 18's Automatic Batching
 * 
 * KEY CONCEPTS:
 * 1. Automatic Batching: React 18 automatically batches multiple state updates
 *    into a single re-render, even in async callbacks (setTimeout, promises, etc.)
 * 
 * 2. Before React 18: Multiple setState calls in async callbacks would cause
 *    multiple re-renders, leading to performance issues
 * 
 * 3. After React 18: All state updates are batched together, regardless of
 *    where they occur (event handlers, async callbacks, timeouts, etc.)
 */
export default function BatchingDemo() {
  // Two separate state variables to demonstrate batching
  const [a, setA] = useState(0);
  const [b, setB] = useState(0);
  
  // Track render count to visualize batching effect
  const renders = useRef(0);
  renders.current++; // Increment on every render

  /**
   * Simulates an async operation that triggers multiple state updates
   * 
   * In React 17 and earlier: This would cause 2 separate re-renders
   * In React 18+: This causes only 1 re-render (automatic batching)
   */
  function updateOutsideEventLoop() {
    setTimeout(() => {
      // These two setState calls are automatically batched together
      setA((x) => x + 1);  // State update 1
      setB((y) => y + 1);  // State update 2
      // Result: Only ONE re-render occurs, not two!
    }, 0);
  }

  return (
    <section>
      {/* Render counter helps visualize the batching effect */}
      <p>This component has rendered <strong>{renders.current}</strong> times.</p>
      
      {/* Button triggers async state updates to demonstrate batching */}
      <button onClick={updateOutsideEventLoop}>Increment A & B (batched)</button>
      
      {/* Display current state values */}
      <p>A: {a} — B: {b}</p>
      
      {/* Key takeaway for learners */}
      <small>
        Automatic batching ensures a single render for multiple state updates in async callbacks.
        <br />
        <strong>Try clicking the button multiple times and watch the render count!</strong>
      </small>
    </section>
  );
}