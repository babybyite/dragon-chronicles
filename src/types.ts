export type Id = string;
export type Year = number;

export type StatBlock = {
  charm: number;
  cunning: number;
  diplomacy: number;
  dragonAffinity: number;
  fertility: number;
  health: number;
  learning: number;
  martial: number;
  stewardship: number;
  will: number;
};

export type Gender = "female" | "male" | "nonbinary";
export type LifeStatus = "alive" | "missing" | "dead";
export type RelationshipKind = "kin" | "friend" | "rival" | "lover" | "spouse" | "liege" | "vassal" | "mentor" | "enemy" | "ward";
export type PoliticalRank = "wanderer" | "courtier" | "knight" | "lord" | "high_lord" | "royal" | "sovereign";
export type BirthStatus = "royal" | "noble" | "bastard" | "commoner";
export type Origin = "northlands" | "southern_isles" | "eastern_courts" | "western_marches" | "steppe" | "deep_cities";

export type Appearance = {
  hairStyle: string;
  hairColor: string;
  faceTrait: string;
  clothing: string;
  clothColor: string;
};

export type VitalTrack = {
  health: number;
  happiness: number;
  strength: number;
  honor: number;
};

export type Trait = {
  id: string;
  label: string;
  category: "personality" | "body" | "bloodline" | "reputation" | "secret" | "dragon";
  intensity?: number;
};

export type Bloodline = {
  id: Id;
  name: string;
  motto: string;
  sigil: string;
  founderId?: Id;
  prestige: number;
  dragonBond: number;
  inheritedTraits: Trait[];
  curse?: string;
};

export type PortraitRef = {
  id: Id;
  characterId?: Id;
  kind: "premade" | "ai" | "placeholder";
  prompt?: string;
  assetKey?: string;
  tags: string[];
};

export type Character = {
  id: Id;
  givenName: string;
  familyName: string;
  gender: Gender;
  bornYear: Year;
  deathYear?: Year;
  causeOfDeath?: string;
  status: LifeStatus;
  rank: PoliticalRank;
  birthStatus?: BirthStatus;
  origin?: Origin;
  appearance?: Appearance;
  vitals?: VitalTrack;
  bloodlineId: Id;
  parentIds: Id[];
  spouseIds: Id[];
  childrenIds: Id[];
  stats: StatBlock;
  traits: Trait[];
  portrait: PortraitRef;
  inventoryIds: Id[];
  gold: number;
  secrets: string[];
  dragonId?: Id;
  wardOfId?: Id;
};

export type Dragon = {
  id: Id;
  name: string;
  riderId?: Id;
  bornYear: Year;
  status: LifeStatus;
  trust: number;
  ferocity: number;
  color: string;
  temperament: "gentle" | "proud" | "wild" | "brooding" | "playful" | "cruel";
};

export type Family = {
  id: Id;
  bloodlineId: Id;
  name: string;
  seat?: string;
  memberIds: Id[];
  livingMemberIds: Id[];
};

export type Relationship = {
  id: Id;
  fromId: Id;
  toId: Id;
  kinds: RelationshipKind[];
  affection: number;
  trust: number;
  fear: number;
  respect: number;
  resentment: number;
  history: string[];
};

export type Marriage = {
  id: Id;
  spouseIds: [Id, Id];
  year: Year;
  allianceValue: number;
  childrenIds: Id[];
  status: "active" | "annulled" | "widowed" | "ended";
};

export type Faction = {
  id: Id;
  name: string;
  leaderId: Id;
  memberIds: Id[];
  treasury: number;
  influence: number;
  grievance: number;
};

export type Kingdom = {
  id: Id;
  name: string;
  rulerId: Id;
  capital: string;
  laws: Record<string, number>;
  factions: Faction[];
  stability: number;
  dread: number;
  prosperity: number;
};

export type War = {
  id: Id;
  name: string;
  attackerFactionId: Id;
  defenderFactionId: Id;
  startedYear: Year;
  score: number;
  status: "preparing" | "active" | "truce" | "ended";
};

export type EventChoice = {
  id: string;
  label: string;
  effects: EventEffect[];
};

export type EventEffect =
  | { type: "stat"; characterId: Id; stat: keyof StatBlock; delta: number }
  | { type: "gold"; characterId: Id; delta: number }
  | { type: "relationship"; fromId: Id; toId: Id; affection?: number; trust?: number; resentment?: number }
  | { type: "kingdom"; stability?: number; dread?: number; prosperity?: number }
  | { type: "trait"; characterId: Id; trait: Trait };

export type GameEvent = {
  id: Id;
  title: string;
  body: string;
  year: Year;
  actorIds: Id[];
  tags: string[];
  choices: EventChoice[];
};

export type Quest = {
  id: Id;
  title: string;
  patronId?: Id;
  targetIds: Id[];
  region: string;
  danger: number;
  rewardGold: number;
  steps: string[];
  status: "offered" | "active" | "resolved" | "failed";
};

export type Item = {
  id: Id;
  name: string;
  kind: "weapon" | "armor" | "relic" | "ingredient" | "book" | "dragon_gear" | "trade_good";
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
  value: number;
  tags: string[];
};

export type CraftingRecipe = {
  id: Id;
  output: Item;
  ingredientIds: Id[];
  skill: keyof StatBlock;
  difficulty: number;
};

export type DialogueLine = {
  speakerId: Id;
  text: string;
  mood: "warm" | "cold" | "scheming" | "afraid" | "furious" | "solemn" | "playful";
};

export type ChronicleYearLog = {
  year: Year;
  lines: string[];
  actionsUsed: number;
};

export type Milestone = {
  id: Id;
  title: string;
  year: Year;
  characterId?: Id;
};

export type LifeSummary = {
  id: Id;
  characterId: Id;
  name: string;
  ageAtDeath: number;
  causeOfDeath: string;
  generations: number;
  yearsLived: number;
  throneYears: number;
  text: string;
};

export type GameWorld = {
  schemaVersion: number;
  seed: string;
  year: Year;
  playerCharacterId: Id;
  characters: Record<Id, Character>;
  dragons: Record<Id, Dragon>;
  bloodlines: Record<Id, Bloodline>;
  families: Record<Id, Family>;
  relationships: Record<Id, Relationship>;
  marriages: Record<Id, Marriage>;
  kingdoms: Record<Id, Kingdom>;
  wars: Record<Id, War>;
  quests: Record<Id, Quest>;
  items: Record<Id, Item>;
  eventLog: GameEvent[];
  yearLog: ChronicleYearLog[];
  milestones: Milestone[];
  summaries: LifeSummary[];
  generations: number;
  finished: boolean;
  flags: Record<string, unknown>;
};

export type SaveFile = {
  schemaVersion: number;
  savedAt: string;
  slotId: string;
  world: GameWorld;
};
