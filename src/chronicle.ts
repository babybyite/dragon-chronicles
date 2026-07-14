import type { Character, Dragon, GameWorld, Id, RelationshipKind } from "./types.js";
import type { Rng } from "./rng.js";
import { clamp, id } from "./rng.js";
import { createCharacter } from "./characters.js";
import { linkChild } from "./families.js";
import { createMarriage } from "./relationships.js";
import { updateRelationship } from "./relationships.js";
import { dragonNames } from "./presets.js";

export type ChronicleLocation =
  | "Market"
  | "Tavern"
  | "Forest"
  | "Home"
  | "City Gate"
  | "Castle Gardens"
  | "Throne Room"
  | "Ball Room"
  | "Training Court"
  | "Personal Quarters"
  | "Castle Halls";

export type LifeAction =
  | "Talk"
  | "Drink Together"
  | "Fight"
  | "Give Rose"
  | "Propose Marriage"
  | "Lay With"
  | "Try to Learn Secret"
  | "Form Alliance"
  | "Attempt to Kill"
  | "Offer to Take In"
  | "Abandon";

const baseLocations: ChronicleLocation[] = ["Market", "Tavern", "Forest", "Home", "City Gate"];
const nobleLocations: ChronicleLocation[] = ["Castle Gardens", "Throne Room", "Ball Room", "Training Court", "Personal Quarters", "Castle Halls"];

export function ageOf(world: GameWorld, character: Character): number {
  return Math.max(0, world.year - character.bornYear);
}

export function getPortraitStage(age: number): number {
  if (age < 12) return 0;
  if (age < 16) return 12;
  if (age < 24) return 16;
  if (age < 35) return 24;
  if (age < 50) return 35;
  return 50;
}

export function computePortraitDescriptor(world: GameWorld, character: Character): { stage: number; hair: string; note: string; aura: string } {
  const age = ageOf(world, character);
  const bloodline = world.bloodlines[character.bloodlineId];
  const appearance = character.appearance;
  const hasDragonAccent = (bloodline?.dragonBond ?? 0) >= 50 || character.stats.dragonAffinity >= 12;
  const hair = appearance ? (hasDragonAccent ? `${appearance.hairColor} with pale strands` : appearance.hairColor) : hasDragonAccent ? "pale fire-touched hair" : "unrecorded hair";
  const aura = bloodline?.name.toLowerCase().includes("moon")
    ? "strange watchful aura"
    : hasDragonAccent
      ? "ancient firebound aura"
      : character.rank === "wanderer"
        ? "road-worn adventurer aura"
        : "quiet courtly aura";
  return {
    stage: getPortraitStage(age),
    hair,
    note: appearance ? `${appearance.hairStyle}, ${appearance.faceTrait}, ${appearance.clothing}` : "portrait details pending",
    aura
  };
}

export function relationshipLabel(root: Character, person: Character): string {
  if (person.id === root.id) return "Self";
  if (person.parentIds.includes(root.id)) return "Child";
  if (root.parentIds.includes(person.id)) return "Parent";
  if (root.parentIds.some((parentId) => person.parentIds.includes(parentId))) return "Sibling";
  if (root.spouseIds.includes(person.id)) return "Spouse";
  if (person.wardOfId === root.id) return "Ward";
  if (root.wardOfId === person.id) return "Guardian";
  return "Acquaintance";
}

export function availableLocations(character: Character): ChronicleLocation[] {
  const courtAccess = character.birthStatus === "royal" || character.birthStatus === "noble" || ["courtier", "lord", "high_lord", "royal", "sovereign"].includes(character.rank);
  return courtAccess ? [...baseLocations, ...nobleLocations] : baseLocations;
}

export function appendChronicleLine(world: GameWorld, line: string): GameWorld {
  const current = world.yearLog[world.yearLog.length - 1] ?? { year: world.year, lines: [], actionsUsed: 0 };
  const rest = world.yearLog.slice(0, -1);
  return {
    ...world,
    yearLog: [...rest, { ...current, lines: [...current.lines, line], actionsUsed: current.actionsUsed + 1 }]
  };
}

