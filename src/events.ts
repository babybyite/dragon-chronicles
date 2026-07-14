import type { EventChoice, EventEffect, GameEvent, GameWorld, Id } from "./types.js";
import type { Rng } from "./rng.js";
import { clamp, id } from "./rng.js";
import { updateRelationship } from "./relationships.js";

export type EventTemplate = {
  id: string;
  title: string;
  tags: string[];
  body(actorNames: string[]): string;
  choices(actorIds: Id[]): EventChoice[];
};

export const eventTemplates: EventTemplate[] = [
  {
    id: "dragon_egg_found",
    title: "A Warm Egg in the Ashes",
    tags: ["dragon", "legacy", "risk"],
    body: ([actor]) => `${actor} discovers a stone-warm egg beneath old battlefield ash. Every great house will want it.`,
    choices: ([actorId]) => [
      { id: "hide", label: "Hide it in the family crypt", effects: [{ type: "trait", characterId: actorId, trait: { id: "keeper_of_embers", label: "Keeper of Embers", category: "secret" } }] },
      { id: "present", label: "Present it at court", effects: [{ type: "kingdom", stability: -4, dread: 6, prosperity: 2 }] },
      { id: "sell", label: "Sell the secret", effects: [{ type: "gold", characterId: actorId, delta: 500 }] }
    ]
  },
  {
    id: "marriage_offer",
    title: "A Marriage Written in Wax",
    tags: ["marriage", "politics", "family"],
    body: ([actor, target]) => `${target}'s family sends ${actor} a sealed proposal, rich with promises and hidden knives.`,
    choices: ([actorId, targetId]) => [
      { id: "accept", label: "Accept the alliance", effects: [{ type: "relationship", fromId: actorId, toId: targetId, affection: 12, trust: 8 }] },
      { id: "delay", label: "Demand better terms", effects: [{ type: "relationship", fromId: actorId, toId: targetId, resentment: 6 }] },
      { id: "insult", label: "Refuse publicly", effects: [{ type: "relationship", fromId: actorId, toId: targetId, affection: -16, resentment: 18 }] }
    ]
  },
  {
    id: "adventurer_arrives",
    title: "An Adventurer at Supper",
    tags: ["quest", "dnd", "intrigue"],
    body: ([actor]) => `A scarred adventurer interrupts ${actor}'s supper with a map, a debt, and a story nobody sane would believe.`,
    choices: ([actorId]) => [
      { id: "fund", label: "Fund the expedition", effects: [{ type: "gold", characterId: actorId, delta: -120 }, { type: "stat", characterId: actorId, stat: "learning", delta: 1 }] },
      { id: "join", label: "Join in disguise", effects: [{ type: "stat", characterId: actorId, stat: "martial", delta: 1 }, { type: "stat", characterId: actorId, stat: "cunning", delta: 1 }] },
      { id: "arrest", label: "Seize the map", effects: [{ type: "stat", characterId: actorId, stat: "cunning", delta: 1 }, { type: "kingdom", dread: 3 }] }
    ]
  }
];

export function generateEvent(world: GameWorld, rng: Rng, actorIds: Id[]): GameEvent {
  const template = rng.pick(eventTemplates);
  const names = actorIds.map((actorId) => world.characters[actorId]?.givenName ?? "Someone");
  return {
    id: id("event", rng),
    title: template.title,
    body: template.body(names),
    year: world.year,
    actorIds,
    tags: template.tags,
    choices: template.choices(actorIds)
  };
}

export function applyEventChoice(world: GameWorld, event: GameEvent, choiceId: string): GameWorld {
  const choice = event.choices.find((candidate) => candidate.id === choiceId);
  if (!choice) throw new Error(`Unknown event choice ${choiceId}`);
  return choice.effects.reduce(applyEffect, { ...world, eventLog: [...world.eventLog, event] });
}

export function applyEffect(world: GameWorld, effect: EventEffect): GameWorld {
  if (effect.type === "stat") {
    const character = world.characters[effect.characterId];
    if (!character) return world;
    return {
      ...world,
      characters: {
        ...world.characters,
        [character.id]: {
          ...character,
          stats: { ...character.stats, [effect.stat]: clamp(character.stats[effect.stat] + effect.delta, 1, 20) }
        }
      }
    };
  }

  if (effect.type === "gold") {
    const character = world.characters[effect.characterId];
    if (!character) return world;
    return { ...world, characters: { ...world.characters, [character.id]: { ...character, gold: Math.max(0, character.gold + effect.delta) } } };
  }

  if (effect.type === "relationship") {
    return updateRelationship(world, effect.fromId, effect.toId, {
      affection: effect.affection,
      trust: effect.trust,
      resentment: effect.resentment,
      note: `Event effect in year ${world.year}.`
    });
  }

  if (effect.type === "kingdom") {
    const firstKingdom = Object.values(world.kingdoms)[0];
    if (!firstKingdom) return world;
    return {
      ...world,
      kingdoms: {
        ...world.kingdoms,
        [firstKingdom.id]: {
          ...firstKingdom,
          stability: clamp(firstKingdom.stability + (effect.stability ?? 0), 0, 100),
          dread: clamp(firstKingdom.dread + (effect.dread ?? 0), 0, 100),
          prosperity: clamp(firstKingdom.prosperity + (effect.prosperity ?? 0), 0, 100)
        }
      }
    };
  }

  const character = world.characters[effect.characterId];
  if (!character) return world;
  return { ...world, characters: { ...world.characters, [character.id]: { ...character, traits: [...character.traits, effect.trait] } } };
}
