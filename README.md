# React 18/19 Minimal — batching, transitions, actions, Redux vs Zustand, TanStack Query

A tiny Vite + React + TypeScript app showcasing:
- **Automatic batching** (React 18+)
- **Transitions** via `startTransition` (React 18)
- **React 19 Actions**: `useActionState`, `useFormStatus`, **`useOptimistic`**
- **Redux Toolkit** vs **Zustand** global state
- **TanStack Query** server cache

## Prereqs
- Node 18+

## Quickstart
```bash
pnpm i   # or npm i / yarn
pnpm dev # http://localhost:5173
```

## Sections
- **Batching Demo**: multiple state updates in `setTimeout` → single render.
- **Transitions Demo**: filter 5k rows without janky typing.
- **Redux Toolkit**: counter + todos.
- **Zustand**: the same with less boilerplate.
- **TanStack Query**: fake API with latency, caching, refetch.
- **Actions Demo**: optimistic note submit with error handling.

## Notes
- Uses `"react": "^19"` features including client **form actions** where applicable.
- No backend required; server-like calls are simulated.