import type { GameWorld, Id, Quest } from "./types.js";
import type { Rng } from "./rng.js";
import { id } from "./rng.js";

const regions = ["Ashen Coast", "Glasswood", "The Old Barrows", "Dragonspine Pass", "Moonfen", "The Crownroad", "Emberdeep"];
const threats = ["bandit prince", "wyrm cult", "haunted ruin", "rebellious knight", "lost dragon", "cursed inheritance", "smuggled relic"];
const objectives = ["recover", "escort", "investigate", "slay", "negotiate with", "steal", "protect"];

export function generateQuest(world: GameWorld, rng: Rng, patronId?: Id): Quest {
  const targetIds = Object.keys(world.characters).filter((characterId) => characterId !== patronId).slice(0, rng.int(0, 3));
  const objective = rng.pick(objectives);
  const threat = rng.pick(threats);
  const region = rng.pick(regions);
  const danger = rng.int(1, 10);

  return {
    id: id("quest", rng),
    title: `${capitalize(objective)} the ${titleCase(threat)}`,
    patronId,
    targetIds,
    region,
    danger,
    rewardGold: 40 + danger * rng.int(20, 80),
    steps: [
      `Gather rumors in ${region}.`,
      `Face the ${threat}.`,
      rng.chance(0.4) ? "Choose who receives the truth." : "Return with proof."
    ],
    status: "offered"
  };
}

export function acceptQuest(world: GameWorld, questId: Id): GameWorld {
  const quest = world.quests[questId];
  if (!quest) throw new Error(`Unknown quest ${questId}`);
  return { ...world, quests: { ...world.quests, [questId]: { ...quest, status: "active" } } };
}

export function resolveQuest(world: GameWorld, questId: Id, succeeded: boolean): GameWorld {
  const quest = world.quests[questId];
  if (!quest) throw new Error(`Unknown quest ${questId}`);
  const patron = quest.patronId ? world.characters[quest.patronId] : undefined;
  return {
    ...world,
    characters: patron && succeeded ? { ...world.characters, [patron.id]: { ...patron, gold: Math.max(0, patron.gold - quest.rewardGold) } } : world.characters,
    quests: { ...world.quests, [questId]: { ...quest, status: succeeded ? "resolved" : "failed" } }
  };
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function titleCase(value: string): string {
  return value.split(" ").map(capitalize).join(" ");
}
