import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';

type Todo = { id: string; text: string; done: boolean };

const counterSlice = createSlice({
  name: 'counter',
  initialState: { value: 0 },
  reducers: {
    inc(state) { state.value += 1; },
    dec(state) { state.value -= 1; },
    add(state, action: PayloadAction<number>) { state.value += action.payload; }
  }
});

const todosSlice = createSlice({
  name: 'todos',
  initialState: [] as Todo[],
  reducers: {
    addTodo(state, action: PayloadAction<string>) {
      state.push({ id: Math.random().toString(36).slice(2), text: action.payload, done: false });
    },
    toggleTodo(state, action: PayloadAction<string>) {
      const t = state.find(x => x.id === action.payload);
      if (t) t.done = !t.done;
    }
  }
});

export const { inc, dec, add } = counterSlice.actions;
export const { addTodo, toggleTodo } = todosSlice.actions;

export const store = configureStore({
  reducer: {
    counter: counterSlice.reducer,
    todos: todosSlice.reducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;