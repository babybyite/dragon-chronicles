export type HouseStatus = "minor" | "major" | "royal" | "extinct";
export type CharacterGoal = "Become Ruler" | "Produce Heir" | "Gain Land" | "Grow Wealth" | "Start War" | "Find Dragon" | "Protect Family" | "Destroy Rival";

export type SimRelationship = {
  targetId: string;
  love: number;
  trust: number;
  respect: number;
  fear: number;
  jealousy: number;
  hatred: number;
  loyalty: number;
  memories: { year: number; text: string; importance: number }[];
};

export type SimCharacter = {
  id: string;
  houseId: string;
  age: number;
  alive: boolean;
  sex: "Female" | "Male";
  spouseId?: string;
  parentIds: string[];
  childIds: string[];
  goals: CharacterGoal[];
  traits: string[];
  titles: string[];
  wealth: number;
  health: number;
  fertility: number;
  ambition: number;
  relationships: SimRelationship[];
  causeOfDeath?: string;
};

export type DynastyHouse = {
  id: string;
  name: string;
  status: HouseStatus;
  prestige: number;
  treasury: number;
  land: number;
  memberIds: string[];
  rivalHouseIds: string[];
  alliedHouseIds: string[];
  inheritedTraitBiases: Record<string, number>;
  history: { year: number; text: string }[];
};

export type Kingdom = {
  id: string;
  name: string;
  rulingHouseId?: string;
  rulerId?: string;
  population: number;
  treasury: number;
  army: number;
  food: number;
  prestige: number;
  magic: number;
  technology: number;
  stability: number;
  atWarWith: string[];
};

export type WorldEvent = {
  id: string;
  year: number;
  type: "birth" | "death" | "marriage" | "war" | "economy" | "succession" | "house" | "relationship";
  text: string;
  characterIds: string[];
  houseIds: string[];
  kingdomIds: string[];
};

export type WorldState = {
  year: number;
  characters: SimCharacter[];
  houses: DynastyHouse[];
  kingdoms: Kingdom[];
  events: WorldEvent[];
};

export type SimulationHooks = {
  createChild?: (mother: SimCharacter, father: SimCharacter, year: number) => SimCharacter;
  createId?: () => string;
  random?: () => number;
};

const clamp = (value: number, min: number, max: number): number => Math.max(min, Math.min(max, value));

function eventId(hooks: SimulationHooks): string {
  return hooks.createId?.() ?? Math.random().toString(36).slice(2, 10);
}

function ageAndMortality(state: WorldState, hooks: SimulationHooks): WorldEvent[] {
  const random = hooks.random ?? Math.random;
  const events: WorldEvent[] = [];
  state.characters = state.characters.map((character) => {
    if (!character.alive) return character;
    const aged = { ...character, age: character.age + 1, health: clamp(character.health - Math.max(0, character.age - 45) * 0.25, 0, 100) };
    const mortality = aged.age < 50 ? 0.002 : Math.min(0.35, 0.006 * (aged.age - 48) + (100 - aged.health) / 500);
    if (random() >= mortality) return aged;
    const dead = { ...aged, alive: false, causeOfDeath: aged.health < 25 ? "illness" : "natural causes" };
    events.push({
      id: eventId(hooks), year: state.year, type: "death",
      text: `${dead.id} died of ${dead.causeOfDeath}.`, characterIds: [dead.id], houseIds: [dead.houseId], kingdomIds: []
    });
    return dead;
  });
  return events;
}

