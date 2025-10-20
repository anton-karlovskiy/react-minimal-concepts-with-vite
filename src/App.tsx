import { Provider } from "react-redux";

import TransitionDemo from "./components/TransitionDemo";
import BatchingDemo from "./components/BatchingDemo";
import ActionsDemo from "./components/ActionsDemo";
import ReduxDemo from "./components/ReduxDemo";
import ZustandDemo from "./components/ZustandDemo";
import QueryDemo from "./components/QueryDemo";
import ReducerDemo from "./components/ReducerDemo";
import ContextDemo from "./components/ContextDemo";
import Card from "./components/UI/Card";
import Small from "./components/UI/Small";
import DemoTitle from "./components/UI/DemoTitle";
import { store } from "./state/store";

export default function App() {
  return (
    <Provider store={store}>
      <main className="p-6 bg-[#0b0b0c] text-[#f5f7fb]">
        <h1 className="my-2">React 18/19 Minimal</h1>
        <Small>Features: automatic batching, transitions, actions + optimistic UI, Redux vs Zustand, TanStack Query</Small>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <DemoTitle>Automatic Batching</DemoTitle>
              <BatchingDemo />
            </Card>
            <Card>
              <DemoTitle>Transitions</DemoTitle>
              <TransitionDemo />
            </Card>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <DemoTitle>Redux Toolkit</DemoTitle>
              <ReduxDemo />
            </Card>
            <Card>
              <DemoTitle>Zustand</DemoTitle>
              <ZustandDemo />
            </Card>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <DemoTitle>useReducer</DemoTitle>
              <ReducerDemo />
            </Card>
            <Card>
              <DemoTitle>Context</DemoTitle>
              <ContextDemo />
            </Card>
          </div>
          <Card>
            <DemoTitle>TanStack Query</DemoTitle>
            <QueryDemo />
          </Card>
          <Card>
            <DemoTitle>Actions + useOptimistic (React 19)</DemoTitle>
            <ActionsDemo />
          </Card>
        </div>
      </main>
    </Provider>
  );
}