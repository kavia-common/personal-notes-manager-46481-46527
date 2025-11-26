import { component$, $, useSignal, useTask$ } from "@builder.io/qwik";
import type { PropFunction } from "@builder.io/qwik";
import type { Note } from "~/services/notes";

export interface NoteCardProps {
  note: Note;
  // PUBLIC_INTERFACE
  onEdit$: PropFunction<(id: string, data: { title: string; content: string }) => Promise<void> | void>;
  // PUBLIC_INTERFACE
  onDelete$: PropFunction<(id: string) => Promise<void> | void>;
}

export const NoteCard = component$<NoteCardProps>(({ note, onEdit$, onDelete$ }) => {
  const editing = useSignal(false);
  const title = useSignal(note.title);
  const content = useSignal(note.content);
  const busy = useSignal(false);

  useTask$(({ track }) => {
    // Update local signals if parent note changes
    track(() => note.id);
    title.value = note.title;
    content.value = note.content;
  });

  const onEditWrapped$ = $(
    async (id: string, data: { title: string; content: string }) => {
      await onEdit$(id, data);
    }
  );
  const onDeleteWrapped$ = $(async (id: string) => {
    await onDelete$(id);
  });

  const save$ = $(async () => {
    if (busy.value) return;
    busy.value = true;
    try {
      await onEditWrapped$(note.id, { title: title.value, content: content.value });
      editing.value = false;
    } finally {
      busy.value = false;
    }
  });

  const confirmDelete$ = $(async () => {
    if (busy.value) return;
    const ok = typeof window !== "undefined" ? window.confirm("Delete this note?") : true;
    if (!ok) return;
    busy.value = true;
    try {
      await onDeleteWrapped$(note.id);
    } finally {
      busy.value = false;
    }
  });

  return (
    <article class="surface card" aria-label={`Note ${note.title || note.id}`}>
      {!editing.value ? (
        <>
          <h3 class="note-title">{note.title || "Untitled"}</h3>
          <p class="note-content">
            {note.content.length > 160 ? note.content.slice(0, 160) + "…" : note.content}
          </p>
          <div class="note-meta">Updated {new Date(note.updatedAt).toLocaleString()}</div>
          <div class="note-actions">
            <button class="btn btn-neutral" onClick$={() => (editing.value = true)}>Edit</button>
            <button class="btn btn-danger" onClick$={confirmDelete$}>Delete</button>
          </div>
        </>
      ) : (
        <>
          <div>
            <label class="label" for={`t-${note.id}`}>Title</label>
            <input
              id={`t-${note.id}`}
              class="input"
              value={title.value}
              onInput$={(e, el) => (title.value = el.value)}
            />
          </div>
          <div style={{ marginTop: "10px" }}>
            <label class="label" for={`c-${note.id}`}>Content</label>
            <textarea
              id={`c-${note.id}`}
              class="textarea"
              rows={4}
              value={content.value}
              onInput$={(e, el) => (content.value = el.value)}
            />
          </div>
          <div class="note-actions">
            <button class="btn btn-neutral" onClick$={() => { editing.value = false; title.value = note.title; content.value = note.content; }}>
              Cancel
            </button>
            <button class="btn btn-primary" disabled={busy.value} onClick$={save$}>
              {busy.value ? "Saving..." : "Save"}
            </button>
          </div>
        </>
      )}
    </article>
  );
});