export function visitLocation(world: GameWorld, characterId: Id, location: ChronicleLocation): GameWorld {
  const character = world.characters[characterId];
  if (!character) throw new Error(`Unknown character ${characterId}`);

  const lineByLocation: Record<ChronicleLocation, string> = {
    Market: `${character.givenName} wandered the market and left with a whisper, a rumor, and lighter coin.`,
    Tavern: `${character.givenName} drank among loose tongues, and someone spoke more than they meant to.`,
    Forest: `${character.givenName} walked beneath dark boughs and returned with mud on the hem and thought in the blood.`,
    Home: `${character.givenName} lingered at home, where comfort and old wounds shared the same fire.`,
    "City Gate": `At the city gate, ${character.givenName} watched travelers arrive with strange news from the road.`,
    "Castle Gardens": `${character.givenName} crossed the gardens where smiles bloomed as carefully as roses.`,
    "Throne Room": `${character.givenName} entered the throne room and felt every eye weigh worth, danger, and promise.`,
    "Ball Room": `${character.givenName} moved through the ball room beneath silk, music, and hungry ambition.`,
    "Training Court": `${character.givenName} trained until breath burned and pride stood straighter.`,
    "Personal Quarters": `${character.givenName} withdrew to private chambers, where letters and secrets waited in stillness.`,
    "Castle Halls": `${character.givenName} paced the castle halls and caught more from passing voices than was meant to be heard.`
  };

  const nextCharacter = adjustVitals(character, location === "Training Court" ? { strength: 2, health: -1 } : location === "Home" ? { happiness: 3 } : { happiness: 1 });
  return appendChronicleLine({ ...world, characters: { ...world.characters, [characterId]: nextCharacter } }, lineByLocation[location]);
}

export function claimDragon(world: GameWorld, rng: Rng, characterId: Id): GameWorld {
  const character = world.characters[characterId];
  if (!character) throw new Error(`Unknown character ${characterId}`);
  if (character.dragonId) return world;

  const bloodline = world.bloodlines[character.bloodlineId];
  const eligible = character.stats.dragonAffinity >= 12 || (bloodline?.dragonBond ?? 0) >= 50;
  if (!eligible) {
    return appendChronicleLine(world, `${character.givenName} felt the old fire stir, yet no dragon answered the call.`);
  }

  const dragon: Dragon = {
    id: id("dragon", rng),
    name: rng.pick(dragonNames),
    riderId: character.id,
    bornYear: world.year - rng.int(6, 80),
    status: "alive",
    trust: 40 + character.stats.dragonAffinity * 2,
    ferocity: rng.int(45, 100),
    color: rng.pick(["ash white", "ember red", "storm black", "moon silver", "forest bronze", "smoke blue"]),
    temperament: rng.pick(["gentle", "proud", "wild", "brooding", "playful", "cruel"] as const)
  };

  const nextWorld = appendChronicleLine(
    {
      ...world,
      dragons: { ...world.dragons, [dragon.id]: dragon },
      characters: { ...world.characters, [character.id]: { ...character, dragonId: dragon.id } },
      milestones: [...world.milestones, { id: id("milestone", rng), title: "Claimed a Dragon", year: world.year, characterId: character.id }]
    },
    `${character.givenName} claimed ${dragon.name}, and dragon and rider were bound for life.`
  );

  return updateRelationship(nextWorld, character.id, dragon.id, { kind: "friend", trust: 25, respect: 20, note: "Dragon bond formed." });
}

