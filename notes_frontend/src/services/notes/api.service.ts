import type { Note, NotesService } from "./types";

function getApiBase(): string | null {
  const base =
    (import.meta as any).env?.VITE_API_BASE ||
    (import.meta as any).env?.VITE_BACKEND_URL ||
    null;
  return typeof base === "string" && base.length > 0 ? base : null;
}

async function fetchJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Request failed: ${res.status}`);
  }
  return (await res.json()) as T;
}

export class ApiNotesService implements NotesService {
  private base: string;

  constructor(baseUrl: string) {
    this.base = baseUrl.replace(/\/+$/, "");
  }

  // PUBLIC_INTERFACE
  async list(): Promise<Note[]> {
    return fetchJson<Note[]>(`${this.base}/notes`);
  }

  // PUBLIC_INTERFACE
  async create(note: Omit<Note, "id" | "createdAt" | "updatedAt">): Promise<Note> {
    return fetchJson<Note>(`${this.base}/notes`, {
      method: "POST",
      body: JSON.stringify(note),
    });
  }

  // PUBLIC_INTERFACE
  async update(id: string, patch: Partial<Omit<Note, "id" | "createdAt">>): Promise<Note> {
    return fetchJson<Note>(`${this.base}/notes/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: JSON.stringify(patch),
    });
  }

  // PUBLIC_INTERFACE
  async remove(id: string): Promise<void> {
    await fetchJson(`${this.base}/notes/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
  }

  // PUBLIC_INTERFACE
  static async createIfReachable(): Promise<ApiNotesService | null> {
    const base = getApiBase();
    if (!base) return null;
    try {
      // Ping list to check reachability
      await fetchJson(`${base.replace(/\/+$/, "")}/health`, {
        method: "GET",
      }).catch(() => null);
      // Even if /health is not available, try /notes in a safe manner
      try {
        await fetchJson(`${base.replace(/\/+$/, "")}/notes`, { method: "GET" });
      } catch {
        // If list fails, treat as not reachable
        return null;
      }
      return new ApiNotesService(base);
    } catch {
      return null;
    }
  }
}
