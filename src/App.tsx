import { Provider } from 'react-redux';

import TransitionDemo from './components/TransitionDemo';
import BatchingDemo from './components/BatchingDemo';
import ActionsDemo from './components/ActionsDemo';
import ReduxDemo from './components/ReduxDemo';
import ZustandDemo from './components/ZustandDemo';
import QueryDemo from './components/QueryDemo';
import ReducerDemo from './components/ReducerDemo';
import { store } from './state/store';

export default function App() {
  return (
    <Provider store={store}>
      <main>
        <h1>React 18/19 Minimal</h1>
        <small>Features: automatic batching, transitions, actions + optimistic UI, Redux vs Zustand, TanStack Query</small>
        <div className="row">
          <div className="card" style={{flex: '1 1 360px'}}>
            <h2>Automatic Batching</h2>
            <BatchingDemo />
          </div>
          <div className="card" style={{flex: '1 1 360px'}}>
            <h2>Transitions</h2>
            <TransitionDemo />
          </div>
        </div>
        <div className="row">
          <div className="card" style={{flex: '1 1 360px'}}>
            <h2>Redux Toolkit</h2>
            <ReduxDemo />
          </div>
          <div className="card" style={{flex: '1 1 360px'}}>
            <h2>Zustand</h2>
            <ZustandDemo />
          </div>
        </div>
        <div className="row">
          <div className="card" style={{flex: '1 1 360px'}}>
            <h2>useReducer</h2>
            <ReducerDemo />
          </div>
        </div>
        <div className="card">
          <h2>TanStack Query</h2>
          <QueryDemo />
        </div>
        <div className="card">
          <h2>Actions + useOptimistic (React 19)</h2>
          <ActionsDemo />
        </div>
      </main>
    </Provider>
  );
}