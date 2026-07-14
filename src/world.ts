import type { Character, Family, GameWorld, Kingdom } from "./types.js";
import { createBloodline, createCharacter } from "./characters.js";
import { createFamily } from "./families.js";
import { createFaction, createKingdom } from "./politics.js";
import { generateEvent } from "./events.js";
import { createRng } from "./rng.js";

export type CreateWorldInput = {
  seed: string;
  year?: number;
  playerName?: string;
  kingdomName?: string;
};

export function createWorld(input: CreateWorldInput): GameWorld {
  const rng = createRng(input.seed);
  const year = input.year ?? 1;
  const bloodline = createBloodline(rng.fork("player-bloodline"));
  const player = createCharacter(rng.fork("player"), { year: year - 18, bloodline, rank: "royal" });
  const namedPlayer: Character = input.playerName ? { ...player, givenName: input.playerName } : player;
  const rivalBloodline = createBloodline(rng.fork("rival-bloodline"));
  const rival = createCharacter(rng.fork("rival"), { year: year - rng.int(20, 45), bloodline: rivalBloodline, rank: "lord" });
  const mentor = createCharacter(rng.fork("mentor"), { year: year - rng.int(45, 70), bloodline, rank: "courtier" });

  const family: Family = createFamily(rng.fork("family"), bloodline.name, bloodline.id, [namedPlayer.id, mentor.id], "Emberhold");
  const rivalFamily: Family = createFamily(rng.fork("rival-family"), rivalBloodline.name, rivalBloodline.id, [rival.id], "Stormwatch");
  const kingdom: Kingdom = createKingdom(
    rng.fork("kingdom"),
    input.kingdomName ?? "The Ember Crown",
    namedPlayer.id,
    "Crownspire",
    [
      createFaction(rng.fork("faction-court"), "The Crown Loyalists", namedPlayer.id, [mentor.id]),
      createFaction(rng.fork("faction-rivals"), `${rival.familyName} Claimants`, rival.id, [rival.id])
    ]
  );

  return {
    schemaVersion: 1,
    seed: input.seed,
    year,
    playerCharacterId: namedPlayer.id,
    characters: {
      [namedPlayer.id]: namedPlayer,
      [rival.id]: rival,
      [mentor.id]: mentor
    },
    bloodlines: {
      [bloodline.id]: { ...bloodline, founderId: namedPlayer.id },
      [rivalBloodline.id]: { ...rivalBloodline, founderId: rival.id }
    },
    families: {
      [family.id]: family,
      [rivalFamily.id]: rivalFamily
    },
    relationships: {},
    marriages: {},
    kingdoms: { [kingdom.id]: kingdom },
    wars: {},
    quests: {},
    items: {},
    eventLog: [],
    flags: {}
  };
}

export function advanceYear(world: GameWorld): GameWorld {
  const rng = createRng(`${world.seed}:year:${world.year}`);
  const livingCharacters = Object.values(world.characters).filter((character) => character.status === "alive");
  const actorIds = livingCharacters.slice(0, Math.max(1, Math.min(2, livingCharacters.length))).map((character) => character.id);
  const event = generateEvent(world, rng.fork("event"), actorIds);
  return {
    ...world,
    year: world.year + 1,
    eventLog: [...world.eventLog, event]
  };
}
