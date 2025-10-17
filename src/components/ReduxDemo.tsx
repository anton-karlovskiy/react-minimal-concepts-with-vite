import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../state/store";
import { inc, dec, addTodo, toggleTodo } from "../state/store";
import { useState } from "react";

export default function ReduxDemo() {
  const dispatch = useDispatch();
  const value = useSelector((s: RootState) => s.counter.value);
  const todos = useSelector((s: RootState) => s.todos);
  const [text, setText] = useState("");

  return (
    <section>
      <p><strong>Redux Toolkit</strong>: predictable global state with immutable updates + devtools.</p>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={() => dispatch(dec())}>-</button>
        <div style={{ minWidth: 40, textAlign: "center" }}>{value}</div>
        <button onClick={() => dispatch(inc())}>+</button>
      </div>

      <div style={{ marginTop: 12 }}>
        <form onSubmit={(e) => { e.preventDefault(); if (text.trim()) { dispatch(addTodo(text)); setText(""); } }}>
          <input value={text} onChange={e => setText(e.target.value)} placeholder="Add todo…" />
          <button type="submit" style={{ marginLeft: 8 }}>Add</button>
        </form>
        <ul style={{ marginTop: 8 }}>
          {todos.map(t => (
            <li key={t.id}>
              <label>
                <input type="checkbox" checked={t.done} onChange={() => dispatch(toggleTodo(t.id))} />
                {" "}<span style={{ textDecoration: t.done ? "line-through" : "none" }}>{t.text}</span>
              </label>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}