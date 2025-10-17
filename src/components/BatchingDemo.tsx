import { useRef, useState } from 'react'

export default function BatchingDemo() {
  const [a, setA] = useState(0)
  const [b, setB] = useState(0)
  const renders = useRef(0)
  renders.current++

  function updateOutsideEventLoop() {
    setTimeout(() => {
      setA((x) => x + 1)
      setB((y) => y + 1)
    }, 0)
  }

  return (
    <section>
      <p>This component has rendered <strong>{renders.current}</strong> times.</p>
      <button onClick={updateOutsideEventLoop}>Increment A & B (batched)</button>
      <p>A: {a} — B: {b}</p>
      <small>Automatic batching ensures a single render for multiple state updates in async callbacks.</small>
    </section>
  )
}