function simulateBirths(state: WorldState, hooks: SimulationHooks): WorldEvent[] {
  if (!hooks.createChild) return [];
  const random = hooks.random ?? Math.random;
  const byId = new Map(state.characters.map((character) => [character.id, character]));
  const children: SimCharacter[] = [];
  const events: WorldEvent[] = [];
  for (const mother of state.characters) {
    if (!mother.alive || mother.sex !== "Female" || mother.age < 16 || mother.age > 45 || !mother.spouseId) continue;
    const father = byId.get(mother.spouseId);
    if (!father?.alive) continue;
    const chance = clamp((mother.fertility + father.fertility) / 240, 0.03, 0.55);
    if (random() >= chance) continue;
    const child = hooks.createChild(mother, father, state.year);
    children.push(child);
    mother.childIds = [...mother.childIds, child.id];
    father.childIds = [...father.childIds, child.id];
    events.push({
      id: eventId(hooks), year: state.year, type: "birth",
      text: `A child was born to ${mother.id} and ${father.id}.`, characterIds: [mother.id, father.id, child.id], houseIds: [child.houseId], kingdomIds: []
    });
  }
  state.characters.push(...children);
  return events;
}

function simulateHouseEconomy(state: WorldState, hooks: SimulationHooks): WorldEvent[] {
  const random = hooks.random ?? Math.random;
  const events: WorldEvent[] = [];
  state.houses = state.houses.map((house) => {
    const livingMembers = house.memberIds.filter((id) => state.characters.some((character) => character.id === id && character.alive));
    if (livingMembers.length === 0 && house.status !== "extinct") {
      events.push({ id: eventId(hooks), year: state.year, type: "house", text: `House ${house.name} became extinct.`, characterIds: [], houseIds: [house.id], kingdomIds: [] });
      return { ...house, status: "extinct", memberIds: livingMembers, history: [...house.history, { year: state.year, text: "The house became extinct." }] };
    }
    const change = Math.round(house.land * 2 + livingMembers.length * 3 + (random() * 30 - 15));
    return { ...house, memberIds: livingMembers, treasury: Math.max(0, house.treasury + change), prestige: Math.max(0, house.prestige + Math.round(change / 20)) };
  });
  return events;
}

function simulateKingdoms(state: WorldState, hooks: SimulationHooks): WorldEvent[] {
  const random = hooks.random ?? Math.random;
  const events: WorldEvent[] = [];
  state.kingdoms = state.kingdoms.map((kingdom) => {
    const harvest = 0.97 + random() * 0.08;
    const population = Math.max(100, Math.round(kingdom.population * (kingdom.food > 30 ? 1.01 : 0.985)));
    const food = clamp(Math.round(kingdom.food * harvest + kingdom.technology * 0.15 - population / 100000), 0, 100);
    const stability = clamp(kingdom.stability + (food > 50 ? 1 : -2) - kingdom.atWarWith.length * 2, 0, 100);
    if (stability < 20 && random() < 0.18) {
      events.push({ id: eventId(hooks), year: state.year, type: "war", text: `Unrest spread across ${kingdom.name}.`, characterIds: [], houseIds: kingdom.rulingHouseId ? [kingdom.rulingHouseId] : [], kingdomIds: [kingdom.id] });
    }
    return { ...kingdom, population, food, stability, treasury: Math.max(0, kingdom.treasury + Math.round(population / 5000) - kingdom.army) };
  });
  return events;
}

export function simulateYear(input: WorldState, hooks: SimulationHooks = {}): WorldState {
  const state: WorldState = {
    ...input,
    year: input.year + 1,
    characters: input.characters.map((character) => ({ ...character, parentIds: [...character.parentIds], childIds: [...character.childIds], goals: [...character.goals], traits: [...character.traits], titles: [...character.titles], relationships: character.relationships.map((relationship) => ({ ...relationship, memories: [...relationship.memories] })) })),
    houses: input.houses.map((house) => ({ ...house, memberIds: [...house.memberIds], rivalHouseIds: [...house.rivalHouseIds], alliedHouseIds: [...house.alliedHouseIds], inheritedTraitBiases: { ...house.inheritedTraitBiases }, history: [...house.history] })),
    kingdoms: input.kingdoms.map((kingdom) => ({ ...kingdom, atWarWith: [...kingdom.atWarWith] })),
    events: [...input.events]
  };
  const annualEvents = [
    ...ageAndMortality(state, hooks),
    ...simulateBirths(state, hooks),
    ...simulateHouseEconomy(state, hooks),
    ...simulateKingdoms(state, hooks)
  ];
  state.events.push(...annualEvents);
  return state;
}
