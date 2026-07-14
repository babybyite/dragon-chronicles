import type { Character, DialogueLine, GameEvent, GameWorld, Id, PortraitRef, Quest } from "./types.js";

export type DialogueRequest = {
  world: GameWorld;
  speakerId: Id;
  listenerIds: Id[];
  intent: "greet" | "threaten" | "confess" | "bargain" | "romance" | "scheme" | "quest_hook";
  context?: string;
};

export type PortraitRequest = {
  character: Character;
  style: "court" | "battle" | "adventurer" | "dragon-rider" | "aged";
};

export type MusicRequest = {
  scene: "court" | "war" | "romance" | "quest" | "tragedy" | "coronation";
  intensity: number;
};

export type NarrationRequest = {
  world: GameWorld;
  event: GameEvent;
  tone: "mythic" | "intimate" | "grim" | "playful";
};

export type GameMasterRequest = {
  world: GameWorld;
  playerCharacterId: Id;
  recentEvents: GameEvent[];
  openQuests: Quest[];
};

export type AiProvider = {
  generateDialogue?(request: DialogueRequest): Promise<DialogueLine[]>;
  generatePortrait?(request: PortraitRequest): Promise<PortraitRef>;
  generateMusic?(request: MusicRequest): Promise<{ assetKey: string; description: string }>;
  narrate?(request: NarrationRequest): Promise<string>;
  gameMasterMove?(request: GameMasterRequest): Promise<GameEvent | Quest>;
};

export function dialoguePrompt(request: DialogueRequest): string {
  const speaker = request.world.characters[request.speakerId];
  const listeners = request.listenerIds.map((id) => request.world.characters[id]?.givenName ?? "Unknown").join(", ");
  if (!speaker) throw new Error(`Unknown speaker ${request.speakerId}`);

  return [
    "Write mobile game dialogue for an original dynastic dragon-court RPG.",
    `Speaker: ${speaker.givenName} ${speaker.familyName}.`,
    `Intent: ${request.intent}.`,
    `Listeners: ${listeners || "none"}.`,
    `Traits: ${speaker.traits.map((trait) => trait.label).join(", ") || "none"}.`,
    request.context ? `Context: ${request.context}.` : "Keep it short, emotionally specific, and playable as tappable dialogue."
  ].join("\n");
}

export function portraitPrompt(request: PortraitRequest): string {
  const { character, style } = request;
  return [
    "Original mobile RPG portrait art, no text, no known actors or copyrighted characters.",
    `${character.givenName} ${character.familyName}, ${character.rank}, ${style} style.`,
    `Traits: ${character.traits.map((trait) => trait.label).join(", ")}.`,
    `Bloodline: ${character.bloodlineId}; dragon affinity ${character.stats.dragonAffinity}/20.`
  ].join(" ");
}

export function narrationPrompt(request: NarrationRequest): string {
  return `Narrate this ${request.tone} event in 2-4 sentences for a mobile life-sim RPG: ${request.event.title}. ${request.event.body}`;
}

export function fallbackDialogue(request: DialogueRequest): DialogueLine[] {
  const speaker = request.world.characters[request.speakerId];
  if (!speaker) return [];
  const lineByIntent: Record<DialogueRequest["intent"], string> = {
    greet: "You are welcome at my table, for now.",
    threaten: "A wise soul learns which flames are ceremonial and which are hungry.",
    confess: "I have carried this secret longer than I have carried my name.",
    bargain: "Everything in court has a price. Some prices are simply paid later.",
    romance: "When the hall goes quiet, I still hear your voice first.",
    scheme: "Smile when they enter. Count exits when they leave.",
    quest_hook: "There is a road no banner dares claim. I need someone brave enough to walk it."
  };
  return [{ speakerId: speaker.id, text: lineByIntent[request.intent], mood: request.intent === "threaten" ? "cold" : "scheming" }];
}
