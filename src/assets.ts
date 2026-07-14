import type { Character, Id, PortraitRef } from "./types.js";
import { portraitPrompt } from "./ai.js";

export type AssetRegistry = {
  portraits: Record<Id, PortraitRef>;
  music: Record<string, { assetKey: string; description: string; tags: string[] }>;
  narration: Record<string, { assetKey: string; description: string; tags: string[] }>;
};

export function createEmptyAssetRegistry(): AssetRegistry {
  return { portraits: {}, music: {}, narration: {} };
}

export function premadePortrait(character: Character, assetKey: string, tags: string[] = []): PortraitRef {
  return {
    id: `portrait_${character.id}`,
    characterId: character.id,
    kind: "premade",
    assetKey,
    tags: ["premade", character.familyName.toLowerCase(), ...tags]
  };
}

export function aiPortraitRequest(character: Character): PortraitRef {
  return {
    id: `portrait_ai_${character.id}`,
    characterId: character.id,
    kind: "ai",
    prompt: portraitPrompt({ character, style: "court" }),
    tags: ["ai", "portrait", character.familyName.toLowerCase()]
  };
}

export function resolvePortrait(character: Character, registry: AssetRegistry): PortraitRef {
  return registry.portraits[character.id] ?? character.portrait ?? aiPortraitRequest(character);
}

export function registerPortrait(registry: AssetRegistry, characterId: Id, portrait: PortraitRef): AssetRegistry {
  return { ...registry, portraits: { ...registry.portraits, [characterId]: portrait } };
}
