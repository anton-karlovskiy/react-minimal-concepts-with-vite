import { useMemo, useState, useTransition } from "react";

import Input from "./UI/Input";
import Code from "./UI/Code";

/**
 * TransitionDemo - Demonstrates useTransition Hook
 * 
 * KEY CONCEPTS:
 * 1. useTransition: Mark state updates as non-urgent transitions
 *    - Keeps UI responsive during expensive operations
 *    - Allows React to interrupt and prioritize urgent updates
 *    - Provides isPending state to show loading indicators
 * 
 * 2. startTransition: Wrap state updates that can be deferred
 *    - Input remains responsive while filtering large lists
 *    - React can prioritize user interactions over filtering
 *    - Prevents blocking the main thread during heavy computations
 * 
 * 3. Performance Optimization: Better user experience with large datasets
 *    - Maintains input responsiveness during expensive filtering
 *    - Shows pending state to indicate background work
 *    - Demonstrates React's concurrent features in action
 */

const bigList = Array.from({length: 5000}, (_, index) => `Row ${index + 1}`);

function TransitionDemo() {
  const [query, setQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    return bigList.filter(item => item.toLowerCase().includes(query.toLowerCase()));
  }, [query]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;

    startTransition(() => {
      setQuery(value);
    });
  };

  return (
    <section className="space-y-2">
      <p>Type to filter 5k rows. Input remains responsive thanks to <Code>startTransition</Code>.</p>
      <Input
        placeholder="Filter..."
        onChange={handleChange} />
      {isPending && <p className="opacity-60"><em>Updating list…</em></p>}
      <ul className="max-h-[200px] overflow-auto">
        {filtered.map(item => <li key={item}>{item}</li>)}
      </ul>
    </section>
  );
}

export default TransitionDemo;