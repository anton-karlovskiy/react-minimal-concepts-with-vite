import { CountDisplay, Counter } from "./count";
import { CountProvider } from "./count-context";

function ContextDemo() {
  return (
    <CountProvider>
      <CountDisplay />
      <Counter />
    </CountProvider>
  );
}

export default ContextDemo;