export function performLifeAction(world: GameWorld, rng: Rng, actorId: Id, targetId: Id, action: LifeAction): GameWorld {
  const actor = world.characters[actorId];
  const target = world.characters[targetId];
  if (!actor || !target) throw new Error("Both actor and target must exist.");
  const actorAge = ageOf(world, actor);
  let nextWorld = world;
  let line = `${actor.givenName} spent time with ${target.givenName}.`;

  const relationshipDelta = (kind: RelationshipKind | undefined, trust = 0, affection = 0, resentment = 0): void => {
    nextWorld = updateRelationship(nextWorld, actor.id, target.id, { kind, trust, affection, resentment, note: `${action} in year ${world.year}.` });
    nextWorld = updateRelationship(nextWorld, target.id, actor.id, { kind, trust: Math.floor(trust / 2), affection: Math.floor(affection / 2), resentment, note: `${action} in year ${world.year}.` });
  };

  if (action === "Talk") {
    relationshipDelta("friend", 8, 3);
    nextWorld = replaceCharacter(nextWorld, adjustVitals(actor, { happiness: 2 }));
    line = `${actor.givenName} spoke with ${target.givenName}; the exchange softened the air between them.`;
  } else if (action === "Drink Together") {
    relationshipDelta("friend", 6, 2);
    nextWorld = replaceCharacter(nextWorld, adjustVitals(actor, { happiness: 4 }));
    line = `${actor.givenName} drank with ${target.givenName}, and laughter made room for dangerous honesty.`;
  } else if (action === "Fight") {
    relationshipDelta("rival", -12, -8, 8);
    nextWorld = replaceCharacter(nextWorld, adjustVitals(actor, { strength: 2, health: -3 }));
    line = `${actor.givenName} came to blows with ${target.givenName}; bruises answered where words had failed.`;
  } else if (action === "Give Rose" && actorAge >= 14) {
    relationshipDelta("lover", 4, 12);
    line = `${actor.givenName} offered ${target.givenName} a rose, and the gesture did not go unnoticed.`;
  } else if (action === "Propose Marriage" && actorAge >= 14) {
    nextWorld = createMarriage(nextWorld, rng.fork("marriage"), [actor.id, target.id]);
    nextWorld = { ...nextWorld, milestones: [...nextWorld.milestones, { id: id("milestone", rng), title: "First Marriage", year: world.year, characterId: actor.id }] };
    line = `${actor.givenName} proposed marriage to ${target.givenName}, and the bond was welcomed for blood and future.`;
  } else if (action === "Lay With" && actorAge >= 16) {
    relationshipDelta("lover", 6, 18);
    nextWorld = replaceCharacter(nextWorld, adjustVitals(actor, { happiness: 6 }));
    line = `${actor.givenName} lay with ${target.givenName}, and desire left consequences yet unseen.`;
    if (rng.chance(0.3)) {
      nextWorld = createChildFromUnion(nextWorld, rng.fork("child"), actor.id, target.id);
      line += " Before the year waned, a child quickened into the story.";
    }
  } else if (action === "Try to Learn Secret" && actorAge >= 14) {
    line = `${actor.givenName} tested silence and expression alike, and drew near to a secret best handled with care.`;
  } else if (action === "Form Alliance") {
    relationshipDelta("friend", 10, 2);
    nextWorld = replaceCharacter(nextWorld, adjustVitals(actor, { honor: 3 }));
    line = `${actor.givenName} and ${target.givenName} bound themselves to common cause.`;
  } else if (action === "Attempt to Kill" && actorAge >= 16) {
    if (rng.chance(0.28)) {
      nextWorld = killCharacter(nextWorld, target.id, "murder");
      line = `${actor.givenName} struck with deadly purpose, and ${target.givenName} did not survive the attempt.`;
    } else {
      relationshipDelta("enemy", -20, -20, 30);
      nextWorld = replaceCharacter(nextWorld, adjustVitals(actor, { honor: -10 }));
      line = `${actor.givenName} moved to kill ${target.givenName}, but the attempt failed and poisoned trust beyond repair.`;
    }
  } else if (action === "Offer to Take In" && actorAge > 24 && ageOf(world, target) <= 14) {
    nextWorld = replaceCharacter(nextWorld, { ...target, wardOfId: actor.id });
    relationshipDelta("ward", 8, 4);
    line = `${actor.givenName} offered shelter and guidance; ${target.givenName} entered the household as a ward.`;
  } else if (action === "Abandon" && target.wardOfId === actor.id) {
    nextWorld = replaceCharacter(nextWorld, { ...target, wardOfId: undefined });
    relationshipDelta("enemy", -10, -8, 18);
    line = `${actor.givenName} cast ${target.givenName} out from wardship, and the bond was broken.`;
  }

  return appendChronicleLine(nextWorld, line);
}

export function advanceChronicleYear(world: GameWorld): GameWorld {
  const rng = worldRng(world, "chronicle-year");
  const nextYear = world.year + 1;
  const player = world.characters[world.playerCharacterId];
  if (!player) return { ...world, year: nextYear };

  let nextWorld: GameWorld = {
    ...world,
    year: nextYear,
    yearLog: [...world.yearLog, { year: nextYear, lines: [`Year ${nextYear} opened with old burdens, fresh hungers, and the memory of all that came before.`], actionsUsed: 0 }]
  };

  const agedPlayer = nextWorld.characters[nextWorld.playerCharacterId]!;
  const age = ageOf(nextWorld, agedPlayer);
  if (agedPlayer.status === "alive" && age >= 70) {
    const deathChance = Math.min(0.08 + (age - 70) * 0.05, 0.95);
    if (rng.chance(deathChance)) nextWorld = killCharacter(nextWorld, agedPlayer.id, "old age");
  }

  const currentPlayer = nextWorld.characters[nextWorld.playerCharacterId]!;
  if (currentPlayer.status === "alive" && rng.chance(0.08)) {
    nextWorld = killCharacter(nextWorld, currentPlayer.id, rng.pick(["illness", "falling", "drowning", "beating", "curse", "burning", "alcohol"]));
  }

  return resolvePlayerDeath(nextWorld, rng);
}

