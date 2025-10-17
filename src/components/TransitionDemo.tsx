import { useMemo, useState, useTransition } from 'react';

const bigList = Array.from({length: 5000}, (_, i) => `Row ${i + 1}`);

export default function TransitionDemo() {
  const [query, setQuery] = useState('');
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    let result: string[] = [];
    for (let i = 0; i < bigList.length; i++) {
      const v = bigList[i];
      if (v.toLowerCase().includes(q)) result.push(v);
    }
    return result;
  }, [query]);

  return (
    <section>
      <p>Type to filter 5k rows. Input remains responsive thanks to <code>startTransition</code>.</p>
      <input
        placeholder="Filter..."
        onChange={(e) => {
          const v = e.target.value;
          startTransition(() => setQuery(v));
        }}
      />
      {isPending && <p><em>Updating list…</em></p>}
      <ul style={{ maxHeight: 200, overflow: 'auto', marginTop: 8 }}>
        {filtered.map((row) => <li key={row}>{row}</li>)}
      </ul>
    </section>
  );
}