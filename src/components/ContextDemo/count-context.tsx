import { createContext, useContext, useReducer } from "react";

/**
 * ContextDemo - Demonstrates React Context with useReducer
 * 
 * KEY CONCEPTS:
 * 1. React Context: Share state across component tree without prop drilling
 *    - Provider wraps components that need access to shared state
 *    - Consumer components access state via useContext hook
 *    - Avoids passing props through multiple component levels
 * 
 * 2. Context + useReducer Pattern: Powerful state management combination
 *    - Context provides global access to state
 *    - useReducer handles complex state logic with actions
 *    - Centralized state updates with predictable behavior
 * 
 * 3. Custom Hooks: Encapsulate context logic for better developer experience
 *    - useCount hook provides type-safe access to context
 *    - Error boundaries prevent misuse outside Provider
 *    - Single source of truth for context consumption
 * 
 * Based on Kent C. Dodds' best practices:
 * @see https://kentcdodds.com/blog/how-to-use-react-context-effectively
 */

type Action = { type: 'INCREMENT'; payload: number } | { type: 'DECREMENT'; payload: number };
type Dispatch = (action: Action) => void;
type State = { count: number };

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

interface CountProviderProps {
  children: React.ReactNode;
}

function CountProvider({ children }: CountProviderProps) {
  const [state, dispatch] = useReducer(countReducer, initialState);

  // NOTE: You might need to memoize this value for performance
  // Learn more: https://kcd.im/optimize-context
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