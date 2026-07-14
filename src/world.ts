import type { BirthStatus, Character, Family, GameWorld, Gender, Kingdom } from "./types.js";
import { createBloodline, createCharacter } from "./characters.js";
import { createFamily } from "./families.js";
import { createFaction, createKingdom } from "./politics.js";
import { generateEvent } from "./events.js";
import { createRng } from "./rng.js";
import { advanceChronicleYear } from "./chronicle.js";
import { randomAppearance, randomOrigin } from "./presets.js";

export type CreateWorldInput = {
  seed: string;
  year?: number;
  playerName?: string;
  playerFamilyName?: string;
  playerGender?: Gender;
  playerBirthStatus?: BirthStatus;
  startingAge?: number;
  kingdomName?: string;
};

export function createWorld(input: CreateWorldInput): GameWorld {
  const rng = createRng(input.seed);
  const year = input.year ?? input.startingAge ?? 24;
  const startingAge = input.startingAge ?? 24;
  const playerBirthStatus = input.playerBirthStatus ?? "noble";
  const bloodline = createBloodline(rng.fork("player-bloodline"));
  const player = createCharacter(rng.fork("player"), {
    year: year - startingAge,
    bloodline,
    rank: playerBirthStatus === "royal" ? "royal" : "courtier",
    gender: input.playerGender,
    familyName: input.playerFamilyName
  });
  const namedPlayer: Character = {
    ...player,
    givenName: input.playerName ?? player.givenName,
    familyName: input.playerFamilyName ?? player.familyName,
    birthStatus: playerBirthStatus,
    origin: randomOrigin(rng.fork("origin")),
    appearance: randomAppearance(rng.fork("appearance"), playerBirthStatus),
    vitals: {
      health: 70,
      happiness: 55,
      strength: 55,
      honor: 50
    }
  };
  const rivalBloodline = createBloodline(rng.fork("rival-bloodline"));
  const rival = withLifeDetails(
    createCharacter(rng.fork("rival"), { year: year - rng.int(20, 45), bloodline: rivalBloodline, rank: "lord" }),
    rng.fork("rival-life"),
    "noble"
  );
  const mentor = withLifeDetails(
    createCharacter(rng.fork("mentor"), { year: year - rng.int(45, 70), bloodline, rank: "courtier" }),
    rng.fork("mentor-life"),
    "noble"
  );

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
    dragons: {},
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
    yearLog: [
      {
        year,
        lines: [`${namedPlayer.givenName} ${namedPlayer.familyName} began this year beneath a sky heavy with omen and promise.`],
        actionsUsed: 0
      }
    ],
    milestones: [],
    summaries: [],
    generations: 1,
    finished: false,
    flags: {}
  };
}

export function advanceYear(world: GameWorld): GameWorld {
  const rng = createRng(`${world.seed}:year:${world.year}`);
  const livingCharacters = Object.values(world.characters).filter((character) => character.status === "alive");
  const actorIds = livingCharacters.slice(0, Math.max(1, Math.min(2, livingCharacters.length))).map((character) => character.id);
  const event = generateEvent(world, rng.fork("event"), actorIds);
  return advanceChronicleYear({
    ...world,
    eventLog: [...world.eventLog, event]
  });
}

function withLifeDetails(character: Character, rng: ReturnType<typeof createRng>, birthStatus: BirthStatus): Character {
  return {
    ...character,
    birthStatus,
    origin: randomOrigin(rng.fork("origin")),
    appearance: randomAppearance(rng.fork("appearance"), birthStatus),
    vitals: {
      health: 70,
      happiness: 55,
      strength: 55,
      honor: 50
    }
  };
}
