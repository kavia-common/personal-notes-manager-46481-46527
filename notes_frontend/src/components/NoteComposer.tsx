import { component$, $, useSignal } from "@builder.io/qwik";
import type { PropFunction } from "@builder.io/qwik";

export interface NoteComposerProps {
  // PUBLIC_INTERFACE
  onCreate$: PropFunction<(data: { title: string; content: string }) => Promise<void> | void>;
}

export const NoteComposer = component$<NoteComposerProps>(({ onCreate$ }) => {
  const title = useSignal("");
  const content = useSignal("");
  const busy = useSignal(false);

  const submit$ = $(async () => {
    if (busy.value) return;
    if (!title.value.trim() && !content.value.trim()) return;
    busy.value = true;
    try {
      await onCreate$({ title: title.value, content: content.value });
      title.value = "";
      content.value = "";
    } finally {
      busy.value = false;
    }
  });

  return (
    <section class="surface composer" aria-label="Create a new note">
      <div>
        <label class="label" for="title">Title</label>
        <input
          id="title"
          class="input"
          placeholder="Note title"
          value={title.value}
          onInput$={(e, el) => (title.value = el.value)}
        />
      </div>
      <div style={{ marginTop: "10px" }}>
        <label class="label" for="content">Content</label>
        <textarea
          id="content"
          class="textarea"
          rows={4}
          placeholder="Write your thoughts..."
          value={content.value}
          onInput$={(e, el) => (content.value = el.value)}
        />
      </div>
      <div class="actions">
        <button class="btn btn-neutral" type="button" onClick$={() => { title.value = ""; content.value = ""; }}>
          Clear
        </button>
        <button class="btn btn-primary" type="button" disabled={busy.value} onClick$={submit$}>
          {busy.value ? "Saving..." : "Save Note"}
        </button>
      </div>
    </section>
  );
});
