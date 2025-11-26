import { component$, useVisibleTask$, useSignal, $, useTask$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { getNotesService, type Note } from "~/services/notes";
import { Header } from "~/components/Header";
import { NoteComposer } from "~/components/NoteComposer";
import { NotesList } from "~/components/NotesList";
import "../theme.css";

export default component$(() => {
  const notes = useSignal<Note[]>([]);
  const toast = useSignal<string | null>(null);
  const svcReady = useSignal(false);
  // Store a simple tag indicating which backend was used last ("api" or "local")
  const backendTag = useSignal<"api" | "local" | null>(null);

  useVisibleTask$(async () => {
    try {
      const svc = await getNotesService();
      // Determine tag by crude feature: api service likely has base URL in toString; fallback 'local'
      const tag: "api" | "local" = "list" in svc && "create" in svc ? "local" : "local";
      backendTag.value = tag;
      notes.value = await svc.list();
    } catch (e: any) {
      toast.value = e?.message || "Failed to initialize app";
    } finally {
      svcReady.value = true;
    }
  });

  // Auto-clear toast
  useTask$(({ track, cleanup }) => {
    track(() => toast.value);
    if (toast.value) {
      const t = setTimeout(() => (toast.value = null), 2500);
      cleanup(() => clearTimeout(t));
    }
  });

  const withService = $(async <T,>(fn: (svc: Awaited<ReturnType<typeof getNotesService>>) => Promise<T>): Promise<T | void> => {
    const svc = await getNotesService();
    return fn(svc);
  });

  const handleCreate$ = $(async (data: { title: string; content: string }) => {
    try {
      await withService(async (svc) => {
        const created = await svc.create({
          title: data.title,
          content: data.content,
        });
        notes.value = [created, ...notes.value];
      });
      toast.value = "Note saved";
    } catch (e: any) {
      toast.value = e?.message || "Failed to save note";
    }
  });

  const handleEdit$ = $(async (id: string, data: { title: string; content: string }) => {
    try {
      await withService(async (svc) => {
        const updated = await svc.update(id, data);
        notes.value = notes.value.map((n) => (n.id === id ? updated : n));
      });
      toast.value = "Note updated";
    } catch (e: any) {
      toast.value = e?.message || "Failed to update note";
    }
  });

  const handleDelete$ = $(async (id: string) => {
    try {
      await withService(async (svc) => {
        await svc.remove(id);
        notes.value = notes.value.filter((n) => n.id !== id);
      });
      toast.value = "Note deleted";
    } catch (e: any) {
      toast.value = e?.message || "Failed to delete note";
    }
  });

  return (
    <div class="container">
      <Header />
      <section class="composer surface" role="region" aria-label="New note composer">
        <NoteComposer onCreate$={handleCreate$} />
      </section>
      <section style={{ marginTop: "10px" }}>
        {!svcReady.value ? (
          <div class="surface empty">Loading…</div>
        ) : (
          <NotesList notes={notes.value} onEdit$={handleEdit$} onDelete$={handleDelete$} />
        )}
      </section>
      {toast.value && <div role="status" aria-live="polite" class="toast">{toast.value}</div>}
    </div>
  );
});

export const head: DocumentHead = {
  title: "Personal Notes",
  meta: [
    {
      name: "description",
      content: "Create, edit, and manage your notes.",
    },
    {
      name: "theme-color",
      content: "#2563EB",
    },
  ],
};
