import { Provider } from "react-redux";

import TransitionDemo from "./components/TransitionDemo";
import BatchingDemo from "./components/BatchingDemo";
import ActionsDemo from "./components/ActionsDemo";
import ReduxDemo from "./components/ReduxDemo";
import ZustandDemo from "./components/ZustandDemo";
import QueryDemo from "./components/QueryDemo";
import ReducerDemo from "./components/ReducerDemo";
import ContextDemo from "./components/ContextDemo";
import Card from "./components/Card";
import { store } from "./state/store";

export default function App() {
  return (
    <Provider store={store}>
      <main>
        <h1>React 18/19 Minimal</h1>
        <small>Features: automatic batching, transitions, actions + optimistic UI, Redux vs Zustand, TanStack Query</small>
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <h2>Automatic Batching</h2>
              <BatchingDemo />
            </Card>
            <Card>
              <h2>Transitions</h2>
              <TransitionDemo />
            </Card>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <h2>Redux Toolkit</h2>
              <ReduxDemo />
            </Card>
            <Card>
              <h2>Zustand</h2>
              <ZustandDemo />
            </Card>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <h2>useReducer</h2>
              <ReducerDemo />
            </Card>
            <Card>
              <h2>Context</h2>
              <ContextDemo />
            </Card>
          </div>
          <Card>
            <h2>TanStack Query</h2>
            <QueryDemo />
          </Card>
          <Card>
            <h2>Actions + useOptimistic (React 19)</h2>
            <ActionsDemo />
          </Card>
        </div>
      </main>
    </Provider>
  );
}