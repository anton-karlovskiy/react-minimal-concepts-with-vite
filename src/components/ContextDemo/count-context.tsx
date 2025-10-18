import { createContext, useContext, useReducer, ReactNode } from "react";

type Action = { type: 'INCREMENT'; payload: number } | { type: 'DECREMENT'; payload: number };
type Dispatch = (action: Action) => void;
type State = { count: number };

interface CountProviderProps {
  children: ReactNode;
}

const CountContext = createContext<
  { state: State; dispatch: Dispatch; } | undefined
>(undefined);

function countReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'INCREMENT': {
      return { count: state.count + action.payload };
    }
    case 'DECREMENT': {
      return { count: state.count - action.payload };
    }
    default: {
      throw new Error(`Unhandled action type: ${action}`);
    }
  }
}

const initialState: State = { count: 0 };

function CountProvider({ children }: CountProviderProps) {
  const [state, dispatch] = useReducer(countReducer, initialState);

  const value = { state, dispatch };

  return <CountContext.Provider value={value}>{children}</CountContext.Provider>;
}

function useCount() {
  const context = useContext(CountContext);
  if (context === undefined) {
      throw new Error('useCount must be used within a CountProvider');
  }

  return context;
}

export { CountProvider, useCount };