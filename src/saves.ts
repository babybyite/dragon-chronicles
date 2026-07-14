import type { GameWorld, SaveFile } from "./types.js";

export const CURRENT_SCHEMA_VERSION = 1;

export type CloudSaveAdapter = {
  load(slotId: string): Promise<string | undefined>;
  save(slotId: string, payload: string): Promise<void>;
  delete?(slotId: string): Promise<void>;
};

export function createSaveFile(slotId: string, world: GameWorld, now = new Date()): SaveFile {
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    savedAt: now.toISOString(),
    slotId,
    world: { ...world, schemaVersion: CURRENT_SCHEMA_VERSION }
  };
}

export function serializeSave(saveFile: SaveFile): string {
  return JSON.stringify(saveFile);
}

export function parseSave(payload: string): SaveFile {
  const parsed = JSON.parse(payload) as SaveFile;
  return migrateSave(parsed);
}

export function migrateSave(saveFile: SaveFile): SaveFile {
  if (saveFile.schemaVersion === CURRENT_SCHEMA_VERSION) return saveFile;
  throw new Error(`Unsupported save schema ${saveFile.schemaVersion}. Add a migration before loading this file.`);
}

export async function saveToCloud(adapter: CloudSaveAdapter, slotId: string, world: GameWorld): Promise<void> {
  await adapter.save(slotId, serializeSave(createSaveFile(slotId, world)));
}

export async function loadFromCloud(adapter: CloudSaveAdapter, slotId: string): Promise<SaveFile | undefined> {
  const payload = await adapter.load(slotId);
  return payload ? parseSave(payload) : undefined;
}

export function estimateSaveSizeBytes(saveFile: SaveFile): number {
  return new TextEncoder().encode(serializeSave(saveFile)).length;
}
