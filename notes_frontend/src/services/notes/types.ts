export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export interface NotesService {
  // PUBLIC_INTERFACE
  list(): Promise<Note[]>;

  // PUBLIC_INTERFACE
  create(note: Omit<Note, "id" | "createdAt" | "updatedAt">): Promise<Note>;

  // PUBLIC_INTERFACE
  update(id: string, patch: Partial<Omit<Note, "id" | "createdAt">>): Promise<Note>;

  // PUBLIC_INTERFACE
  remove(id: string): Promise<void>;
}
