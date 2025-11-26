import { component$ } from "@builder.io/qwik";
import type { PropFunction } from "@builder.io/qwik";
import type { Note } from "~/services/notes";
import { NoteCard } from "./NoteCard";

export interface NotesListProps {
  notes: Note[];
  // PUBLIC_INTERFACE
  onEdit$: PropFunction<(id: string, data: { title: string; content: string }) => Promise<void> | void>;
  // PUBLIC_INTERFACE
  onDelete$: PropFunction<(id: string) => Promise<void> | void>;
}

export const NotesList = component$<NotesListProps>(({ notes, onEdit$, onDelete$ }) => {
  if (!notes.length) {
    return <div class="surface empty">No notes yet. Start by adding a new note above.</div>;
  }
  return (
    <section class="grid" aria-label="Notes list">
      {notes.map((n) => (
        <NoteCard key={n.id} note={n} onEdit$={onEdit$} onDelete$={onDelete$} />
      ))}
    </section>
  );
});
