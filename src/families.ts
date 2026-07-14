import type { Character, Family, GameWorld, Id } from "./types.js";
import type { Rng } from "./rng.js";
import { id } from "./rng.js";

export function createFamily(rng: Rng, name: string, bloodlineId: Id, memberIds: Id[] = [], seat?: string): Family {
  return {
    id: id("family", rng),
    bloodlineId,
    name,
    ...(seat ? { seat } : {}),
    memberIds,
    livingMemberIds: memberIds
  };
}

export function linkChild(world: GameWorld, childId: Id, parentIds: Id[]): GameWorld {
  const child = world.characters[childId];
  if (!child) throw new Error(`Unknown child ${childId}`);

  const nextCharacters = { ...world.characters, [childId]: { ...child, parentIds } };
  for (const parentId of parentIds) {
    const parent = nextCharacters[parentId];
    if (parent && !parent.childrenIds.includes(childId)) {
      nextCharacters[parentId] = { ...parent, childrenIds: [...parent.childrenIds, childId] };
    }
  }

  return { ...world, characters: nextCharacters };
}

export function ancestorsOf(world: GameWorld, characterId: Id, maxDepth = 8): Character[] {
  const result: Character[] = [];
  const visit = (idToVisit: Id, depth: number): void => {
    if (depth > maxDepth) return;
    const character = world.characters[idToVisit];
    if (!character) return;
    for (const parentId of character.parentIds) {
      const parent = world.characters[parentId];
      if (parent && !result.some((existing) => existing.id === parent.id)) {
        result.push(parent);
        visit(parent.id, depth + 1);
      }
    }
  };

  visit(characterId, 1);
  return result;
}

export function descendantsOf(world: GameWorld, characterId: Id, maxDepth = 8): Character[] {
  const result: Character[] = [];
  const visit = (idToVisit: Id, depth: number): void => {
    if (depth > maxDepth) return;
    const character = world.characters[idToVisit];
    if (!character) return;
    for (const childId of character.childrenIds) {
      const child = world.characters[childId];
      if (child && !result.some((existing) => existing.id === child.id)) {
        result.push(child);
        visit(child.id, depth + 1);
      }
    }
  };

  visit(characterId, 1);
  return result;
}

export function successionOrder(world: GameWorld, bloodlineId: Id): Character[] {
  return Object.values(world.characters)
    .filter((character) => character.bloodlineId === bloodlineId && character.status === "alive")
    .sort((a, b) => {
      const rankValue = (rank: Character["rank"]): number => ["wanderer", "courtier", "knight", "lord", "high_lord", "royal", "sovereign"].indexOf(rank);
      return rankValue(b.rank) - rankValue(a.rank) || b.stats.diplomacy - a.stats.diplomacy || a.bornYear - b.bornYear;
    });
}

export function familyTreeSnapshot(world: GameWorld, rootId: Id): { root: Character; ancestors: Character[]; descendants: Character[] } {
  const root = world.characters[rootId];
  if (!root) throw new Error(`Unknown root ${rootId}`);
  return {
    root,
    ancestors: ancestorsOf(world, rootId),
    descendants: descendantsOf(world, rootId)
  };
}
