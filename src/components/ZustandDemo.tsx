import { useZStore } from '../state/zustand'
import { useState } from 'react'

export default function ZustandDemo() {
  const count = useZStore(s => s.count)
  const inc = useZStore(s => s.inc)
  const dec = useZStore(s => s.dec)
  const todos = useZStore(s => s.todos)
  const addTodo = useZStore(s => s.addTodo)
  const toggle = useZStore(s => s.toggle)
  const [text, setText] = useState('')

  return (
    <section>
      <p><strong>Zustand</strong>: tiny, hook-first store with minimal boilerplate.</p>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={dec}>-</button>
        <div style={{ minWidth: 40, textAlign: 'center' }}>{count}</div>
        <button onClick={inc}>+</button>
      </div>

      <div style={{ marginTop: 12 }}>
        <form onSubmit={(e) => { e.preventDefault(); if (text.trim()) { addTodo(text); setText('') } }}>
          <input value={text} onChange={e => setText(e.target.value)} placeholder="Add todo…" />
          <button type="submit" style={{ marginLeft: 8 }}>Add</button>
        </form>
        <ul style={{ marginTop: 8 }}>
          {todos.map(t => (
            <li key={t.id}>
              <label>
                <input type="checkbox" checked={t.done} onChange={() => toggle(t.id)} />
                {' '}<span style={{ textDecoration: t.done ? 'line-through' : 'none' }}>{t.text}</span>
              </label>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}