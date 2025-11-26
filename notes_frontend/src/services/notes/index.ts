import type { NotesService } from "./types";
import { LocalStorageNotesService } from "./local-storage.service";
import { ApiNotesService } from "./api.service";

// PUBLIC_INTERFACE
export async function getNotesService(): Promise<NotesService> {
  const api = await ApiNotesService.createIfReachable();
  if (api) return api;
  return new LocalStorageNotesService();
}

export * from "./types";
