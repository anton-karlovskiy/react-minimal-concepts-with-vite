import { useState } from "react";

import Button from "./UI/Button";
import Input from "./UI/Input";
import { useZStore } from "../state/zustand";

export default function ZustandDemo() {
  const count = useZStore(s => s.count);
  const inc = useZStore(s => s.inc);
  const dec = useZStore(s => s.dec);
  const todos = useZStore(s => s.todos);
  const addTodo = useZStore(s => s.addTodo);
  const toggle = useZStore(s => s.toggle);
  const [text, setText] = useState("");

  return (
    <section>
      <p><strong>Zustand</strong>: tiny, hook-first store with minimal boilerplate.</p>
      <div style={{ display: "flex", gap: 8 }}>
        <Button onClick={dec}>-</Button>
        <div style={{ minWidth: 40, textAlign: "center" }}>{count}</div>
        <Button onClick={inc}>+</Button>
      </div>

      <div style={{ marginTop: 12 }}>
        <form onSubmit={(e) => { e.preventDefault(); if (text.trim()) { addTodo(text); setText(""); } }}>
          <Input value={text} onChange={e => setText(e.target.value)} placeholder="Add todo…" />
          <Button type="submit" className="ml-2">Add</Button>
        </form>
        <ul style={{ marginTop: 8 }}>
          {todos.map(t => (
            <li key={t.id}>
              <label>
                <input type="checkbox" checked={t.done} onChange={() => toggle(t.id)} />
                {" "}<span style={{ textDecoration: t.done ? "line-through" : "none" }}>{t.text}</span>
              </label>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}