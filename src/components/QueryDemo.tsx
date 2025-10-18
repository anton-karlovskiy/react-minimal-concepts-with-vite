import { useQuery, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

import Button from "./UI/Button";
import Input from "./UI/Input";

const client = new QueryClient();

async function fetchUsers(q: string) {
  await new Promise(r => setTimeout(r, 700));
  const all = [
    { id: 1, name: "Anton" },
    { id: 2, name: "Ikem" },
    { id: 3, name: "Ishan" },
    { id: 4, name: "Diane" },
    { id: 5, name: "Kai" },
  ];
  if (!q) return all;
  return all.filter(u => u.name.toLowerCase().includes(q.toLowerCase()));
}

function UsersList() {
  const [query, setQuery] = useState("");
  const { data, isPending, isFetching, refetch } = useQuery({
    queryKey: ["users", query],
    queryFn: () => fetchUsers(query),
    staleTime: 10_000
  });

  return (
    <section>
      <p><strong>TanStack Query</strong>: server cache for async data (dedup, caching, status).</p>
      <Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Filter users..." />
      <Button onClick={() => refetch()} className="ml-2">Refetch</Button>
      {(isPending || isFetching) && <p><em>Loading…</em></p>}
      <ul style={{ marginTop: 8 }}>
        {(data ?? []).map(u => <li key={u.id}>{u.name}</li>)}
      </ul>
    </section>
  );
}

export default function QueryDemo() {
  return (
    <QueryClientProvider client={client}>
      <UsersList />
    </QueryClientProvider>
  );
}