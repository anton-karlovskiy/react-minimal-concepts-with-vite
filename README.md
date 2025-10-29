# React Minimal Concepts with Vite (TypeScript)

[![Vite](https://img.shields.io/badge/build-vite_5-646CFF.svg)](https://vitejs.dev)
[![React](https://img.shields.io/badge/react-modern-61DAFB.svg)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/typescript-5.x-3178C6.svg)](https://www.typescriptlang.org/)
[![Redux Toolkit](https://img.shields.io/badge/redux_toolkit-2.x-764ABC.svg)](https://redux-toolkit.js.org/)
[![Zustand](https://img.shields.io/badge/zustand-4.x-000.svg)](https://github.com/pmndrs/zustand)
[![TanStack Query](https://img.shields.io/badge/tanstack_query-5.x-FF4154.svg)](https://tanstack.com/query/latest)

Learn and compare modern React concepts in a tiny, fast Vite + TypeScript playground. This repo demonstrates automatic batching, transitions, React Actions (`useActionState`, `useFormStatus`), optimistic UI via `useOptimistic`, global state with Redux Toolkit vs Zustand, local state with `useReducer` and Context, and server-state with TanStack Query — all in one minimal project.

## Why this project?
- Explore the practical differences between Redux Toolkit and Zustand on identical examples.
- See modern React performance features (automatic batching, `startTransition`) in action.
- Try React Actions with optimistic updates and graceful error handling.
- Compare different state management approaches: global (Redux/Zustand) vs local (useReducer/Context).
- Understand where a server cache (TanStack Query) fits vs client state.

## Features at a glance
- **Automatic batching**: fewer renders during grouped updates.
- **Transitions**: snappy typing with deferred, expensive filtering.
- **React Actions**: `useActionState`, `useFormStatus` + **`useOptimistic`** for instant UI and rollback.
- **Redux Toolkit vs Zustand**: side‑by‑side global state demos.
- **useReducer**: predictable local state with action-based updates.
- **Context**: component tree state sharing with providers.
- **TanStack Query**: request caching, refetching, and status management with simulated latency.
- **Text Summarization**: AI-powered text summarization with model selection and progress tracking.
 - **Loading states with status enum**: replace `isLoading` booleans with an explicit status.

## Tech stack
- React, React DOM
- Vite 5, TypeScript 5
- Redux Toolkit, React Redux
- Zustand
- TanStack React Query 5
- Tailwind CSS 4 (via `@tailwindcss/vite`)

## Quick start
Prerequisite: Node.js 18+

```bash
# install
pnpm i   # or: npm i / yarn

# start dev server
pnpm dev # then open http://localhost:5173

# production build
pnpm build && pnpm preview
```

## Demos inside the app
- **Automatic Batching**: multiple `setTimeout` updates collapse into a single render.
- **Transitions**: filter a large list while keeping input responsive.
- **Redux Toolkit**: simple counter + todos with predictable state updates.
- **Zustand**: the same features with minimal boilerplate and hooks.
- **useReducer**: action-based state management for complex local state.
- **Context**: provider pattern for sharing state across component tree.
- **TanStack Query**: fake API with latency, caching, refetch.
- **Actions + useOptimistic**: optimistic note submit with error messaging.
- **Text Summarization**: model selection, download progress, and AI-powered summarization.
 - **Loading States (status enum)**: idle/pending/resolved/rejected vs `isLoading` boolean.

## Project structure
```
src/
  components/
    ActionsDemo.tsx         # React 19 Actions + optimistic UI
    BatchingDemo.tsx        # Automatic batching
    TransitionDemo.tsx      # startTransition demo
    ReduxDemo.tsx           # Redux Toolkit example
    ZustandDemo.tsx         # Zustand example
    QueryDemo.tsx           # TanStack Query example
    ReducerDemo.tsx         # useReducer example
    ContextDemo/            # Context + provider pattern
    SummarizerDemo.tsx      # Text summarization demo
    LoadingDemo.tsx         # Status enum over isLoading booleans
  state/                    # redux store + zustand store
  main.tsx, App.tsx
```

## Notes
- Uses modern React APIs where available (client form actions, `useActionState`, `useFormStatus`, `useOptimistic`).
- No real backend required; server-like calls are simulated for clarity.

## Troubleshooting
- Port already in use: change the dev port in `vite.config.ts` or stop the other process.
- Type errors on build: ensure TypeScript 5.x and React type packages are installed.

## Helpful links
- React docs: https://react.dev
- React concepts: https://react.dev/learn
- Redux Toolkit: https://redux-toolkit.js.org
- Zustand: https://github.com/pmndrs/zustand
- TanStack Query: https://tanstack.com/query/latest
- Vite: https://vitejs.dev
- Stop using isLoading booleans (Kent C. Dodds): https://kentcdodds.com/blog/stop-using-isloading-booleans

## SEO keywords (for discoverability)
React actions, useActionState, useFormStatus, useOptimistic, React transitions, startTransition, automatic batching, Redux Toolkit vs Zustand, useReducer, React Context, TanStack React Query, Vite React TypeScript starter, React features, optimistic UI example, React state management comparison, minimal React concepts demo