function createChildFromUnion(world: GameWorld, rng: Rng, firstParentId: Id, secondParentId: Id): GameWorld {
  const firstParent = world.characters[firstParentId];
  const secondParent = world.characters[secondParentId];
  if (!firstParent || !secondParent) return world;
  const bloodline = world.bloodlines[firstParent.bloodlineId] ?? world.bloodlines[secondParent.bloodlineId];
  if (!bloodline) return world;

  const child = createCharacter(rng, {
    year: world.year,
    bloodline,
    parents: [firstParent, secondParent],
    familyName: firstParent.familyName,
    rank: firstParent.rank === "royal" ? "royal" : "courtier"
  });
  const shapedChild: Character = {
    ...child,
    birthStatus: firstParent.birthStatus === "bastard" && secondParent.birthStatus === "bastard" ? "bastard" : firstParent.birthStatus,
    origin: firstParent.origin,
    vitals: { health: 70, happiness: 55, strength: 20, honor: 50 }
  };

  const withChild = {
    ...world,
    characters: { ...world.characters, [shapedChild.id]: shapedChild },
    milestones: [...world.milestones, { id: id("milestone", rng), title: "First Child", year: world.year, characterId: firstParent.id }]
  };
  return linkChild(withChild, shapedChild.id, [firstParent.id, secondParent.id]);
}

function killCharacter(world: GameWorld, characterId: Id, causeOfDeath: string): GameWorld {
  const character = world.characters[characterId];
  if (!character || character.status === "dead") return world;
  return appendChronicleLine(
    {
      ...world,
      characters: {
        ...world.characters,
        [character.id]: { ...character, status: "dead", deathYear: world.year, causeOfDeath }
      }
    },
    causeOfDeath === "old age"
      ? `${character.givenName} died of old age at ${ageOf(world, character)}, the body yielding where ambition would not.`
      : `${character.givenName} met death by ${causeOfDeath}.`
  );
}

function resolvePlayerDeath(world: GameWorld, rng: Rng): GameWorld {
  const player = world.characters[world.playerCharacterId];
  if (!player || player.status !== "dead") return world;

  const heir = player.childrenIds.map((childId) => world.characters[childId]).find((child): child is Character => Boolean(child && child.status === "alive"));
  if (heir) {
    return appendChronicleLine({ ...world, playerCharacterId: heir.id, generations: world.generations + 1 }, `${heir.givenName} ${heir.familyName} stepped forward to continue the chronicle.`);
  }

  const ageAtDeath = ageOf(world, player);
  return {
    ...world,
    finished: true,
    summaries: [
      ...world.summaries,
      {
        id: id("summary", rng),
        characterId: player.id,
        name: `${player.givenName} ${player.familyName}`,
        ageAtDeath,
        causeOfDeath: player.causeOfDeath ?? "unknown",
        generations: world.generations,
        yearsLived: ageAtDeath,
        throneYears: 0,
        text: `${player.givenName} ${player.familyName} died with no living direct descendant to bear the line onward.`
      }
    ]
  };
}

function adjustVitals(character: Character, delta: Partial<Record<keyof NonNullable<Character["vitals"]>, number>>): Character {
  const vitals = character.vitals ?? { health: character.stats.health * 5, happiness: 55, strength: character.stats.martial * 5, honor: 50 };
  return {
    ...character,
    vitals: {
      health: clamp(vitals.health + (delta.health ?? 0), 0, 100),
      happiness: clamp(vitals.happiness + (delta.happiness ?? 0), 0, 100),
      strength: clamp(vitals.strength + (delta.strength ?? 0), 0, 100),
      honor: clamp(vitals.honor + (delta.honor ?? 0), 0, 100)
    }
  };
}

function replaceCharacter(world: GameWorld, character: Character): GameWorld {
  return { ...world, characters: { ...world.characters, [character.id]: character } };
}

function worldRng(world: GameWorld, label: string): Rng {
  const seed = `${world.seed}:${label}:${world.year}:${world.eventLog.length}:${world.yearLog.length}`;
  return {
    ...worldSeedRng(seed),
    seed
  };
}

function worldSeedRng(seed: string): Rng {
  // Dynamic import would make this awkward for consumers; keep the helper local by requiring caller-facing rng only at module scope.
  const state = { rng: undefined as Rng | undefined };
  if (!state.rng) {
    throw new Error("worldSeedRng placeholder should be replaced by createRng during build.");
  }
  return state.rng;
}
