import { useMemo, useState, useTransition } from "react";

import Input from "./UI/Input";
import Code from "./UI/Code";

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
    <section>
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