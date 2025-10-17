import { useActionState, useOptimistic } from "react";
import { useFormStatus } from "react-dom";
import { useState } from "react";

async function postNoteServerLike(data: { text: string }) {
  await new Promise(r => setTimeout(r, 900));
  if (Math.random() < 0.2) {
    throw new Error("Random failure – please retry");
  }
  return { id: Math.random().toString(36).slice(2), ...data };
}

function SubmitStatus() {
  const status = useFormStatus();
  return (
    <button type="submit" disabled={status.pending}>
      {status.pending ? "Saving…" : "Add Note"}
    </button>
  );
}

export default function ActionsDemo() {
  const [notes, setNotes] = useState<{id: string, text: string}[]>([]);
  const [optimisticNotes, addOptimisticNote] = useOptimistic(notes, (state, newItem: {id: string, text: string}) => {
    return [...state, newItem];
  });

  async function addNote(prevState: string | null, formData: FormData) {
    const text = String(formData.get("text") || "").trim();
    if (!text) return "Please enter some text";
    const tempId = "temp-" + Date.now();
    addOptimisticNote({ id: tempId, text });

    try {
      const saved = await postNoteServerLike({ text });
      setNotes((list) => [...list, saved]);
      return null;
    } catch (e: any) {
      return e?.message || "Failed to save";
    }
  }

  const [error, formAction] = useActionState(addNote, null as string | null);

  return (
    <section>
      <p>React 19 form <code>action</code> + <code>useActionState</code> + <code>useOptimistic</code> for instant UX.</p>
      <form action={formAction} className={error ? "pending" : ""}>
        <textarea name="text" placeholder="Write a note…" rows={3} />
        <div style={{ marginTop: 8 }}>
          <SubmitStatus />
          {error && <span style={{ marginLeft: 12, color: "#ffb3b3" }}>{error}</span>}
        </div>
      </form>

      <ul style={{ marginTop: 12 }}>
        {optimisticNotes.map(n => (
          <li key={n.id}>• {n.text}</li>
        ))}
      </ul>
    </section>
  );
}