# React Minimal Concepts with Vite (TypeScript)

[![Vite](https://img.shields.io/badge/build-vite_5-646CFF.svg)](https://vitejs.dev)
[![React](https://img.shields.io/badge/react-modern-61DAFB.svg)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/typescript-5.x-3178C6.svg)](https://www.typescriptlang.org/)
[![Redux Toolkit](https://img.shields.io/badge/redux_toolkit-2.x-764ABC.svg)](https://redux-toolkit.js.org/)
[![Zustand](https://img.shields.io/badge/zustand-4.x-000.svg)](https://github.com/pmndrs/zustand)
[![TanStack Query](https://img.shields.io/badge/tanstack_query-5.x-FF4154.svg)](https://tanstack.com/query/latest)
[![Transformers.js](https://img.shields.io/badge/transformers.js-trending_FF?logo=huggingface&logoColor=white&labelColor=FFD21E&color=555)](https://huggingface.co/models?library=transformers.js)
[![Best Practices](https://img.shields.io/badge/best_practices-kentcdodds.com-000000.svg)](https://kentcdodds.com)

Learn and compare modern React concepts in a tiny, fast Vite + TypeScript playground. Explore focused, side‑by‑side demos covering performance primitives (automatic batching, transitions), modern Actions/form APIs, optimistic UI, status‑driven loading, global vs local state, server cache with TanStack Query, and practical AI integrations — all in one minimal project.

## Why this project?
- Learn by experimenting with focused, side-by-side demos of modern React concepts.
- Compare state management approaches (Redux Toolkit, Zustand, `useReducer`, Context) in identical scenarios.
- Practice real-world async UX patterns: status-driven loading, optimistic UI, transitions, and error/retry.
- See where a server cache (TanStack Query) complements client state.
- Explore practical AI integrations (e.g., text summarization with model selection and progress).

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
- Transformers.js (Hugging Face)
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
    ActionsDemo.tsx         # React Actions + optimistic UI
    BatchingDemo.tsx        # Automatic batching
    ContextDemo/            # Context + provider pattern
    LoadingDemo.tsx         # Status enum over isLoading booleans
    QueryDemo.tsx           # TanStack Query example
    ReducerDemo.tsx         # useReducer example
    ReduxDemo.tsx           # Redux Toolkit example
    SummarizerDemo.tsx      # AI text summarization demo
    TransitionDemo.tsx      # startTransition demo
    ZustandDemo.tsx         # Zustand example
  hooks/
    useSummarizer.ts        # Hook for summarizer worker + model loading
  state/                    # Redux store + Zustand store
    store.ts
    zustand.ts
  workers/
    summarizer.worker.ts    # Web Worker powering text summarization
  style.css
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
- Transformers.js models (AI on the web): https://huggingface.co/models?library=transformers.js
- Best practices (Kent C. Dodds): https://kentcdodds.com

## SEO keywords (for discoverability)
React actions, useActionState, useFormStatus, useOptimistic, optimistic UI, React transitions, startTransition, automatic batching, status-driven loading, loading states enum, idle/pending/resolved/rejected, Redux Toolkit vs Zustand, Redux Toolkit, Zustand, useReducer, React Context, TanStack React Query, server cache, Transformers.js, Hugging Face, AI summarization, text summarization, model selection, on-device AI, web workers, progress bar, Vite React TypeScript starter, React features, React state management comparison, minimal React concepts demo