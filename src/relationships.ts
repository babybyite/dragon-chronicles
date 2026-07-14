import type { Character, GameWorld, Id, Marriage, Relationship, RelationshipKind } from "./types.js";
import type { Rng } from "./rng.js";
import { clamp, id } from "./rng.js";

export function relationshipId(fromId: Id, toId: Id): Id {
  return `rel_${fromId}_${toId}`;
}

export function getRelationship(world: GameWorld, fromId: Id, toId: Id): Relationship {
  const existing = world.relationships[relationshipId(fromId, toId)];
  if (existing) return existing;
  return {
    id: relationshipId(fromId, toId),
    fromId,
    toId,
    kinds: [],
    affection: 0,
    trust: 0,
    fear: 0,
    respect: 0,
    resentment: 0,
    history: []
  };
}

export function updateRelationship(
  world: GameWorld,
  fromId: Id,
  toId: Id,
  delta: Partial<Omit<Relationship, "id" | "fromId" | "toId" | "history" | "kinds">> & { kind?: RelationshipKind; note?: string }
): GameWorld {
  const current = getRelationship(world, fromId, toId);
  const kinds = delta.kind && !current.kinds.includes(delta.kind) ? [...current.kinds, delta.kind] : current.kinds;
  const next: Relationship = {
    ...current,
    kinds,
    affection: clamp(current.affection + (delta.affection ?? 0), -100, 100),
    trust: clamp(current.trust + (delta.trust ?? 0), -100, 100),
    fear: clamp(current.fear + (delta.fear ?? 0), 0, 100),
    respect: clamp(current.respect + (delta.respect ?? 0), -100, 100),
    resentment: clamp(current.resentment + (delta.resentment ?? 0), 0, 100),
    history: delta.note ? [...current.history, delta.note] : current.history
  };

  return { ...world, relationships: { ...world.relationships, [next.id]: next } };
}

export function compatibility(a: Character, b: Character): number {
  const sharedTraits = a.traits.filter((trait) => b.traits.some((other) => other.id === trait.id)).length;
  const statHarmony = 100 - Math.abs(a.stats.diplomacy - b.stats.diplomacy) * 6 - Math.abs(a.stats.will - b.stats.will) * 4;
  const ambitionClash = a.traits.some((trait) => trait.id === "ambitious") && b.traits.some((trait) => trait.id === "ambitious") ? -18 : 0;
  return clamp(statHarmony + sharedTraits * 12 + ambitionClash, -100, 100);
}

export function marriageScore(world: GameWorld, aId: Id, bId: Id): number {
  const a = world.characters[aId];
  const b = world.characters[bId];
  if (!a || !b || a.status !== "alive" || b.status !== "alive") return -100;
  const relation = getRelationship(world, aId, bId);
  const bloodlineA = world.bloodlines[a.bloodlineId];
  const bloodlineB = world.bloodlines[b.bloodlineId];
  const prestige = ((bloodlineA?.prestige ?? 0) + (bloodlineB?.prestige ?? 0)) / 2;
  return clamp(compatibility(a, b) * 0.45 + relation.affection * 0.3 + relation.trust * 0.2 + prestige * 0.25 - relation.resentment * 0.4, -100, 100);
}

export function createMarriage(world: GameWorld, rng: Rng, spouseIds: [Id, Id]): GameWorld {
  const [aId, bId] = spouseIds;
  const marriage: Marriage = {
    id: id("marriage", rng),
    spouseIds,
    year: world.year,
    allianceValue: Math.max(0, marriageScore(world, aId, bId)),
    childrenIds: [],
    status: "active"
  };

  const a = world.characters[aId];
  const b = world.characters[bId];
  if (!a || !b) throw new Error("Both spouses must exist before marriage.");

  let nextWorld: GameWorld = {
    ...world,
    characters: {
      ...world.characters,
      [aId]: { ...a, spouseIds: [...new Set([...a.spouseIds, bId])] },
      [bId]: { ...b, spouseIds: [...new Set([...b.spouseIds, aId])] }
    },
    marriages: { ...world.marriages, [marriage.id]: marriage }
  };

  nextWorld = updateRelationship(nextWorld, aId, bId, { kind: "spouse", trust: 10, affection: 8, note: `Married in ${world.year}.` });
  nextWorld = updateRelationship(nextWorld, bId, aId, { kind: "spouse", trust: 10, affection: 8, note: `Married in ${world.year}.` });
  return nextWorld;
}
