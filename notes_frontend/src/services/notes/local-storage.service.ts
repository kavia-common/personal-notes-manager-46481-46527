import type { Note, NotesService } from "./types";

const STORAGE_KEY = "notes_app__notes";

function nowIso(): string {
  return new Date().toISOString();
}

function load(): Note[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function save(notes: Note[]): void {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

export class LocalStorageNotesService implements NotesService {
  // PUBLIC_INTERFACE
  async list(): Promise<Note[]> {
    return load().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  // PUBLIC_INTERFACE
  async create(note: Omit<Note, "id" | "createdAt" | "updatedAt">): Promise<Note> {
    const notes = load();
    const genId = () => {
      try {
        // Prefer crypto if available
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const c: any = globalThis as any;
        if (c.crypto && typeof c.crypto.randomUUID === "function") {
          return c.crypto.randomUUID();
        }
      } catch {
        /* noop */
      }
      return Math.random().toString(36).slice(2);
    };
    const created: Note = {
      id: genId(),
      title: note.title.trim(),
      content: note.content.trim(),
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    notes.push(created);
    save(notes);
    return created;
  }

  // PUBLIC_INTERFACE
  async update(id: string, patch: Partial<Omit<Note, "id" | "createdAt">>): Promise<Note> {
    const notes = load();
    const idx = notes.findIndex((n) => n.id === id);
    if (idx === -1) {
      throw new Error("Note not found");
    }
    const updated: Note = {
      ...notes[idx],
      ...patch,
      title: (patch.title ?? notes[idx].title).trim(),
      content: (patch.content ?? notes[idx].content).trim(),
      updatedAt: nowIso(),
    };
    notes[idx] = updated;
    save(notes);
    return updated;
  }

  // PUBLIC_INTERFACE
  async remove(id: string): Promise<void> {
    const notes = load();
    const next = notes.filter((n) => n.id !== id);
    save(next);
  }
}
