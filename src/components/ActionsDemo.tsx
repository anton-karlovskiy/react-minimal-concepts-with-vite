import { useActionState, useOptimistic } from "react";
import { useFormStatus } from "react-dom";
import { useState } from "react";

import Button from "./UI/Button";
import Code from "./UI/Code";
import Textarea from "./UI/Textarea";

/**
 * ActionsDemo - Demonstrates React 19 Actions and Optimistic Updates
 * 
 * KEY CONCEPTS:
 * 1. useActionState: Server actions with built-in state management
 *    - Handles form submissions with automatic loading states
 *    - Provides error handling and success states
 *    - Integrates seamlessly with server-side form processing
 * 
 * 2. useOptimistic: Instant UI updates with automatic rollback
 *    - Shows optimistic updates immediately for better UX
 *    - Automatically reverts on server errors
 *    - Maintains UI consistency during async operations
 * 
 * 3. useFormStatus: Access form state from child components
 *    - Submit buttons can access pending state
 *    - Enables proper loading indicators
 *    - Works with server actions and form submissions
 */

interface Note {
  id: string;
  text: string;
}

async function postNoteServerLike(data: { text: string }): Promise<Note> {
  // Simulate latency
  await new Promise(r => setTimeout(r, 900));
  // Random failure to demonstrate error handling/rollback
  if (Math.random() < 0.2) {
    throw new Error("Random failure – please retry");
  }
  return {
    id: Math.random().toString(36).slice(2),
    ...data
  };
}

// Submit button that knows when the form is pending
function SubmitButton() {
  const status = useFormStatus();
  return (
    <Button type="submit" disabled={status.pending}>
      {status.pending ? "Saving…" : "Add Note"}
    </Button>
  );
}

function ActionsDemo() {
  const [notes, setNotes] = useState<Note[]>([]);

  // Optimistic list that updates instantly while server is pending
  const [optimisticNotes, addOptimisticNote] = useOptimistic(
    notes,
    (state, newItem: Note) => {
      return [...state, newItem];
    }
  );

  type FormState = string | null;

  // The action that the <form> will call
  async function addNote(
    prevState: FormState,
    formData: FormData
  ): Promise<FormState> {
    const text = String(formData.get("text") || "").trim();
    if (!text) return "Please enter some text";

    // 1) optimistic add
    const temp: Note = {
      id: "temp-" + Date.now(),
      text
    };
    addOptimisticNote(temp);

    try {
      // 2) “server” call
      const saved = await postNoteServerLike({ text });
      // 3) reconcile success with real state
      setNotes((prev) => [...prev, saved]);
      return null; // no error
    } catch (error: any) {
      // No need to explicitly remove optimistic item:
      // optimistic list is derived from `notes`, which we only update on success.
      return error?.message || "Failed to save";
    }
  }

  // Bind the action to the form & expose last error message (if any)
  const [state, formAction] = useActionState(addNote, null);

  return (
    <section className="space-y-2">
      <p>React 19 <Code>{"<form action={...}>"}</Code> + <Code>useActionState</Code> (submit + error handling) + <Code>useFormStatus</Code> (pending state on the button) + <Code>useOptimistic</Code> (instant UI while the server works)</p>
      <form action={formAction} className={state ? "opacity-60" : ""}>
        <Textarea name="text" placeholder="Write a note…" rows={3} />
        <div className="mt-2">
          <SubmitButton />
          {state && <span className="ml-3 text-[#ffb3b3]">{state}</span>}
        </div>
      </form>
      <ul>
        {optimisticNotes.map(item => (
          <li key={item.id}>
            • {item.text}
            {String(item.id).startsWith("temp-") && (
              <em className="opacity-60 ml-2"> (saving…)</em>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

export default ActionsDemo;