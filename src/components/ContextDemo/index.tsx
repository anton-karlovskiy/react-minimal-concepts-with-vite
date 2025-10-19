import { CountDisplay, Counter } from "./count";
import { CountProvider } from "./count-context";

function ContextDemo() {
  return (
    <CountProvider>
      <section className="space-y-2">
        <CountDisplay />
        <Counter />
      </section>
    </CountProvider>
  );
}

export default ContextDemo;