import { create } from "zustand";

type Todo = { id: string; text: string; done: boolean };
type State = {
  count: number;
  inc: () => void;
  dec: () => void;
  todos: Todo[];
  addTodo: (text: string) => void;
  toggle: (id: string) => void;
};

export const useZStore = create<State>((set) => ({
  count: 0,
  inc: () => set((s) => ({ count: s.count + 1 })),
  dec: () => set((s) => ({ count: s.count - 1 })),
  todos: [],
  addTodo: (text) => set((s) => ({ todos: [...s.todos, { id: Math.random().toString(36).slice(2), text, done: false }] })),
  toggle: (id) => set((s) => ({ todos: s.todos.map(t => t.id === id ? { ...t, done: !t.done } : t) }))
}));