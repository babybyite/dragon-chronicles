import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Image,
  ImageBackground,
  Modal,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  Pressable,
  View
} from "react-native";
import type { ImageSourcePropType } from "react-native";
import {
  ravenwoodGuestPortraitAssets,
  ravenwoodPlayerPortraitAssets,
  ravenwoodStaffPortraitAssets
} from "./ravenwoodPortraitAssets";
import type { MysteryVisualRace, RavenwoodGuestPortraitAsset } from "./ravenwoodPortraitAssets";

type ThemeName = "dark" | "pastel";
type Screen = "menu" | "bookSelect" | "builder1" | "builder2" | "chronicle" | "load" | "past" | "settings" | "family" | "relationships" | "character" | "journal" | "paper" | "mysteryDetectiveSelect" | "mysteryPortraitSelect" | "mystery" | "mysteryCharacter" | "mysteryRelations" | "mysteryMap" | "mysteryJournal";
type BirthStatus = "Royal" | "Noble" | "Bastard" | "Commoner";
type Sex = "Female" | "Male";
type RelationCategory = "family" | "palace" | "city";

type CharacterDraft = {
  firstName: string;
  familyName: string;
  sex: Sex;
  birthStatus: BirthStatus;
  bloodline: string;
  startAge: number;
  origin: string;
  hairStyle: string;
  hairColor: string;
  faceTrait: string;
  clothing: string;
  clothColor: string;
};

type Person = {
  id: string;
  firstName: string;
  familyName: string;
  sex: Sex;
  age: number;
  birthStatus: BirthStatus;
  bloodline: string;
  origin: string;
  hairStyle?: string;
  hairColor?: string;
  relation: string;
  parentIds: string[];
  spouseId?: string;
  isWard?: boolean;
  isFullSibling?: boolean;
  royalTitle?: "Ruling King" | "Ruling Queen";
  successionRank?: number;
  visibleBastardSigns?: boolean;
  memory?: string[];
  alive: boolean;
};

type Relation = {
  id: string;
  firstName: string;
  familyName: string;
  sex: Sex;
  relation: string;
  age: number;
  birthStatus: BirthStatus;
  bloodline: string;
  origin: string;
  hairStyle?: string;
  hairColor?: string;
  category?: RelationCategory;
  trust: number;
  romance: number;
  resentment: number;
  alive: boolean;
  spouseId?: string;
  isWard?: boolean;
  isFullSibling?: boolean;
  royalTitle?: "Ruling King" | "Ruling Queen";
  successionRank?: number;
  familyPersonId?: string;
  visibleBastardSigns?: boolean;
  allianceFormed?: boolean;
  legitimacyConvinced?: boolean;
  actionUses: Record<string, number>;
  actionLimit: number;
  memory: string[];
  note: string;
};

type PendingBirth = {
  id: string;
  parentRelationId?: string;
  babyCount: number;
  babySexes: Sex[];
  defaultNames: string[];
  message: string;
};

type StoryMessageSegment = {
  text: string;
  color?: string;
  npcId?: string;
};

type StoryMessage = {
  id: string;
  speaker: "GM" | "Player" | "System";
  text: string;
  roll?: string;
  rich?: StoryMessageSegment[];
};

type StoryChoice = {
  id: string;
  label: string;
  dc: number;
  ability: "Strength" | "Honor" | "Instinct";
};

type ActiveScene = {
  type: "combat" | "engagement";
  title: string;
  roundsLeft: number;
};

type Story = {
  id: string;
  title: string;
  player: CharacterDraft & {
    id: string;
    age: number;
    alive: boolean;
    health: number;
    happiness: number;
    strength: number;
    honor: number;
    gold: number;
    possessions: string[];
    possessionValues: Record<string, number>;
    spouseId?: string;
    visibleBastardSigns: boolean;
    legitimacyDoubt: number;
    fertility: number;
    labourLimit: number;
    legitimacySupport: { noble: number; royal: number; requiredNoble: number; petitioned: boolean };
    memory: string[];
    causeOfDeath?: string;
  };
  family: Person[];
  royalFamily: Person[];
  relations: Relation[];
  currentYear: number;
  currentPlace: string;
  storyMessages: StoryMessage[];
  storyChoices: StoryChoice[];
  activeScene?: ActiveScene | null;
  yearLog: { year: number; lines: string[] }[];
  placeUses: Record<string, number>;
  milestones: { id: string; title: string; year: number }[];
  pendingBirth?: PendingBirth | null;
  outerPolitics: string[];
  innerPolitics: string[];
  finished: boolean;
  awaitingSuccession?: boolean;
  summary?: string;
};

type Daytime = "Morning" | "Breakfast" | "Midday" | "Lunch" | "Afternoon" | "Evening" | "Night" | "Midnight";

type MysteryCheckKind = "Athletics" | "History" | "Search" | "Medicine" | "Charisma" | "Persuasion" | "Deception" | "Sleight of Hand" | "Stealth" | "Composure" | "Rizz";

type MysteryDetectiveQuirk = {
  id: string;
  label: string;
  check: MysteryCheckKind;
  modifier: number;
};

type MysteryDetectiveProfile = Pick<CharacterDraft, "firstName" | "familyName" | "sex" | "origin" | "hairStyle" | "hairColor" | "faceTrait"> & {
  id: string;
  portraitLineage: string;
  visualRace: MysteryVisualRace;
  quirks: MysteryDetectiveQuirk[];
};

const mysteryRollTypes: MysteryCheckKind[] = ["Athletics", "History", "Search", "Medicine", "Charisma", "Persuasion", "Deception", "Sleight of Hand", "Stealth", "Composure", "Rizz"];

type MysteryRoom = {
  id: string;
  name: string;
  floor: 1 | 2 | 3;
  kind: "public" | "guest" | "staff" | "service" | "hidden";
  accessible: boolean;
  occupantIds: string[];
  bedSetup?: string;
  capacity?: number;
};

type MysteryNpc = {
  id: string;
  firstName: string;
  familyName: string;
  sex: Sex;
  age: number;
  role: "Guest" | "Staff";
  familyStatus: string;
  education: string;
  occupation: string;
  interests: string[];
  reasonOfStay: string;
  currentStay: string;
  plannedStay: string;
  previousStay: string;
  secret: string;
  quirk: string;
  roomId: string;
  stationRoomId: string;
  trust: number;
  romance: number;
  romanceRevealed: boolean;
  familyRelationNote?: string;
  ravenwoodPortraitKey?: string;
  portraitLineage?: string;
  visualRace?: MysteryVisualRace;
  alive: boolean;
  isChild: boolean;
};

type MysteryMurder = {
  victimId: string;
  killerId: string;
  day: number;
  daytime: Daytime;
  roomId: string;
  method: string;
  motive: string;
  proof: string;
  proofs: string[];
  discovered: boolean;
};

type MysteryNpcRelationshipKind = "Family" | "Marriage" | "Friendship" | "Rivalry" | "Romance" | "Affair" | "Debt" | "Blackmail" | "Witness" | "Protection" | "Suspicion" | "Work";

type MysteryNpcRelationship = {
  id: string;
  fromId: string;
  toId: string;
  kind: MysteryNpcRelationshipKind;
  detail: string;
  hidden: boolean;
  trustImpact: number;
  motiveRisk: number;
};

type MysteryGame = {
  id: string;
  title: string;
  player: Pick<CharacterDraft, "firstName" | "familyName" | "sex" | "origin" | "hairStyle" | "hairColor" | "faceTrait"> & Pick<PortraitSubject, "ravenwoodPortraitKey" | "portraitLineage" | "visualRace"> & { id: string; age: number; detectiveId?: string; detectiveQuirks?: MysteryDetectiveQuirk[] };
  day: number;
  daytime: Daytime;
  rooms: MysteryRoom[];
  npcs: MysteryNpc[];
  npcRelationships: MysteryNpcRelationship[];
  murders: MysteryMurder[];
  currentRoomId: string;
  playerRoomId: string;
  messages: StoryMessage[];
  journal: StoryMessage[];
  journalNotes: string;
  sanityLedger: string[];
  discoveredProof: string[];
  inventory: string[];
  finished: boolean;
  won: boolean;
  summary?: string;
  lossPending?: boolean;
};

const themes = {
  dark: {
    bg: "#09090c",
    panel: "#181820",
    panel2: "#24242e",
    text: "#f6f1ee",
    dim: "#b8b2b8",
    accent: "#b5122b",
    line: "#4f4f59",
    silver: "#c4c7cc",
    gold: "#f0c45c",
    good: "#9fb29b",
    warning: "#d6a84b"
  },
  pastel: {
    bg: "#fbf6ee",
    panel: "#fffaf2",
    panel2: "#eef3e8",
    text: "#403844",
    dim: "#817784",
    accent: "#c7839d",
    line: "#d9d0dc",
    silver: "#a8aab3",
    gold: "#b9932f",
    good: "#9aad92",
    warning: "#b99354"
  }
};

const menuBackgrounds = {
  dark: require("./assets/backgrounds/main-menu-dark.png"),
  pastel: require("./assets/backgrounds/main-menu-pastel.png")
};

const locationBackgrounds: Record<string, ImageSourcePropType> = {
  "palace halls": require("./assets/locations/palace_halls.png"),
  "throne room": require("./assets/locations/palace_halls.png"),
  "counsil room": require("./assets/locations/palace_halls.png"),
  "ball room": require("./assets/locations/ball_room.png"),
  "private chambers": require("./assets/locations/private_chambers.png"),
  chambers: require("./assets/locations/private_chambers.png"),
  home: require("./assets/locations/private_chambers.png"),
  "palace gardens": require("./assets/locations/palace_gardens.png"),
  market: require("./assets/locations/market.png"),
  "city gates": require("./assets/locations/city_gates.png"),
  docks: require("./assets/locations/docks.png"),
  tavern: require("./assets/locations/tavern.png"),
  forest: require("./assets/locations/forest.png"),
  slums: require("./assets/locations/slums.png"),
  sewers: require("./assets/locations/sewers.png")
};

const ravenwoodDarkRoomBackgrounds: Record<string, ImageSourcePropType> = {
  "grand-hall": require("./assets/ravenwood/room_backgrounds/great_hall.jpg"),
  "drawing-room": require("./assets/ravenwood/room_backgrounds/drawing_room.jpg"),
  "dining-room": require("./assets/ravenwood/room_backgrounds/dining_room.jpg"),
  library: require("./assets/ravenwood/room_backgrounds/library.jpg"),
  conservatory: require("./assets/ravenwood/room_backgrounds/conservatory.jpg"),
  "billiards-room": require("./assets/ravenwood/room_backgrounds/billiards_room.jpg"),
  "smoking-room": require("./assets/ravenwood/room_backgrounds/smoking_room.jpg"),
  "garden-terrace": require("./assets/ravenwood/room_backgrounds/garden_terrace.jpg"),
  kitchen: require("./assets/ravenwood/room_backgrounds/kitchen.jpg"),
  "staff-corridor": require("./assets/ravenwood/room_backgrounds/staff_corridor.jpg"),
  "servants-hall": require("./assets/ravenwood/room_backgrounds/staff_corridor.jpg"),
  pantry: require("./assets/ravenwood/room_backgrounds/kitchen.jpg"),
  laundry: require("./assets/ravenwood/room_backgrounds/staff_corridor.jpg"),
  "back-stairs": require("./assets/ravenwood/room_backgrounds/staff_corridor.jpg"),
  "west-gallery": require("./assets/ravenwood/room_backgrounds/great_hall.jpg")
};

const ravenwoodLightRoomBackgrounds: Record<string, ImageSourcePropType> = {
  "grand-hall": require("./assets/ravenwood/room_backgrounds/great_hall_light.jpg"),
  "drawing-room": require("./assets/ravenwood/room_backgrounds/drawing_room_light.jpg"),
  "dining-room": require("./assets/ravenwood/room_backgrounds/dining_room_light.jpg"),
  library: require("./assets/ravenwood/room_backgrounds/library_light.jpg"),
  conservatory: require("./assets/ravenwood/room_backgrounds/conservatory_light.jpg"),
  "billiards-room": require("./assets/ravenwood/room_backgrounds/billiards_room_light.jpg"),
  "smoking-room": require("./assets/ravenwood/room_backgrounds/smoking_room_light.jpg"),
  "garden-terrace": require("./assets/ravenwood/room_backgrounds/garden_terrace_light.jpg"),
  kitchen: require("./assets/ravenwood/room_backgrounds/kitchen_light.jpg"),
  "staff-corridor": require("./assets/ravenwood/room_backgrounds/staff_corridor_light.jpg"),
  "servants-hall": require("./assets/ravenwood/room_backgrounds/staff_corridor_light.jpg"),
  pantry: require("./assets/ravenwood/room_backgrounds/kitchen_light.jpg"),
  laundry: require("./assets/ravenwood/room_backgrounds/staff_corridor_light.jpg"),
  "back-stairs": require("./assets/ravenwood/room_backgrounds/staff_corridor_light.jpg"),
  "west-gallery": require("./assets/ravenwood/room_backgrounds/great_hall_light.jpg")
};

function ravenwoodRoomBackgroundFor(mystery: Pick<MysteryGame, "rooms" | "currentRoomId">, themeName: ThemeName): ImageSourcePropType {
  const backgrounds = themeName === "dark" ? ravenwoodDarkRoomBackgrounds : ravenwoodLightRoomBackgrounds;
  const currentRoom = mystery.rooms.find((room) => room.id === mystery.currentRoomId);
  if (backgrounds[mystery.currentRoomId]) return backgrounds[mystery.currentRoomId];
  if (currentRoom?.kind === "service") return backgrounds.kitchen;
  if (currentRoom?.kind === "staff") return backgrounds["staff-corridor"];
  return backgrounds["grand-hall"];
}

const FAMILY_TREE_CANVAS_WIDTH = 1640;
const RAVENWOOD_MIN_NPC_AGE = 9;
const RAVENWOOD_MAX_NPC_AGE = 75;
const RAVENWOOD_MIN_STAFF_AGE = 18;
const ravenwoodPlayerSelectableAges = [10, 16, 24, 30, 50];

const ravenwoodPortraitByKey: Record<string, RavenwoodGuestPortraitAsset> = Object.fromEntries(
  [...ravenwoodGuestPortraitAssets, ...ravenwoodStaffPortraitAssets, ...ravenwoodPlayerPortraitAssets].map((asset) => [asset.key, asset])
);

type PortraitSubject = {
  id?: string;
  firstName: string;
  familyName: string;
  sex: Sex;
  age: number;
  origin?: string;
  hairStyle?: string;
  hairColor?: string;
  faceTrait?: string;
  bloodline?: string;
  ravenwoodPortraitKey?: string;
  portraitLineage?: string;
  visualRace?: MysteryVisualRace;
  alive?: boolean;
};

type MysteryDetectiveProfilePreset = Omit<MysteryDetectiveProfile, "sex" | "portraitLineage" | "visualRace">;

const ravenwoodDetectiveProfilePresets: Record<string, MysteryDetectiveProfilePreset> = {
  "player-custom01-row-01": {
    id: "lin-vale",
    firstName: "Lin",
    familyName: "Vale",
    origin: "Western Marches",
    hairStyle: "Wavy",
    hairColor: "Brown",
    faceTrait: "Sharp-Boned",
    quirks: [
      { id: "dog", label: "Keeps a retired search dog", check: "Search", modifier: 3 },
      { id: "voices", label: "Never forgets a voice", check: "History", modifier: 3 },
      { id: "stairs", label: "Old stair injury aches in a chase", check: "Athletics", modifier: -3 }
    ]
  },
  "player-custom01-row-02": {
    id: "adrian-locke",
    firstName: "Adrian",
    familyName: "Locke",
    origin: "Northlands",
    hairStyle: "Short",
    hairColor: "Black",
    faceTrait: "Scarred",
    quirks: [
      { id: "clock", label: "Repairs pocket watches by habit", check: "Sleight of Hand", modifier: 3 },
      { id: "soldier", label: "Served as a field orderly", check: "Medicine", modifier: 3 },
      { id: "temper", label: "Answers insults too quickly", check: "Persuasion", modifier: -3 }
    ]
  },
  "player-custom02-row-01": {
    id: "amara-voss",
    firstName: "Amara",
    familyName: "Voss",
    origin: "Deep Cities",
    hairStyle: "Long Straight",
    hairColor: "Blonde",
    faceTrait: "Mismatched Eyes",
    quirks: [
      { id: "perfume", label: "Knows expensive perfumes on sight", check: "Search", modifier: 3 },
      { id: "salon", label: "Was raised around salon gossip", check: "Persuasion", modifier: 3 },
      { id: "heights", label: "Loses nerve near high balconies", check: "Composure", modifier: -3 }
    ]
  },
  "player-custom02-row-02": {
    id: "hana-saito",
    firstName: "Hana",
    familyName: "Saito",
    origin: "Island Courts",
    hairStyle: "Messy Bun",
    hairColor: "Black",
    faceTrait: "Freckles",
    quirks: [
      { id: "garden", label: "Grew up tending kitchen gardens", check: "Medicine", modifier: 3 },
      { id: "quiet", label: "Moves quietly when others argue", check: "Stealth", modifier: 3 },
      { id: "blood", label: "Gets faint at the sight of fresh blood", check: "Composure", modifier: -3 }
    ]
  },
  "player-custom02-row-03": {
    id: "felix-ashford",
    firstName: "Felix",
    familyName: "Ashford",
    origin: "Western Marches",
    hairStyle: "Wavy",
    hairColor: "Blonde",
    faceTrait: "Sharp-Boned",
    quirks: [
      { id: "ledger", label: "Balances household ledgers for fun", check: "History", modifier: 3 },
      { id: "mirror", label: "Practiced false smiles in mirrors", check: "Deception", modifier: 3 },
      { id: "needle", label: "Cannot look at medical needles", check: "Medicine", modifier: -3 }
    ]
  },
  "player-custom03-row-01": {
    id: "beatrice-gray",
    firstName: "Beatrice",
    familyName: "Gray",
    origin: "Northlands",
    hairStyle: "Long Straight",
    hairColor: "Platinum Blonde",
    faceTrait: "Half-Blind",
    quirks: [
      { id: "archive", label: "Knows old trial records by heart", check: "History", modifier: 3 },
      { id: "bedside", label: "Volunteered in a fever ward", check: "Medicine", modifier: 3 },
      { id: "cold", label: "Hands shake in cold rooms", check: "Sleight of Hand", modifier: -3 }
    ]
  },
  "player-custom03-row-02": {
    id: "nikhil-rao",
    firstName: "Nikhil",
    familyName: "Rao",
    origin: "Southern Provinces",
    hairStyle: "Curly",
    hairColor: "Black",
    faceTrait: "Sharp-Boned",
    quirks: [
      { id: "theatre", label: "Can mimic polite manners perfectly", check: "Rizz", modifier: 3 },
      { id: "ink", label: "Spots forged ink at a glance", check: "Search", modifier: 3 },
      { id: "candor", label: "Finds direct lies distasteful", check: "Deception", modifier: -3 }
    ]
  },
  "player-custom03-row-03": {
    id: "zadie-marlow",
    firstName: "Zadie",
    familyName: "Marlow",
    origin: "Harbor Quarter",
    hairStyle: "Braided",
    hairColor: "Dark Red",
    faceTrait: "Fire-Burned",
    quirks: [
      { id: "cards", label: "Reads people over card games", check: "Deception", modifier: 3 },
      { id: "dockside", label: "Knows how smugglers hide cargo", check: "Search", modifier: 3 },
      { id: "rank", label: "Bridles under aristocratic orders", check: "Charisma", modifier: -3 }
    ]
  },
  "player-custom03-row-04": {
    id: "milo-keene",
    firstName: "Milo",
    familyName: "Keene",
    origin: "Deep Cities",
    hairStyle: "Messy Bun",
    hairColor: "Brown",
    faceTrait: "Freckles",
    quirks: [
      { id: "maps", label: "Sketches floor plans from memory", check: "Search", modifier: 3 },
      { id: "student", label: "Still remembers university scandals", check: "History", modifier: 3 },
      { id: "flirt", label: "Turns awkward when flirted with", check: "Rizz", modifier: -3 }
    ]
  },
  "player-custom04-row-01": {
    id: "arun-mehta",
    firstName: "Arun",
    familyName: "Mehta",
    origin: "Southern Provinces",
    hairStyle: "Short",
    hairColor: "Black",
    faceTrait: "Scarred",
    quirks: [
      { id: "boxing", label: "Boxed at university", check: "Athletics", modifier: 3 },
      { id: "hospital", label: "Recognizes battlefield injuries", check: "Medicine", modifier: 3 },
      { id: "pride", label: "Takes insults personally", check: "Persuasion", modifier: -3 }
    ]
  },
  "player-custom04-row-02": {
    id: "lydia-fenwick",
    firstName: "Lydia",
    familyName: "Fenwick",
    origin: "Western Marches",
    hairStyle: "Curly",
    hairColor: "Ginger",
    faceTrait: "Freckles",
    quirks: [
      { id: "aunt", label: "Has an aunt in every respectable scandal", check: "Persuasion", modifier: 3 },
      { id: "waltz", label: "Can cross a ballroom unnoticed", check: "Stealth", modifier: 3 },
      { id: "vase", label: "Knocks over delicate things", check: "Sleight of Hand", modifier: -3 }
    ]
  },
  "player-custom04-row-04": {
    id: "soren-park",
    firstName: "Soren",
    familyName: "Park",
    origin: "Eastern Coast",
    hairStyle: "Shaved",
    hairColor: "Black",
    faceTrait: "Vitiligo",
    quirks: [
      { id: "smoke", label: "Can place pipe tobacco by scent", check: "Search", modifier: 3 },
      { id: "mask", label: "Never lets panic reach the face", check: "Composure", modifier: 3 },
      { id: "romance", label: "Misses obvious romantic hints", check: "Rizz", modifier: -3 }
    ]
  },
  "player-player05-row-02": {
    id: "julian-north",
    firstName: "Julian",
    familyName: "North",
    origin: "Northlands",
    hairStyle: "Short",
    hairColor: "Brown",
    faceTrait: "Sharp-Boned",
    quirks: [
      { id: "horse", label: "Was raised around hunting parties", check: "Athletics", modifier: 3 },
      { id: "toast", label: "Can charm a hostile dinner table", check: "Charisma", modifier: 3 },
      { id: "library-dust", label: "Coughs in dusty archives", check: "Search", modifier: -3 }
    ]
  },
  "player-player05-row-03": {
    id: "mira-nair",
    firstName: "Mira",
    familyName: "Nair",
    origin: "Southern Provinces",
    hairStyle: "Long Straight",
    hairColor: "Black",
    faceTrait: "Mismatched Eyes",
    quirks: [
      { id: "cards", label: "Reads people over card games", check: "Deception", modifier: 3 },
      { id: "perfume", label: "Knows expensive perfumes on sight", check: "Search", modifier: 3 },
      { id: "storm", label: "Sleeps badly during storms", check: "Composure", modifier: -3 }
    ]
  },
  "player-player05-row-04": {
    id: "lucian-crow",
    firstName: "Lucian",
    familyName: "Crow",
    origin: "Western Marches",
    hairStyle: "Curly",
    hairColor: "Dark Red",
    faceTrait: "Sharp-Boned",
    quirks: [
      { id: "boxing", label: "Boxed at university", check: "Athletics", modifier: 3 },
      { id: "theatre", label: "Can mimic polite manners perfectly", check: "Rizz", modifier: 3 },
      { id: "dust", label: "Coughs in dusty archives", check: "Search", modifier: -3 }
    ]
  }
};

function fallbackMysteryDetectiveProfile(asset: RavenwoodGuestPortraitAsset, index: number): MysteryDetectiveProfilePreset {
  const fallbackFirstNames = asset.sex === "Female"
    ? ["Elise", "Maribel", "Nadia", "Tamsin"]
    : ["Edwin", "Rowan", "Cassian", "Tristan"];
  const fallbackFamilyNames = ["Vale", "Locke", "Gray", "Marlow"];
  return {
    id: `detective-${asset.lineage}`,
    firstName: fallbackFirstNames[index % fallbackFirstNames.length],
    familyName: fallbackFamilyNames[index % fallbackFamilyNames.length],
    origin: "Western Marches",
    hairStyle: "Wavy",
    hairColor: asset.sex === "Female" ? "Brown" : "Black",
    faceTrait: "Sharp-Boned",
    quirks: [
      { id: `search-${asset.lineage}`, label: "Notices what servants move twice", check: "Search", modifier: 3 },
      { id: `history-${asset.lineage}`, label: "Collects old court scandals", check: "History", modifier: 3 },
      { id: `composure-${asset.lineage}`, label: "Goes quiet when accused directly", check: "Composure", modifier: -3 }
    ]
  };
}

const ravenwoodDetectiveProfiles: MysteryDetectiveProfile[] = ravenwoodPlayerPortraitAssets
  .filter((asset) => asset.age === 24)
  .sort((a, b) => a.lineage.localeCompare(b.lineage))
  .map((asset, index) => {
    const preset = ravenwoodDetectiveProfilePresets[asset.lineage] ?? fallbackMysteryDetectiveProfile(asset, index);
    return {
      ...preset,
      sex: asset.sex,
      portraitLineage: asset.lineage,
      visualRace: asset.visualRace
    };
  });

const firstNames = ["Aelira", "Mirelle", "Vaessa", "Rowan", "Lucian", "Dorian", "Veyr", "Sable", "Corenna", "Tavik"];
const childNames = ["Elian", "Mara", "Neris", "Orren", "Lysa", "Theo", "Asha", "Rook", "Selene", "Bryn"];
const extraNames = ["Ilyra", "Cassian", "Maelor", "Nyra", "Edric", "Rhaen", "Tamsin", "Gareth", "Yselle", "Kael", "Nadia", "Osric", "Helena", "Jory", "Maric", "Evara", "Tristan", "Liora"];
const familyNames = ["Duskblade", "Ashcroft", "Ravenshade", "Embermere", "Wintermere", "Crownfall"];
const bloodlines = ["Child of Atlantis", "Wolf Cub", "Witch Blood", "Common Blood"];
const origins = ["Northlands", "Eastern Courts", "Western Marches", "Steppe", "Deep Cities"];
const hairStyles = ["Short", "Long Straight", "Wavy", "Curly", "Braided", "Shaved", "Messy Bun"];
const hairColors = ["Black", "Brown", "Blonde", "Platinum Blonde", "Ash White", "Ginger", "Dark Red"];
const faceTraits = ["Freckles", "Scarred", "Mismatched Eyes", "Fire-Burned", "Vitiligo", "Half-Blind", "Sharp-Boned", "Glowing Eyes"];

const royalChainClothing = ["Jeweled Court Gown", "Royal Armor", "Crown Silk Robe", "Embroidered State Suit", "Ceremonial Cloak"];
const commonChainClothing = ["Simple Dress", "Work Tunic", "Market Apron", "Hooded Robe", "Patched Leathers"];
const royalChainColors = ["Crimson", "Silver", "Ivory", "Royal Violet", "Deep Black", "Ocean Pearl"];
const commonChainColors = ["Faded Brown", "Moss Green", "Washed Blue", "Ash Grey", "Light Cream", "Clay Red"];

const clothingByStatus: Record<BirthStatus, string[]> = {
  Royal: royalChainClothing,
  Noble: royalChainClothing,
  Bastard: commonChainClothing,
  Commoner: commonChainClothing
};

const clothColorsByStatus: Record<BirthStatus, string[]> = {
  Royal: royalChainColors,
  Noble: royalChainColors,
  Bastard: commonChainColors,
  Commoner: commonChainColors
};

const placesByStatus: Record<BirthStatus, string[]> = {
  Noble: ["palace halls", "market", "palace gardens", "ball room", "forest", "private chambers", "city gates", "tavern", "slums", "sewers", "docks"],
  Royal: ["private chambers", "throne room", "counsil room", "palace halls", "ball room", "market", "palace gardens", "forest", "chambers", "city gates", "tavern", "slums", "sewers", "docks"],
  Bastard: ["forest", "home", "city gates", "tavern", "slums", "sewers", "docks"],
  Commoner: ["forest", "home", "city gates", "tavern", "slums", "sewers", "docks"]
};

const servantRelations = ["Servant", "Cook", "Stable Hand", "Maid", "Guard", "Cupbearer", "Scribe", "Washer", "Page"];
const courtRelations = ["Cousin", "Courtier", "Knight", "Lady-In-Waiting", "Lordling", "Royal Cousin", "Steward", "Heir's Companion", "Political Rival"];
const possessionsByStatus: Record<BirthStatus, string[]> = {
  Royal: ["signet ring", "state cloak", "jeweled dagger", "private chambers key", "court slippers", "silver comb", "sealed writ"],
  Noble: ["house ring", "riding cloak", "court invitation", "fine boots", "embroidered gloves", "small dagger", "ledger of favors"],
  Bastard: ["worn family token", "travel cloak", "hidden letter", "serviceable dagger", "patched boots", "plain purse", "old blanket"],
  Commoner: ["market purse", "needle kit", "sturdy boots", "blanket roll", "work knife", "bread tin", "wooden charm"]
};

const initialDraft: CharacterDraft = {
  firstName: "",
  familyName: "",
  sex: "Female",
  birthStatus: "Noble",
  bloodline: "Common Blood",
  startAge: 24,
  origin: "Eastern Courts",
  hairStyle: "Long Straight",
  hairColor: "Black",
  faceTrait: "Freckles",
  clothing: clothingByStatus.Noble[4],
  clothColor: clothColorsByStatus.Noble[0]
};

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

function pick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function shuffled<T>(items: T[]): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = rand(0, index);
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

function rand(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function roll(chance: number): boolean {
  return Math.random() < chance;
}

function fullName(person: { firstName: string; familyName: string }): string {
  return `${person.firstName} ${person.familyName}`;
}

function clothingOptionsFor(status: BirthStatus, sex: Sex): string[] {
  const options = clothingByStatus[status];
  if (status !== "Royal" && status !== "Noble") return options;
  if (sex === "Male") return options.filter((option) => option !== "Jeweled Court Gown");
  return options.filter((option) => option !== "Royal Armor");
}

function clothColorOptionsFor(status: BirthStatus): string[] {
  return clothColorsByStatus[status];
}

function titleCase(value: string): string {
  return value
    .split(" ")
    .map((word) => word.split("-").map((part) => (part ? `${part[0].toUpperCase()}${part.slice(1)}` : part)).join("-"))
    .join(" ");
}

function stableHash(value: string): number {
  return value.split("").reduce((hash, char) => (hash * 31 + char.charCodeAt(0)) >>> 0, 7);
}

function fallbackRavenwoodPlayerPortrait(subject: Pick<PortraitSubject, "firstName" | "familyName" | "sex" | "visualRace">): RavenwoodGuestPortraitAsset | null {
  const targetAge = ravenwoodPortraitAge(30);
  const matchingRace = ravenwoodPlayerPortraitAssets.filter((asset) => asset.sex === subject.sex && asset.age === targetAge && (!subject.visualRace || asset.visualRace === subject.visualRace));
  const matchingSex = ravenwoodPlayerPortraitAssets.filter((asset) => asset.sex === subject.sex && asset.age === targetAge);
  const pool = matchingRace.length > 0 ? matchingRace : matchingSex;
  if (pool.length === 0) return null;
  return pool[stableHash(`${subject.firstName}:${subject.familyName}:${subject.sex}`) % pool.length];
}

function ravenwoodPlayerPortraitFor(profile: MysteryDetectiveProfile, age: number): RavenwoodGuestPortraitAsset | null {
  const targetAge = ravenwoodPortraitAge(age);
  return ravenwoodPlayerPortraitAssets.find((asset) =>
    asset.lineage === profile.portraitLineage &&
    asset.sex === profile.sex &&
    asset.age === targetAge
  ) ?? null;
}

function mysteryPlayerAge(player: Pick<MysteryGame["player"], "age">): number {
  return player.age ?? 30;
}

function mysteryPlayerPortraitSubject(player: MysteryGame["player"]): PortraitSubject {
  const fallback = player.ravenwoodPortraitKey ? null : fallbackRavenwoodPlayerPortrait(player);
  return {
    ...player,
    age: mysteryPlayerAge(player),
    alive: true,
    ravenwoodPortraitKey: player.ravenwoodPortraitKey ?? fallback?.key,
    portraitLineage: player.portraitLineage ?? fallback?.lineage,
    visualRace: player.visualRace ?? fallback?.visualRace
  };
}

function mysteryDetectivePortraitSubject(profile: MysteryDetectiveProfile, age: number): PortraitSubject {
  const portrait = ravenwoodPlayerPortraitFor(profile, age);
  return {
    id: profile.id,
    firstName: profile.firstName,
    familyName: profile.familyName,
    sex: profile.sex,
    age,
    origin: profile.origin,
    hairStyle: profile.hairStyle,
    hairColor: profile.hairColor,
    faceTrait: profile.faceTrait,
    ravenwoodPortraitKey: portrait?.key,
    portraitLineage: portrait?.lineage ?? profile.portraitLineage,
    visualRace: portrait?.visualRace ?? profile.visualRace,
    alive: true
  };
}

function signedModifier(value: number): string {
  return value > 0 ? `+${value}` : String(value);
}

function bastardSuspicionFeature(player: Pick<CharacterDraft, "hairColor" | "faceTrait" | "origin">): string {
  if (["Ginger", "Dark Red", "Ash White", "Platinum Blonde", "Black"].includes(player.hairColor)) return `${player.hairColor.toLowerCase()} hair`;
  if (["Mismatched Eyes", "Glowing Eyes", "Half-Blind"].includes(player.faceTrait)) return `${player.faceTrait.toLowerCase()}`;
  return `${player.origin.toLowerCase()} origin features`;
}

function uniqueNameFor(familyName: string, usedNames: Set<string>, preferred?: string): string {
  const candidates = [preferred, ...firstNames, ...childNames, ...extraNames].filter((name): name is string => Boolean(name));
  const found = candidates.find((name) => !usedNames.has(`${name} ${familyName}`.toLowerCase()));
  if (found) {
    usedNames.add(`${found} ${familyName}`.toLowerCase());
    return found;
  }
  let suffix = 2;
  while (usedNames.has(`${preferred ?? "Aeron"} ${suffix} ${familyName}`.toLowerCase())) suffix += 1;
  const fallback = `${preferred ?? "Aeron"} ${suffix}`;
  usedNames.add(`${fallback} ${familyName}`.toLowerCase());
  return fallback;
}

function reserveExistingNames(people: Array<{ firstName: string; familyName: string }>): Set<string> {
  return new Set(people.map((person) => fullName(person).toLowerCase()));
}

function usedNamesForStory(story: Story): Set<string> {
  return reserveExistingNames([story.player, ...story.family, ...story.royalFamily, ...story.relations]);
}

function normalizeUniqueNames<T extends { firstName: string; familyName: string }>(items: T[], usedNames: Set<string>): T[] {
  return items.map((item) => {
    const key = fullName(item).toLowerCase();
    if (!usedNames.has(key)) {
      usedNames.add(key);
      return item;
    }
    return { ...item, firstName: uniqueNameFor(item.familyName, usedNames, item.firstName) };
  });
}

function normalizeNewRelationNames(relations: Relation[], usedNames: Set<string>): Relation[] {
  return relations.map((relation) => {
    if (relation.familyPersonId) return relation;
    const key = fullName(relation).toLowerCase();
    if (!usedNames.has(key)) {
      usedNames.add(key);
      return relation;
    }
    return { ...relation, firstName: uniqueNameFor(relation.familyName, usedNames, relation.firstName) };
  });
}

function successionLabel(person: Person | Relation): string | null {
  if (person.royalTitle) return person.royalTitle;
  if (!person.successionRank) return null;
  const suffix = person.successionRank === 1 ? "st" : person.successionRank === 2 ? "nd" : person.successionRank === 3 ? "rd" : "th";
  return `${person.successionRank}${suffix} in line to the Throne`;
}

function makePerson(input: Partial<Person> & { relation: string; familyName: string; age: number }): Person {
  return {
    id: input.id ?? uid(),
    firstName: input.firstName ?? pick(firstNames),
    familyName: input.familyName,
    sex: input.sex ?? pick<Sex>(["Female", "Male"]),
    age: input.age,
    birthStatus: input.birthStatus ?? "Noble",
    bloodline: input.bloodline ?? "Common Blood",
    origin: input.origin ?? pick(origins),
    hairStyle: input.hairStyle ?? pick(hairStyles),
    hairColor: input.hairColor ?? pick(hairColors),
    relation: input.relation,
    parentIds: input.parentIds ?? [],
    spouseId: input.spouseId,
    isWard: input.isWard,
    isFullSibling: input.isFullSibling,
    royalTitle: input.royalTitle,
    successionRank: input.successionRank,
    visibleBastardSigns: input.visibleBastardSigns,
    memory: input.memory ?? [],
    alive: input.alive ?? true
  };
}

function relationFromPerson(person: Person): Relation {
  return {
    id: person.id,
    firstName: person.firstName,
    familyName: person.familyName,
    sex: person.sex,
    relation: person.relation,
    age: person.age,
    birthStatus: person.birthStatus,
    bloodline: person.bloodline,
    origin: person.origin,
    hairStyle: person.hairStyle,
    hairColor: person.hairColor,
    category: "family",
    trust: person.relation === "Mother" || person.relation === "Father" ? 62 : 45,
    romance: 0,
    resentment: 0,
    spouseId: person.spouseId,
    isWard: person.isWard,
    isFullSibling: person.isFullSibling,
    royalTitle: person.royalTitle,
    successionRank: person.successionRank,
    familyPersonId: person.id,
    visibleBastardSigns: person.visibleBastardSigns,
    actionUses: {},
    actionLimit: rand(3, 5),
    memory: person.memory ?? [],
    alive: person.alive,
    note: "Known since the beginning of the chronicle."
  };
}

function buildStartingFamily(player: Story["player"]): Person[] {
  const targetCount =
    player.birthStatus === "Royal"
      ? rand(3, 10)
      : player.birthStatus === "Noble"
        ? rand(2, 9)
        : player.birthStatus === "Bastard"
          ? rand(1, 7)
          : rand(0, 6);
  const fatherStatus: BirthStatus =
    player.birthStatus === "Royal" ? "Royal" : player.birthStatus === "Bastard" ? pick<BirthStatus>(["Royal", "Noble"]) : player.birthStatus === "Noble" ? pick<BirthStatus>(["Noble", "Royal"]) : "Commoner";
  const motherStatus: BirthStatus =
    player.birthStatus === "Royal" ? pick<BirthStatus>(["Royal", "Noble"]) : player.birthStatus === "Noble" ? "Noble" : player.birthStatus === "Bastard" ? pick<BirthStatus>(["Commoner", "Commoner", "Noble", "Royal"]) : "Commoner";
  const nobleBastardMother = player.birthStatus === "Bastard" && (motherStatus === "Noble" || motherStatus === "Royal");
  const maybeDead = (person: Person, extraChance = 0): Person => {
    const ageChance = person.age >= 82 ? 0.72 : person.age >= 70 ? 0.42 : person.age >= 55 ? 0.14 : person.age >= 18 ? 0.04 : 0.02;
    if (!roll(clamp(ageChance + extraChance, 0, 0.9))) return person;
    const line = `${person.firstName} ${person.familyName} died before the chronicle began.`;
    return { ...person, alive: false, memory: [...(person.memory ?? []), line].slice(-20) };
  };
  const paternalGrandfather = makePerson({
    relation: "Grandfather",
    familyName: player.familyName,
    sex: "Male",
    age: player.age + rand(48, 68),
    birthStatus: fatherStatus,
    bloodline: pick([player.bloodline, "Common Blood"]),
    origin: player.origin
  });
  const paternalGrandmother = makePerson({
    relation: "Grandmother",
    familyName: player.familyName,
    sex: "Female",
    age: player.age + rand(46, 66),
    birthStatus: fatherStatus === "Royal" ? pick<BirthStatus>(["Royal", "Noble"]) : fatherStatus,
    bloodline: pick([player.bloodline, "Common Blood"]),
    origin: player.origin
  });
  paternalGrandfather.spouseId = paternalGrandmother.id;
  paternalGrandmother.spouseId = paternalGrandfather.id;
  const mother = makePerson({
    relation: "Mother",
    familyName: motherStatus === "Commoner" && player.birthStatus === "Bastard" ? pick(["Riverborn", "No-House", "Miller", "Dockhand"]) : player.familyName,
    sex: "Female",
    age: player.age + 24,
    birthStatus: motherStatus,
    bloodline: pick([player.bloodline, "Common Blood"]),
    origin: player.origin,
    visibleBastardSigns: nobleBastardMother,
    memory: nobleBastardMother ? ["Her rank made the child's birth a dangerous court secret."] : []
  });
  const father = makePerson({
    relation: "Father",
    familyName: player.familyName,
    sex: "Male",
    age: player.age + 27,
    birthStatus: fatherStatus,
    bloodline: pick([player.bloodline, "Common Blood", player.bloodline]),
    origin: player.origin,
    parentIds: [paternalGrandfather.id, paternalGrandmother.id],
    memory: player.birthStatus === "Bastard" ? ["His blood gives the child a dangerous claim, whether he names it or not."] : []
  });
  if (player.birthStatus !== "Bastard") {
    father.spouseId = mother.id;
    mother.spouseId = father.id;
  }
  const sibling = makePerson({
    relation: player.birthStatus === "Bastard" ? "Half Sibling" : "Sibling",
    familyName: player.familyName,
    age: clamp(player.age + pick([-3, -1, 2, 4]), 0, 80),
    birthStatus: player.birthStatus === "Bastard" ? pick<BirthStatus>(["Noble", "Bastard"]) : player.birthStatus,
    bloodline: player.bloodline,
    origin: player.origin,
    parentIds: player.birthStatus === "Bastard" ? [father.id] : [mother.id, father.id],
    isFullSibling: player.birthStatus !== "Bastard"
  });
  const auntOrUncle = makePerson({
    relation: pick(["Aunt", "Uncle"]),
    familyName: player.familyName,
    sex: roll(0.5) ? "Female" : "Male",
    age: clamp(father.age + pick([-8, -4, 4, 8]), player.age + 16, 95),
    birthStatus: fatherStatus,
    bloodline: pick([player.bloodline, "Common Blood"]),
    origin: player.origin,
    parentIds: [paternalGrandfather.id, paternalGrandmother.id]
  });
  auntOrUncle.relation = auntOrUncle.sex === "Female" ? "Aunt" : "Uncle";
  const cousin = makePerson({
    relation: "Cousin",
    familyName: player.familyName,
    age: clamp(player.age + pick([-8, -4, 0, 5, 10]), 0, 80),
    birthStatus: fatherStatus,
    bloodline: pick([player.bloodline, "Common Blood"]),
    origin: player.origin,
    parentIds: [auntOrUncle.id]
  });
  const coreFamily: Person[] = [];
  const motherChance = player.birthStatus === "Royal" ? 0.88 : player.birthStatus === "Noble" ? 0.78 : player.birthStatus === "Bastard" ? 0.62 : 0.55;
  const fatherChance = player.birthStatus === "Royal" ? 0.9 : player.birthStatus === "Noble" ? 0.78 : player.birthStatus === "Bastard" ? 0.76 : 0.48;
  const siblingChance = player.birthStatus === "Royal" ? 0.72 : player.birthStatus === "Noble" ? 0.62 : player.birthStatus === "Bastard" ? 0.38 : 0.32;
  if (targetCount > 0 && roll(motherChance)) coreFamily.push(maybeDead(mother));
  if (targetCount > coreFamily.length && roll(fatherChance)) coreFamily.push(maybeDead(father));
  if (player.birthStatus === "Bastard" && !coreFamily.some((person) => person.relation === "Father") && targetCount > coreFamily.length && roll(0.72)) {
    coreFamily.push(maybeDead(father, 0.03));
  }
  if (targetCount > coreFamily.length && roll(siblingChance)) coreFamily.push(maybeDead(sibling, 0.02));
  const optionalFamily = [paternalGrandfather, paternalGrandmother, auntOrUncle, cousin]
    .filter(() => roll(player.birthStatus === "Royal" || player.birthStatus === "Noble" ? 0.66 : 0.42))
    .map((person) => maybeDead(person, person.relation.includes("Grand") ? 0.18 : 0.03));
  if (player.birthStatus === "Bastard" && roll(0.62) && coreFamily.length < targetCount) {
    const marriedParent = pick([father, mother]);
    const spouse = makePerson({
      relation: marriedParent.relation === "Father" ? "Father's Spouse" : "Mother's Spouse",
      familyName: marriedParent.familyName,
      sex: marriedParent.sex === "Male" ? "Female" : "Male",
      age: clamp(marriedParent.age + rand(-10, 8), player.age + 14, 92),
      birthStatus: marriedParent.birthStatus,
      bloodline: pick([marriedParent.bloodline, "Common Blood"]),
      origin: marriedParent.origin
    });
    spouse.spouseId = marriedParent.id;
    const knownParentIndex = coreFamily.findIndex((person) => person.id === marriedParent.id);
    if (knownParentIndex >= 0) {
      coreFamily[knownParentIndex] = { ...coreFamily[knownParentIndex], spouseId: spouse.id };
      optionalFamily.push(maybeDead(spouse, 0.02));
    }
  }
  return [...coreFamily, ...optionalFamily].sort(() => Math.random() - 0.5).slice(0, targetCount);
}

function buildRoyalFamily(player: Story["player"], family: Person[], usedNames: Set<string>): { family: Person[]; royalFamily: Person[] } {
  if (player.birthStatus === "Royal") {
    const hasFather = family.some((person) => person.relation === "Father");
    const hasMother = family.some((person) => person.relation === "Mother");
    const createdParents: Person[] = [];
    if (!hasFather) {
      createdParents.push(makePerson({
        firstName: uniqueNameFor(player.familyName, usedNames, pick(firstNames)),
        familyName: player.familyName,
        relation: "Father",
        sex: "Male",
        age: player.age + rand(24, 42),
        birthStatus: "Royal",
        bloodline: pick([player.bloodline, "Common Blood"]),
        origin: player.origin,
        royalTitle: "Ruling King"
      }));
    }
    if (!hasMother) {
      createdParents.push(makePerson({
        firstName: uniqueNameFor(player.familyName, usedNames, pick(firstNames)),
        familyName: player.familyName,
        relation: "Mother",
        sex: "Female",
        age: player.age + rand(22, 40),
        birthStatus: "Royal",
        bloodline: pick([player.bloodline, "Common Blood"]),
        origin: player.origin,
        royalTitle: "Ruling Queen"
      }));
    }
    const withParents = [...family, ...createdParents];
    const updatedFamily = withParents.map((person) => {
      if (person.relation === "Father") return { ...person, birthStatus: "Royal" as BirthStatus, royalTitle: "Ruling King" as const };
      if (person.relation === "Mother") return { ...person, birthStatus: "Royal" as BirthStatus, royalTitle: "Ruling Queen" as const };
      if (person.relation === "Sibling") return { ...person, birthStatus: "Royal" as BirthStatus, successionRank: 2 };
      return person.birthStatus === "Commoner" ? person : { ...person, birthStatus: person.birthStatus === "Bastard" ? person.birthStatus : "Royal" as BirthStatus };
    });
    const playerAsRoyal = makePerson({
      id: player.id,
      firstName: player.firstName,
      familyName: player.familyName,
      sex: player.sex,
      relation: "You",
      age: player.age,
      birthStatus: "Royal",
      bloodline: player.bloodline,
      origin: player.origin,
      parentIds: updatedFamily.filter((person) => person.relation === "Mother" || person.relation === "Father").map((person) => person.id),
      successionRank: 1
    });
    return { family: updatedFamily, royalFamily: [playerAsRoyal, ...updatedFamily.filter((person) => person.birthStatus === "Royal")] };
  }

  const knownRoyal = family.find((person) => person.birthStatus === "Royal");
  if (knownRoyal) {
    const royalHouse = knownRoyal.familyName;
    const familyRoyals = family.filter((person) => person.birthStatus === "Royal").map((person, index) => ({
      ...person,
      familyName: royalHouse,
      successionRank: person.successionRank ?? (person.royalTitle ? undefined : index + 1)
    }));
    const hasKing = familyRoyals.some((person) => person.royalTitle === "Ruling King");
    const hasQueen = familyRoyals.some((person) => person.royalTitle === "Ruling Queen");
    const king = hasKing ? null : makePerson({
      firstName: uniqueNameFor(royalHouse, usedNames, pick(firstNames)),
      familyName: royalHouse,
      relation: "King",
      sex: "Male",
      age: rand(36, 74),
      birthStatus: "Royal",
      bloodline: pick([knownRoyal.bloodline, "Common Blood", "Witch Blood"]),
      origin: knownRoyal.origin,
      royalTitle: "Ruling King"
    });
    const queen = hasQueen ? null : makePerson({
      firstName: uniqueNameFor(royalHouse, usedNames, pick(firstNames)),
      familyName: royalHouse,
      relation: "Queen",
      sex: "Female",
      age: rand(28, 72),
      birthStatus: "Royal",
      bloodline: pick([knownRoyal.bloodline, "Common Blood", "Child of Atlantis"]),
      origin: knownRoyal.origin,
      royalTitle: "Ruling Queen",
      spouseId: king?.id
    });
    if (king && queen) king.spouseId = queen.id;
    return { family, royalFamily: [king, queen, ...familyRoyals].filter((person): person is Person => Boolean(person)) };
  }

  const royalHouse = "Crownfall";
  const king = makePerson({
    firstName: uniqueNameFor(royalHouse, usedNames, pick(firstNames)),
    familyName: royalHouse,
    relation: "King",
    sex: "Male",
    age: rand(36, 74),
    birthStatus: "Royal",
    bloodline: pick(["Child of Atlantis", "Witch Blood", "Common Blood"]),
    origin: pick(origins),
    royalTitle: "Ruling King"
  });
  const queen = makePerson({
    firstName: uniqueNameFor(royalHouse, usedNames, pick(firstNames)),
    familyName: royalHouse,
    relation: "Queen",
    sex: "Female",
    age: clamp(king.age + rand(-14, 8), 24, 82),
    birthStatus: "Royal",
    bloodline: pick(["Child of Atlantis", "Witch Blood", "Common Blood"]),
    origin: king.origin,
    royalTitle: "Ruling Queen",
    spouseId: king.id
  });
  king.spouseId = queen.id;
  const heir = makePerson({
    firstName: uniqueNameFor(royalHouse, usedNames, pick(firstNames)),
    familyName: royalHouse,
    relation: "Heir",
    age: rand(14, 36),
    birthStatus: "Royal",
    bloodline: pick([king.bloodline, queen.bloodline]),
    origin: king.origin,
    parentIds: [king.id, queen.id],
    successionRank: 1
  });
  const spare = makePerson({
    firstName: uniqueNameFor(royalHouse, usedNames, pick(firstNames)),
    familyName: royalHouse,
    relation: "Royal Spare",
    age: clamp(heir.age + rand(-8, 8), 0, 40),
    birthStatus: "Royal",
    bloodline: pick([king.bloodline, queen.bloodline]),
    origin: king.origin,
    parentIds: [king.id, queen.id],
    successionRank: 2
  });
  return { family, royalFamily: [king, queen, heir, spare] };
}

function createKnownRelation(input: Partial<Relation> & { relation: string; age: number; birthStatus: BirthStatus }): Relation {
  return {
    id: input.id ?? uid(),
    firstName: input.firstName ?? pick(firstNames),
    familyName: input.familyName ?? pick(familyNames),
    sex: input.sex ?? pick<Sex>(["Female", "Male"]),
    relation: input.relation,
    age: input.age,
    birthStatus: input.birthStatus,
    bloodline: input.bloodline ?? pick(["Common Blood", "Common Blood", "Common Blood", "Wolf Cub", "Witch Blood", "Child of Atlantis"]),
    origin: input.origin ?? pick(origins),
    hairStyle: input.hairStyle ?? pick(hairStyles),
    hairColor: input.hairColor ?? pick(hairColors),
    category: input.category,
    trust: input.trust ?? rand(25, 58),
    romance: input.romance ?? 0,
    resentment: input.resentment ?? 0,
    alive: input.alive ?? true,
    spouseId: input.spouseId,
    isWard: input.isWard,
    isFullSibling: input.isFullSibling,
    royalTitle: input.royalTitle,
    successionRank: input.successionRank,
    allianceFormed: input.allianceFormed,
    legitimacyConvinced: input.legitimacyConvinced,
    familyPersonId: input.familyPersonId,
    visibleBastardSigns: input.visibleBastardSigns,
    actionUses: input.actionUses ?? {},
    actionLimit: input.actionLimit ?? rand(3, 5),
    memory: input.memory ?? [],
    note: input.note ?? "Known since the beginning of the chronicle."
  };
}

function buildStartingRelations(player: Story["player"], family: Person[]): Relation[] {
  const familyRelations = family.map(relationFromPerson);
  if (player.birthStatus === "Royal" || player.birthStatus === "Noble") {
    const castleCount = rand(15, 25);
    const servantCount = rand(10, 20);
    const court = Array.from({ length: castleCount }, () =>
      createKnownRelation({
        relation: pick(courtRelations),
        age: clamp(player.age + rand(-12, 34), 0, 85),
        birthStatus: pick<BirthStatus>(player.birthStatus === "Royal" ? ["Royal", "Noble", "Noble", "Bastard"] : ["Noble", "Noble", "Royal", "Bastard"]),
        familyName: pick(familyNames),
        category: "palace",
        trust: rand(32, 64),
        note: "Part of the castle's visible life: a name, a face, and a possible knife."
      })
    );
    const servants = Array.from({ length: servantCount }, () =>
      createKnownRelation({
        relation: pick(servantRelations),
        age: rand(10, 70),
        birthStatus: pick<BirthStatus>(["Commoner", "Commoner", "Commoner", "Commoner", "Bastard", "Noble"]),
        bloodline: pick(["Common Blood", "Common Blood", "Common Blood", "Common Blood", "Wolf Cub", "Witch Blood", "Child of Atlantis"]),
        familyName: pick(["No-House", "Riverborn", "Dockhand", "Miller", "Greywash"]),
        category: "palace",
        trust: rand(20, 48),
        note: "A servant of the palace, easy to overlook and dangerous to underestimate."
      })
    );
    return [...familyRelations, ...court, ...servants];
  }

  const known = [...familyRelations].sort(() => Math.random() - 0.5).slice(0, rand(2, 5));
  while (known.length < 2) {
    known.push(
      createKnownRelation({
        relation: pick(["neighbor", "old friend", "work mate", "street contact"]),
        age: clamp(player.age + rand(-10, 18), 0, 75),
        birthStatus: pick<BirthStatus>(["Commoner", "Commoner", "Bastard"]),
        category: "city"
      })
    );
  }
  return known;
}

function initialGold(status: BirthStatus): number {
  if (status === "Royal") return rand(1000, 2500);
  if (status === "Noble") return rand(350, 1200);
  if (status === "Bastard") return rand(50, 350);
  return rand(20, 150);
}

function initialPossessions(status: BirthStatus): string[] {
  const targetCount = rand(3, Math.min(7, possessionsByStatus[status].length));
  return [...possessionsByStatus[status]].sort(() => Math.random() - 0.5).slice(0, targetCount);
}

const dndGoldItemValues: Record<string, number> = {
  "signet ring": 5,
  "state cloak": 75,
  "jeweled dagger": 52,
  "private chambers key": 1,
  "court slippers": 2,
  "silver comb": 5,
  "sealed writ": 10,
  "house ring": 5,
  "riding cloak": 1,
  "court invitation": 1,
  "fine boots": 2,
  "embroidered gloves": 2,
  "small dagger": 2,
  "ledger of favors": 10,
  "worn family token": 1,
  "travel cloak": 1,
  "hidden letter": 1,
  "serviceable dagger": 2,
  "patched boots": 1,
  "plain purse": 1,
  "old blanket": 1,
  "market purse": 1,
  "needle kit": 1,
  "sturdy boots": 2,
  "blanket roll": 1,
  "work knife": 2,
  "bread tin": 1,
  "wooden charm": 1
};

function possessionWorth(item: string, _status: BirthStatus): number {
  return dndGoldItemValues[item] ?? 1;
}

function possessionValueMap(items: string[], status: BirthStatus): Record<string, number> {
  return Object.fromEntries(items.map((item) => [item, possessionWorth(item, status)]));
}

const daytimes: Daytime[] = ["Morning", "Breakfast", "Midday", "Lunch", "Afternoon", "Evening", "Night", "Midnight"];
const mysteryMethods = [
  "Blunt-force trauma",
  "Stabbing with a knife or sharp tool",
  "Manual strangulation",
  "Ligature strangulation",
  "Suffocation with bedding or fabric",
  "Drowning in a bath",
  "Drowning in a pool or ornamental pond",
  "Poison added to a drink",
  "Poison added to food",
  "Deliberate medication overdose",
  "Lethal substance delivered by injection",
  "Known allergen deliberately introduced",
  "Carbon monoxide exposure",
  "Deliberate gas leak",
  "Electrocution through tampered equipment",
  "Pushed down a staircase",
  "Pushed or thrown from a balcony",
  "Pushed from a window",
  "Vehicle brakes deliberately tampered with",
  "Killed in a deliberately set fire",
  "Trapped in smoke from a controlled fire",
  "Fatal head injury staged as an accidental fall",
  "Victim drugged, then smothered",
  "Electrical appliance placed into bathwater",
  "Fatal assault followed by concealment of the body"
];
const mysteryLockdownReasons = ["a snow storm has buried the road", "a landslide has blocked the lower pass", "a heat wave has shut the rail line", "a rain storm has washed out the bridge", "a hurricane warning has closed the coast road", "nearby fighting has made travel impossible", "a police cordon has sealed the valley"];
const mysteryWitnessClues = [
  "Witness: {witness} heard {victim} threaten {killer} shortly before the murder, but will only speak after trust is gained.",
  "Witness: {witness} saw {killer} near the crime scene at an unusual hour and is frightened to say it openly.",
  "Witness: {witness} noticed {killer} changing clothes after the murder window and needs careful questioning.",
  "Witness: {witness} overheard {killer} and {victim} arguing about the motive before the death.",
  "Witness: {witness} saw {killer} leave by a service route that does not match their public alibi."
];
const mysteryMotiveTemplates = [
  "To prevent {victim} from exposing {killer}'s affair with {linked_character}.",
  "To stop {victim} revealing that {killer} was secretly dating {linked_character}.",
  "To keep {victim} from exposing {killer}'s hidden engagement.",
  "To stop {victim} revealing that {killer} had lied about being widowed.",
  "To prevent {victim} from telling {partner} about {killer}'s second relationship.",
  "To stop {victim} revealing that {killer} had stolen money from work.",
  "To prevent {victim} from exposing {killer}'s gambling debts.",
  "To keep {victim} from proving that {killer} had forged a document.",
  "To stop {victim} from revealing a blackmail scheme.",
  "To silence {victim} after a private argument about inheritance."
];
const mysteryMinorMotiveTemplates = [
  "To stop {victim} revealing that {killer} had been in a forbidden room.",
  "To keep {victim} from telling the adults about a stolen key.",
  "To silence {victim} after being seen hiding evidence.",
  "To stop {victim} revealing a dangerous family secret.",
  "To prevent {victim} from exposing a lie about where {killer} had been.",
  "To keep {victim} from telling everyone about a broken object that mattered.",
  "To stop {victim} revealing that {killer} had overheard the real plan.",
  "To prevent {victim} from blaming {killer}'s family for the trouble."
];
const mysteryFamilyStatuses = ["Divorced", "Married", "Widowed", "Single", "In a relationship", "Engaged", "Secretly dating", "Secretly engaged", "In an open relationship", "On a break from a relationship", "Unsure", "Open to explore"];
const mysteryEducations = ["No formal education", "Some elementary school", "Completed elementary school", "Some secondary school", "Secondary school diploma", "Home-schooled through secondary level", "General education diploma", "Basic literacy training", "Workplace skills training", "Customer service training", "Office administration training", "First aid training", "Food hygiene training", "Security guard training", "Basic bookkeeping training", "Legal secretary training", "Medical secretary training", "Receptionist training", "Executive assistant training", "Travel agent training", "Tour guide training", "Drama school training", "Police academy training", "Primary teacher training"];
const mysteryInterests = ["Loves football", "Loves watching football", "Loves basketball", "Loves tennis", "Loves running", "Loves swimming", "Loves hiking", "Loves cooking", "Loves baking", "Loves gardening", "Loves reading mysteries", "Loves old films", "Loves opera", "Loves cards", "Loves antiques", "Loves photography", "Loves local history", "Loves cocktail recipes", "Loves chess", "Loves scandal columns"];
const mysterySecrets = [
  "Is deeply in debt.",
  "Has unpaid gambling debts and has told no one.",
  "Has been borrowing money from friends and lying about why.",
  "Is hiding a recent bankruptcy.",
  "Has been stealing small amounts of money from work.",
  "Has already lied about where they were before arriving.",
  "Believes another guest knows their secret.",
  "Destroyed a letter shortly before dinner.",
  "Has been bribing a servant.",
  "Is terrified a private relationship will be discovered.",
  "Is hiding a forged document.",
  "Has a criminal charge from years ago under another name."
];
const mysteryChildSecrets = [
  "Broke a valuable object in the manor and hid the pieces.",
  "Stole sweets from the kitchen and lied about it.",
  "Sneaked into a locked hallway and saw someone arguing.",
  "Found a dropped key and has not told an adult.",
  "Read part of a private letter without understanding all of it.",
  "Is scared of one adult guest but will not say why.",
  "Saw someone leaving a room late at night.",
  "Hid under a table during an argument and heard a name.",
  "Took a small trinket from another guest's room.",
  "Invented a false story to avoid being punished."
];
const mysteryTeenSecrets = [
  "Lied about where they were after dinner.",
  "Sneaked into a service corridor and saw something they should not have seen.",
  "Has been reading a private letter belonging to a family member.",
  "Took a small amount of money and plans to put it back.",
  "Knows two adults argued in private but is afraid to say so.",
  "Is hiding a broken object from their guardian.",
  "Promised not to reveal a family argument.",
  "Found a suspicious item and hid it out of fear.",
  "Has been secretly listening at doors.",
  "Saw someone change clothes after a late-night incident."
];
const mysteryQuirks = [
  "Can hold their breath for two minutes.",
  "Has almost no sense of taste.",
  "Has a very weak sense of smell.",
  "Has an unusually strong sense of smell.",
  "Has a severe almond allergy.",
  "Always orders the same cocktail.",
  "Cannot sleep without an open window.",
  "Keeps a strict breakfast ritual.",
  "Collects matchbooks.",
  "Has a fear of water.",
  "Is sensitive to smoke.",
  "Has a weak heart.",
  "Hides a medicine habit.",
  "Notices small changes in room arrangements."
];
const mysteryChildQuirks = [
  "Has a severe almond allergy.",
  "Cannot sleep without an open window.",
  "Keeps a strict breakfast ritual.",
  "Collects matchbooks.",
  "Has a fear of water.",
  "Is sensitive to smoke.",
  "Notices small changes in room arrangements.",
  "Has an unusually strong sense of smell.",
  "Has a very weak sense of smell."
];
const mysteryChildInterests = ["Loves football", "Loves basketball", "Loves tennis", "Loves running", "Loves swimming", "Loves hiking", "Loves baking", "Loves gardening", "Loves reading mysteries", "Loves old films", "Loves cards", "Loves local history", "Loves chess"];
const mysteryReasonsOfStay = ["Attending a family reunion", "Attending a wedding", "Attending an engagement party", "Attending a memorial service", "Celebrating an anniversary", "Taking a weekend break", "Taking a romantic getaway", "Meeting a business partner", "Attending a work conference", "Visiting a relative", "Visiting an old friend", "Meeting a secret romantic partner", "Recovering after an illness", "Escaping unwanted media attention", "Following an anonymous invitation", "Searching for a missing person", "Tracing their family history", "Researching a local story", "Reviewing the hotel", "Meeting a lawyer about an inheritance"];
const mysteryGuestOccupations = ["Retired", "Student", "Stay-at-home parent", "Accountant", "Actor", "Antique dealer", "Architect", "Archivist", "Art appraiser", "Art dealer", "Auctioneer", "Author", "Bank manager", "Barrister", "Bookbinder", "Boutique owner", "Cellist", "Doctor", "Journalist", "Poet", "Stage actress", "Tour guide"];
const mysteryStaffOccupations = ["Butler", "Cleaner", "Cook", "Gardener", "Head waiter", "Housekeeper", "Kitchen porter", "Laundry worker", "Night porter", "Nurse", "Security guard", "Waiter", "Chauffeur", "Estate cleaner"];
const mysteryGuestCareerProfiles: { minAge: number; occupation: string; educations: string[] }[] = [
  { minAge: 18, occupation: "Student", educations: ["Some secondary school", "Secondary school diploma", "Home-schooled through secondary level", "Drama school training"] },
  { minAge: 18, occupation: "Young heir", educations: ["Home-schooled through secondary level", "Secondary school diploma", "General education diploma"] },
  { minAge: 18, occupation: "Companion in training", educations: ["Home-schooled through secondary level", "Customer service training", "Office administration training"] },
  { minAge: 18, occupation: "Junior clerk", educations: ["Secondary school diploma", "Office administration training", "Basic bookkeeping training"] },
  { minAge: 18, occupation: "Shop assistant", educations: ["Secondary school diploma", "Customer service training", "Receptionist training"] },
  { minAge: 18, occupation: "Receptionist", educations: ["Receptionist training", "Office administration training", "Customer service training"] },
  { minAge: 18, occupation: "Stage student", educations: ["Drama school training", "Secondary school diploma"] },
  { minAge: 18, occupation: "Tour assistant", educations: ["Tour guide training", "Customer service training", "Secondary school diploma"] },
  { minAge: 21, occupation: "Bookbinder", educations: ["Workplace skills training", "Secondary school diploma"] },
  { minAge: 21, occupation: "Poet", educations: ["Secondary school diploma", "General education diploma", "Drama school training"] },
  { minAge: 21, occupation: "Actor", educations: ["Drama school training", "Secondary school diploma"] },
  { minAge: 22, occupation: "Journalist", educations: ["Secondary school diploma", "Office administration training", "General education diploma"] },
  { minAge: 22, occupation: "Tour guide", educations: ["Tour guide training", "Customer service training", "General education diploma"] },
  { minAge: 23, occupation: "Accountant", educations: ["Basic bookkeeping training", "Office administration training", "General education diploma"] },
  { minAge: 24, occupation: "Author", educations: ["General education diploma", "Secondary school diploma", "Home-schooled through secondary level"] },
  { minAge: 24, occupation: "Cellist", educations: ["Drama school training", "General education diploma", "Home-schooled through secondary level"] },
  { minAge: 25, occupation: "Archivist", educations: ["Office administration training", "General education diploma", "Legal secretary training"] },
  { minAge: 25, occupation: "Boutique owner", educations: ["Customer service training", "Basic bookkeeping training", "Office administration training"] },
  { minAge: 26, occupation: "Barrister", educations: ["Law degree", "Legal training", "General education diploma"] },
  { minAge: 26, occupation: "Stage actress", educations: ["Drama school training", "General education diploma"] },
  { minAge: 27, occupation: "Architect", educations: ["Architecture degree", "Technical college", "General education diploma"] },
  { minAge: 28, occupation: "Doctor", educations: ["Medical school", "Medical degree", "First aid training"] },
  { minAge: 28, occupation: "Antique dealer", educations: ["Basic bookkeeping training", "Customer service training", "General education diploma"] },
  { minAge: 28, occupation: "Art dealer", educations: ["Customer service training", "Basic bookkeeping training", "General education diploma"] },
  { minAge: 30, occupation: "Art appraiser", educations: ["General education diploma", "Office administration training"] },
  { minAge: 30, occupation: "Auctioneer", educations: ["Customer service training", "Basic bookkeeping training", "General education diploma"] },
  { minAge: 32, occupation: "Stay-at-home parent", educations: ["Secondary school diploma", "General education diploma", "Home-schooled through secondary level"] },
  { minAge: 35, occupation: "Bank manager", educations: ["Basic bookkeeping training", "Office administration training", "General education diploma"] },
  { minAge: 55, occupation: "Retired", educations: ["Secondary school diploma", "General education diploma", "Workplace skills training", "Office administration training"] }
];
const staffStations = ["kitchen", "staff-corridor", "servants-hall", "laundry", "pantry", "garden-terrace", "back-stairs"];
const ravenwoodMaleNames = ["Theodore", "Asher", "Cedric", "Soraaro", "Adrian", "Alaric", "Ambrose", "Arthur", "Bastian", "Benedict", "Blaise", "Caspian", "Dorian", "Edgar", "Edmund", "Elias", "Felix", "Florian", "Gabriel", "Gideon", "Hugo", "Jasper", "Julian", "Laurent", "Leander", "Leon", "Lucian", "Magnus", "Marcel", "Marius", "Oliver", "Percival", "Raphael", "Remy", "Rowan", "Sebastian", "Silas", "Soren", "Tristan", "Victor", "Vincent", "Xavier", "Elio", "Mael", "Noel", "Rafael", "Thierry", "Alejandro", "Alonso", "Cruz", "Diego", "Esteban", "Javier", "Leandro", "Lorenzo", "Mateo", "Santiago", "Dimitri", "Ilya", "Nikolai", "Stefan", "Akira", "Daichi", "Haru", "Hiro", "Itsuki", "Kaoru", "Kenji", "Ren", "Riku", "Sora", "Taejin", "Jun", "Minho", "Seojun", "Yichen", "Jian", "Lian", "Ming", "Renji", "Toma", "Alden", "Arden", "August", "Claude", "Corvin", "Elian", "Emil", "Evander", "Hadrian", "Hector", "Isidore", "Matthias", "Nicolas", "Octavian", "Orion", "Roman", "Sylvain", "Valentin", "Aurel", "Cassiel", "Lucien", "Nicolás", "Aleksi", "Emilian", "Kasimir", "Lev", "Mikhail", "Emiliaric", "Laurenvin", "Sorenan", "Jasperric", "Hiroien", "Soraair", "Ilyaas", "Alaricien", "Rafaelien", "Yichenvren", "Kenjiar", "Junen", "Valesian", "Asheran", "Emilia", "Javierian", "Matthiasas", "Alaricrel", "Felixric", "Thierren", "Itsukiric", "Oliveris", "Silasis", "Mariusor", "Aurelar", "Rikuric", "Mikhaiiel", "Gabrievar", "Sylvairiel", "Isideo", "Sebastiaian", "Marcelvon"];
const ravenwoodFemaleNames = ["Adeline", "Aurelia", "Beatrice", "Belladonna", "Briar", "Camille", "Cassandra", "Celeste", "Celine", "Clara", "Cordelia", "Dahlia", "Delphine", "Eleanor", "Elise", "Elodie", "Emmeline", "Estelle", "Evangeline", "Flora", "Genevieve", "Giselle", "Helena", "Isadora", "Ivy", "Josephine", "Juliette", "Lenore", "Lilian", "Lorelei", "Lucille", "Madeleine", "Margot", "Marielle", "Mireille", "Nadine", "Noelle", "Odette", "Ophelia", "Rosalie", "Sabine", "Selene", "Seraphine", "Sylvie", "Theodora", "Valentina", "Vesper", "Victoria", "Vivienne", "Willow", "Amara", "Anaïs", "Aveline", "Cressida", "Elara", "Fleur", "Isabeau", "Lavinia", "Melisande", "Ondine", "Alba", "Amalia", "Catalina", "Elena", "Esmeralda", "Inés", "Isabella", "Lucia", "Marisol", "Paloma", "Anastasia", "Danica", "Irina", "Katya", "Milena", "Nadia", "Oksana", "Svetlana", "Tatiana", "Zoya", "Aiko", "Akari", "Emi", "Hana", "Haruka", "Kaede", "Mei", "Miyu", "Reina", "Yuna", "Chaewon", "Haeun", "Jisoo", "Nari", "Sora", "Xia", "Yue", "Lian", "Meilin", "Rin", "Inésyne", "Jisooa", "Sabineina", "Josephinora", "Reinaalia", "Isada", "Willowyne", "Irinaia", "Valentinis", "Isadorira", "Katyais", "Seraphi", "Aikois", "Marieuna", "Seleneuna", "Palomarea", "Elenaenne", "Helenaa", "Inéselle", "Naria", "Chaewira", "Xiaea", "Sabineora", "Evangelineora", "Meiis", "Rinea", "Hanaette", "Kaedeenne", "Harukaina", "Danicaia", "Emiora", "Giselleline", "Briaris", "Akariyne", "Anaïsina", "Emieria", "Irinavenne", "Loreleiia", "Reinaina", "Aikoira"];
const ravenwoodSurnames = ["Ash", "Black", "Briar", "Crow", "Dusk", "Elder", "Ember", "Ever", "Fair", "Fallow", "Fern", "Frost", "Glen", "Grey", "Hallow", "Hawke", "Hazel", "Hollow", "Iron", "Ivory", "Lark", "Marlowe", "Mist", "Moon", "Night", "Oak", "Raven", "Rose", "Rowan", "Sable", "Shadow", "Silver", "Snow", "Star", "Stone", "Storm", "Thorn", "Vale", "Vane", "Winter", "Wren", "Wilde", "Wood", "Bell", "Blake", "Byron", "Carrow", "Dacre", "Darcy", "Devereux", "Fairfax", "Graves", "Hale", "Harrow", "Hart", "Huxley", "Locke", "March", "Morrow", "Poe", "Quill", "Reeve", "Sinclair", "Sterling", "Thorne", "Voss", "Whitlock", "Wycliffe", "Arden", "Beaumont", "Bellefleur", "Clairmont", "Delacroix", "Desmarais", "Duval", "Fontaine", "Laurent", "Lenoir", "Moreau", "Rochefort", "Valmont", "Villiers", "Alarcón", "Delgado", "Montoya", "Navarro", "Salazar", "Serrano", "Valdés", "Vega", "Volkov", "Morozov", "Orlov", "Petrov", "Romanov", "Sokolov", "Vasiliev", "Dragomir", "Takeda", "Kuroda", "Mori", "Akiyama", "Hayashi", "Ishikawa", "Han", "Seo", "Kang", "Jin", "Lin", "Shen", "Wei", "Zhao", "Crowbyron", "La Zhaofield", "Von Crowhurst", "La Salazarvane", "La Duvalclair", "Della Mistmere", "La Thornewick", "St. Lockebridge", "Del Fernember", "Du Thornridge", "Bellbridge", "St. Zhaowood", "Von Irondell", "St. Fallowclair", "Delgadoquill", "Villiersstone", "Du Wycliffehart", "Le Wood", "Von Seostorm", "Hayashihayashi", "Du Seomont", "Blakefield", "Le Fontainemoor", "De Fernwell", "Larkmist", "Le Halerose", "De Jinsokolov", "Le Snowfield", "Shadowwinter", "Van Fairfaxthorne", "Moreaualarcón", "La Stonestar", "Della Morozovstone", "Von Vasilievwood", "Ravenwinter", "Van Elderhurst", "Vasilievshade", "Du Ravenshade", "Du Darcy", "Evercliff", "Von Duvalmont", "Le Jinhurst", "Del Starsterling", "De Hallow", "De Thornerose", "La Ravenarden", "De Ardenbrook", "Della Fallowwood", "La Fallowclair", "La Fontainecourt", "La Beaumontbridge", "Silverwinter", "Glenhart", "St. Hazelzhao", "De Huxleyrose", "St. Clairmontromanov", "Devereuxhurst", "Roseshade", "Del Vasilievgrave", "Van Romanovwick", "Du Fairthorne"];

function fillMysteryTemplate(template: string, killer: MysteryNpc, victim: MysteryNpc, npcs: MysteryNpc[], witness?: MysteryNpc): string {
  const linkedPool = npcs.filter((npc) => npc.id !== killer.id && npc.id !== victim.id);
  const partnerPool = npcs.filter((npc) => npc.id !== killer.id);
  const suspectPool = npcs.filter((npc) => npc.id !== victim.id);
  const linked = pick(linkedPool.length > 0 ? linkedPool : [killer]);
  const partner = pick(partnerPool.length > 0 ? partnerPool : [victim]);
  const suspect = pick(suspectPool.length > 0 ? suspectPool : [killer]);
  const witnessNpc = witness ?? linked;
  return template
    .replaceAll("{killer}", fullName(killer))
    .replaceAll("{victim}", fullName(victim))
    .replaceAll("{linked_character}", fullName(linked))
    .replaceAll("{partner}", fullName(partner))
    .replaceAll("{suspect}", fullName(suspect))
    .replaceAll("{witness}", fullName(witnessNpc));
}

function mysteryMethodKind(method: string): string {
  const lower = method.toLowerCase();
  if (lower.includes("drink")) return "drink";
  if (lower.includes("food")) return "food";
  if (lower.includes("allergen")) return "allergen";
  if (lower.includes("overdose") || lower.includes("medication") || lower.includes("injection") || lower.includes("drugged")) return "drug";
  if (lower.includes("strangulation") || lower.includes("ligature")) return "strangulation";
  if (lower.includes("suffocation") || lower.includes("smothered")) return "smother";
  if (lower.includes("stabbing") || lower.includes("knife") || lower.includes("sharp")) return "blade";
  if (lower.includes("fire") || lower.includes("smoke")) return "fire";
  if (lower.includes("carbon monoxide") || lower.includes("gas")) return "gas";
  if (lower.includes("drowning") || lower.includes("bath") || lower.includes("pond")) return "water";
  if (lower.includes("electrocution") || lower.includes("electrical")) return "electric";
  if (lower.includes("staircase") || lower.includes("balcony") || lower.includes("window") || lower.includes("fall")) return "fall";
  if (lower.includes("vehicle") || lower.includes("brakes")) return "vehicle";
  if (lower.includes("concealment")) return "concealment";
  return "blunt";
}

function mysteryMethodClues(method: string): string[] {
  const kind = mysteryMethodKind(method);
  if (kind === "drink") return [
    "A wine glass near {victim}'s seat carries bitter residue and {killer}'s partial fingerprint.",
    "The decanter used by {victim} was rinsed poorly, leaving a chemical trace in the neck.",
    "A bar receipt shows {killer} ordered the same rare bottle later found beside {victim}."
  ];
  if (kind === "food") return [
    "A serving plate from {victim}'s setting contains a residue that was not found on the other plates.",
    "A kitchen order slip shows {killer} requested a private dish for {victim}.",
    "A discarded paper packet with poison residue was hidden behind the pantry flour tins."
  ];
  if (kind === "allergen") return [
    "The dessert served to {victim} contains an allergen that was not listed on the kitchen card.",
    "A torn menu note about {victim}'s allergy was found in {killer}'s wastebasket.",
    "The pantry jar holding the allergen has fresh fingerprints on its lid."
  ];
  if (kind === "drug") return [
    "A pill bottle with missing tablets was hidden in {killer}'s sock drawer.",
    "Powder residue was found in a folded paper inside {killer}'s coat pocket.",
    "The medicine cabinet log was altered beside the line for the dose used on {victim}."
  ];
  if (kind === "strangulation" || kind === "smother") return [
    "Fibers matching {killer}'s scarf were found near {victim}'s throat and collar.",
    "A torn strip of bedding hidden in a laundry basket matches marks on {victim}.",
    "A button from {killer}'s sleeve was found under {victim}'s shoulder."
  ];
  if (kind === "blade") return [
    "A sharp tool from the house inventory is missing and its slot was wiped clean.",
    "A knife-cleaning rag with diluted blood was found behind a loose drawer.",
    "A cut on {killer}'s hand matches the grip pattern of the missing blade."
  ];
  if (kind === "fire") return [
    "Burn residue was found where no lamp should have been used.",
    "A matchbook from {killer}'s room was found near the first point of ignition.",
    "The oil can in the service cupboard has fingerprints and a fresh smear of soot."
  ];
  if (kind === "gas") return [
    "Tool marks on the gas valve match a wrench kept in {killer}'s belongings.",
    "A corridor vent was deliberately blocked to push fumes toward {victim}.",
    "The service log for the gas line was changed after {victim}'s death."
  ];
  if (kind === "water") return [
    "Wet footprints lead away from the bath or water edge toward a service passage.",
    "A towel from {killer}'s room was found damp and hidden under folded linen.",
    "Scratches on the tub or pond stones show {victim} struggled before drowning."
  ];
  if (kind === "electric") return [
    "The damaged wire has a clean cut and a fresh repair wrap from the maintenance cupboard.",
    "A screwdriver with copper residue was found where {killer} had access.",
    "The fuse box was opened with a key that should not have left staff control."
  ];
  if (kind === "fall") return [
    "Scuff marks and a torn sleeve thread were found on the window frame or railing near the drop.",
    "A muddy footprint on the sill matches shoes kept in {killer}'s room.",
    "The latch was scratched from the inside, showing the fall was forced rather than accidental.",
    "A broken fingernail was caught in the balcony rail near where {victim} fell."
  ];
  if (kind === "vehicle") return [
    "The brake line shows a deliberate cut made with a narrow service blade.",
    "Grease on {killer}'s cuff matches the tampered vehicle mechanism.",
    "A garage key was returned late with fresh oil on its teeth."
  ];
  if (kind === "concealment") return [
    "Drag marks lead from the crime scene toward the place where the body was hidden.",
    "A sheet with traces of blood and floor dust was stuffed behind stored furniture.",
    "Mud on {killer}'s shoes matches the concealed body's hiding place."
  ];
  return [
    "A heavy object from the room is missing and dust marks show where it stood.",
    "A blood trace was wiped from the edge of a mantel or table near the attack.",
    "A bruise pattern on {victim} matches an object kept in {killer}'s belongings."
  ];
}

function mysteryMotiveClues(motive: string): string[] {
  const lower = motive.toLowerCase();
  if (lower.includes("inheritance") || lower.includes("will")) return [
    "A disputed will naming {victim} was hidden among {killer}'s papers.",
    "A letter from a solicitor shows {victim} could have changed the inheritance outcome.",
    "A torn inheritance note in {killer}'s drawer matches the argument {witness} overheard."
  ];
  if (lower.includes("debt") || lower.includes("gambling") || lower.includes("money")) return [
    "A debt ledger in {killer}'s room lists {victim}'s name beside an unpaid sum.",
    "A hidden stash of money was wrapped in a note demanding repayment before midnight.",
    "A betting slip links {killer}'s debt to a threat {victim} had planned to expose."
  ];
  if (lower.includes("affair") || lower.includes("relationship") || lower.includes("dating") || lower.includes("engagement") || lower.includes("widowed")) return [
    "A private letter proves {victim} knew about {killer}'s hidden relationship.",
    "A photograph tucked inside {killer}'s book connects the secret romance to {victim}'s threat.",
    "A torn note shows {victim} planned to reveal {killer}'s private relationship at breakfast."
  ];
  if (lower.includes("forged") || lower.includes("document")) return [
    "A forged document in {killer}'s handwriting was hidden inside a locked writing case.",
    "Ink and paper in {killer}'s room match the false document {victim} had discovered.",
    "A draft signature page proves {victim} could expose {killer}'s forgery."
  ];
  if (lower.includes("blackmail")) return [
    "A blackmail note in {victim}'s hand names {killer} and a deadline.",
    "A bundle of marked bills was hidden where {killer} could retrieve it.",
    "A diary entry shows {victim} intended to demand silence money from {killer}."
  ];
  if (lower.includes("stolen") || lower.includes("work") || lower.includes("bribing")) return [
    "A staff ledger shows missing money on shifts controlled by {killer}.",
    "A receipt hidden in {killer}'s bag connects the stolen funds to {victim}'s accusation.",
    "A note from {victim} warned {killer} that the theft would be reported."
  ];
  if (lower.includes("key") || lower.includes("forbidden room")) return [
    "A stolen key was hidden where {killer} thought no adult would search.",
    "Dust on a forbidden-room shelf shows {killer} entered before {victim} died.",
    "A written warning from {victim} names the forbidden room and {killer}'s lie."
  ];
  return [
    "A diary entry from {victim} names {killer} as the person they feared exposing.",
    "A hidden note explains why {victim}'s knowledge threatened {killer}.",
    "A torn page in {killer}'s room matches the secret {victim} had discovered."
  ];
}

function mysteryExtraClues(method: string): string[] {
  const kind = mysteryMethodKind(method);
  const shared = [
    "A fresh footprint crossed dust in a corridor that had not been disturbed for days.",
    "A dropped personal item belonging to {killer} was found on the route away from the scene.",
    "A partial fingerprint was found on the nearest door handle after it had supposedly been cleaned.",
    "A servant's timing note contradicts {killer}'s public alibi."
  ];
  if (kind === "drink" || kind === "food" || kind === "allergen" || kind === "drug") {
    return [
      "A stained napkin from {victim}'s table was hidden in the wrong laundry basket.",
      "The dining seating card was moved so {killer} could reach {victim}'s serving.",
      "A cup or plate was removed from the scene before the police arrived.",
      ...shared
    ];
  }
  return shared;
}

function mysteryProofsFor(method: string, motive: string, killer: MysteryNpc, victim: MysteryNpc, npcs: MysteryNpc[], relationships: MysteryNpcRelationship[]): string[] {
  const witnessPool = npcs.filter((npc) => npc.id !== killer.id && npc.id !== victim.id && npc.alive !== false);
  const witness = pick(witnessPool.length > 0 ? witnessPool : [killer]);
  if (witness.id !== killer.id) {
    addMysteryNpcRelationship(
      relationships,
      witness,
      killer,
      "Witness",
      `${fullName(witness)} may connect ${fullName(killer)} to ${fullName(victim)}'s death if trusted enough.`,
      { hidden: true, trustImpact: 5, motiveRisk: 11 }
    );
  }
  const proofTemplates = [
    pick(mysteryWitnessClues),
    pick(mysteryMethodClues(method)),
    pick(mysteryMotiveClues(motive)),
    pick(mysteryExtraClues(method))
  ];
  return proofTemplates
    .map((proof) => fillMysteryTemplate(proof, killer, victim, npcs, witness))
    .filter((proof, index, list) => list.indexOf(proof) === index)
    .slice(0, 4);
}

function cleanSentenceEnd(text: string): string {
  return text.trim().replace(/[.!?]+$/g, "");
}

function mysteryPairRelationship(relationships: MysteryNpcRelationship[], a: MysteryNpc, b: MysteryNpc): MysteryNpcRelationship | undefined {
  return relationships
    .filter((relationship) =>
      (relationship.fromId === a.id && relationship.toId === b.id) ||
      (relationship.fromId === b.id && relationship.toId === a.id)
    )
    .sort((left, right) => right.motiveRisk - left.motiveRisk)[0];
}

function mysteryMotiveFromRelationship(relationship: MysteryNpcRelationship, killer: MysteryNpc, victim: MysteryNpc): string {
  if (relationship.kind === "Debt") return `To stop ${fullName(victim)} from forcing payment on a debt ${fullName(killer)} could not repay`;
  if (relationship.kind === "Blackmail") return `To stop ${fullName(victim)} from using blackmail against ${fullName(killer)}`;
  if (relationship.kind === "Witness") return `To keep ${fullName(victim)} from revealing what they witnessed about ${fullName(killer)}`;
  if (relationship.kind === "Romance" || relationship.kind === "Affair") return `To keep a private relationship with ${fullName(victim)} from becoming public`;
  if (relationship.kind === "Rivalry") return `To end a bitter rivalry with ${fullName(victim)} before it ruined ${fullName(killer)}`;
  if (relationship.kind === "Family" || relationship.kind === "Marriage") return `To silence ${fullName(victim)} after a family argument turned dangerous`;
  return `To silence ${fullName(victim)} after they learned too much about ${fullName(killer)}`;
}

function mysteryMotiveFor(killer: MysteryNpc, victim: MysteryNpc, npcs: MysteryNpc[], relationships: MysteryNpcRelationship[]): string {
  const directRelationship = mysteryPairRelationship(relationships, killer, victim);
  if (directRelationship && directRelationship.motiveRisk >= 7) return mysteryMotiveFromRelationship(directRelationship, killer, victim);

  if (killer.age < 18 || victim.age < 18) {
    const secret = killer.age < 18 ? pick(mysteryMinorMotiveTemplates) : "To stop {victim} revealing a dangerous family secret.";
    killer.secret = killer.age < 18
      ? pick(["Stole a key and hid it from their guardian.", "Was seen in a forbidden room.", "Hid evidence after overhearing the real plan."])
      : "Is hiding a dangerous family secret involving a younger guest.";
    addMysteryNpcRelationship(
      relationships,
      victim,
      killer,
      "Witness",
      `${fullName(victim)} knew that ${fullName(killer)} was connected to a forbidden room, stolen key, or hidden evidence.`,
      { hidden: true, trustImpact: -10, motiveRisk: 13 }
    );
    return fillMysteryTemplate(secret, killer, victim, npcs);
  }

  const scenario = pick(["debt", "forgery", "inheritance", "blackmail", "work_theft", "relationship"]);
  if (scenario === "inheritance") {
    killer.secret = "Is hiding a forged inheritance document.";
    victim.secret = "Was preparing to challenge an inheritance arrangement.";
    if (killer.role === "Guest") killer.reasonOfStay = "Meeting a lawyer about an inheritance";
    if (victim.role === "Guest") victim.reasonOfStay = "Meeting a lawyer about an inheritance";
    addMysteryNpcRelationship(
      relationships,
      killer,
      victim,
      "Rivalry",
      `${fullName(killer)} and ${fullName(victim)} were privately disputing an inheritance tied to Ravenwood.`,
      { hidden: true, trustImpact: -14, motiveRisk: 15 }
    );
    return `To silence ${fullName(victim)} after a private argument about inheritance`;
  }

  if (scenario === "debt") {
    killer.secret = pick(["Is deeply in debt.", "Has unpaid gambling debts and has told no one.", "Has been borrowing money from friends and lying about why."]);
    addMysteryNpcRelationship(
      relationships,
      killer,
      victim,
      "Debt",
      `${fullName(killer)} owed ${fullName(victim)} money and feared the debt would be exposed.`,
      { hidden: true, trustImpact: -12, motiveRisk: 14 }
    );
    return `To stop ${fullName(victim)} from exposing ${fullName(killer)}'s debt`;
  }

  if (scenario === "forgery") {
    killer.secret = "Is hiding a forged document.";
    victim.secret = "Had noticed a forged signature in private papers.";
    addMysteryNpcRelationship(
      relationships,
      victim,
      killer,
      "Witness",
      `${fullName(victim)} had seen evidence that ${fullName(killer)} forged a document.`,
      { hidden: true, trustImpact: -10, motiveRisk: 14 }
    );
    return `To keep ${fullName(victim)} from proving that ${fullName(killer)} had forged a document`;
  }

  if (scenario === "work_theft") {
    killer.secret = killer.role === "Staff" ? "Has been stealing small amounts of money from work." : "Has been bribing a servant.";
    victim.secret = `Knew about ${fullName(killer)}'s theft or bribery at Ravenwood.`;
    addMysteryNpcRelationship(
      relationships,
      victim,
      killer,
      "Witness",
      `${fullName(victim)} knew about ${fullName(killer)}'s theft or bribery at Ravenwood.`,
      { hidden: true, trustImpact: -9, motiveRisk: 13 }
    );
    return `To stop ${fullName(victim)} revealing that ${fullName(killer)} had stolen money or bribed staff`;
  }

  if (scenario === "relationship") {
    const partner = pick(npcs.filter((npc) => npc.id !== killer.id && npc.id !== victim.id && npc.age >= 18));
    ensureSharedRavenwoodHistory(killer, partner);
    ensureSharedRavenwoodHistory(victim, killer);
    killer.familyStatus = "Secretly dating";
    killer.secret = `Is secretly involved with ${fullName(partner)}.`;
    victim.secret = `Knew about ${fullName(killer)}'s private relationship with ${fullName(partner)}.`;
    addMysteryNpcRelationship(
      relationships,
      killer,
      partner,
      "Romance",
      `${fullName(killer)} and ${fullName(partner)} are romantically involved but keeping it private.`,
      { hidden: true, trustImpact: 6, motiveRisk: 8 }
    );
    addMysteryNpcRelationship(
      relationships,
      victim,
      killer,
      "Witness",
      `${fullName(victim)} knew about ${fullName(killer)}'s private relationship with ${fullName(partner)}.`,
      { hidden: true, trustImpact: -9, motiveRisk: 13 }
    );
    return `To prevent ${fullName(victim)} from exposing ${fullName(killer)}'s relationship with ${fullName(partner)}`;
  }

  killer.secret = "Is being blackmailed over an old lie.";
  victim.secret = `Had leverage over ${fullName(killer)}.`;
  addMysteryNpcRelationship(
    relationships,
    victim,
    killer,
    "Blackmail",
    `${fullName(victim)} had leverage over ${fullName(killer)} and threatened to use it.`,
    { hidden: true, trustImpact: -13, motiveRisk: 15 }
  );
  return `To stop ${fullName(victim)} from revealing a blackmail scheme`;
}

function uniqueRavenwoodFirstName(sex: Sex, familyName: string, usedNames: Set<string>, usedFirstNames: Set<string>, preferred?: string): string {
  const bank = sex === "Male" ? ravenwoodMaleNames : ravenwoodFemaleNames;
  const candidates = preferred && bank.includes(preferred) ? [preferred, ...bank] : bank;
  const found = candidates.find((name) => !usedFirstNames.has(name.toLowerCase()) && !usedNames.has(`${name} ${familyName}`.toLowerCase()));
  if (found) {
    usedFirstNames.add(found.toLowerCase());
    usedNames.add(`${found} ${familyName}`.toLowerCase());
    return found;
  }
  let suffix = 2;
  while (usedFirstNames.has(`${bank[0]} ${suffix}`.toLowerCase()) || usedNames.has(`${bank[0]} ${suffix} ${familyName}`.toLowerCase())) suffix += 1;
  const fallback = `${bank[0]} ${suffix}`;
  usedFirstNames.add(fallback.toLowerCase());
  usedNames.add(`${fallback} ${familyName}`.toLowerCase());
  return fallback;
}

function ravenwoodFamilyName(preferred?: string, blockedFamilyNames = new Set<string>()): string {
  if (preferred && ravenwoodSurnames.includes(preferred) && !blockedFamilyNames.has(preferred.toLowerCase())) return preferred;
  const available = ravenwoodSurnames.filter((name) => !blockedFamilyNames.has(name.toLowerCase()));
  return pick(available.length > 0 ? available : ravenwoodSurnames);
}

function mysteryFamilyStatusFor(age: number, role: MysteryNpc["role"]): string {
  if (age < 14) return "Child";
  if (age < 18) return "Single";
  if (role === "Staff") return pick(["Single", "Married", "Widowed", "Divorced", "In a relationship"]);
  if (age < 24) return pick(["Single", "Single", "Engaged", "Secretly dating", "Unsure", "Open to explore"]);
  return pick(mysteryFamilyStatuses);
}

function mysteryInterestsFor(age: number): string[] {
  const bank = age < 18 ? mysteryChildInterests : mysteryInterests;
  return [pick(bank), pick(bank)].filter((interest, index, list) => list.indexOf(interest) === index);
}

function mysterySecretFor(age: number): string {
  if (age < 14) return pick(mysteryChildSecrets);
  if (age < 18) return pick(mysteryTeenSecrets);
  return pick(mysterySecrets);
}

function mysteryQuirkFor(age: number): string {
  if (age < 18) return pick(mysteryChildQuirks);
  return pick(mysteryQuirks);
}

function mysteryGuestCurrentStay(): string {
  const days = rand(0, 4);
  if (days === 0) return "Arrived today.";
  if (days === 1) return "Has been staying at Ravenwood for 1 day.";
  return `Has been staying at Ravenwood for ${days} days.`;
}

function mysteryGuestPlannedStay(currentStay: string): string {
  const stayedMatch = currentStay.match(/(\d+) day/);
  const alreadyStayed = currentStay.includes("Arrived today") ? 0 : Number(stayedMatch?.[1] ?? 1);
  const plannedNights = Math.max(alreadyStayed + rand(2, 6), rand(3, 10));
  return `Planned stay: ${plannedNights} nights.`;
}

function mysteryGuestPreviousStay(age: number, reasonOfStay?: string): string {
  const hasReasonForPriorVisit = Boolean(reasonOfStay?.match(/old friend|relative|family history|inheritance|local story/i));
  const visitedBefore = hasReasonForPriorVisit || roll(age < 18 ? 0.28 : 0.42);
  if (!visitedBefore) return "First stay at Ravenwood.";
  const visitCount = rand(1, 5);
  return `Visited Ravenwood ${visitCount === 1 ? "once" : `${visitCount} times`} before, most recently ${pick(["last winter", "last spring", "last summer", "two years ago", "several years ago"])}.`;
}

function mysteryStaffCurrentStay(age: number): string {
  const maxYears = Math.max(1, age - RAVENWOOD_MIN_STAFF_AGE);
  const years = rand(0, Math.min(18, maxYears));
  if (years <= 0) {
    const months = rand(2, 11);
    return `Has worked at Ravenwood for ${months} months.`;
  }
  return `Has worked at Ravenwood for ${years} ${years === 1 ? "year" : "years"}.`;
}

function mysteryStayHistoryFor(role: MysteryNpc["role"], age: number, reasonOfStay?: string) {
  if (role === "Staff") {
    return {
      currentStay: mysteryStaffCurrentStay(age),
      plannedStay: "Staff residence: ongoing.",
      previousStay: "Lives or works at Ravenwood."
    };
  }
  const currentStay = mysteryGuestCurrentStay();
  return {
    currentStay,
    plannedStay: mysteryGuestPlannedStay(currentStay),
    previousStay: mysteryGuestPreviousStay(age, reasonOfStay)
  };
}

function ensurePriorRavenwoodHistory(npc: MysteryNpc) {
  const previousStay = npc.previousStay ?? "";
  const currentStay = npc.currentStay ?? "";
  if (npc.role === "Guest" && (!previousStay || previousStay.includes("First stay"))) {
    npc.previousStay = `Visited Ravenwood before, most recently ${pick(["last winter", "last spring", "last summer", "two years ago", "several years ago"])}.`;
  }
  if (npc.role === "Staff" && (!currentStay || currentStay.includes("months"))) {
    npc.currentStay = `Has worked at Ravenwood for ${rand(2, 9)} years.`;
  }
}

function ensureSharedRavenwoodHistory(a: MysteryNpc, b: MysteryNpc) {
  ensurePriorRavenwoodHistory(a);
  ensurePriorRavenwoodHistory(b);
}

function mysteryChildGuardianRelation(childSex: Sex, childAge: number, guardian: MysteryNpc): { childRelation: string; guardianRelation: string; reasonRole: string } {
  const ageGap = guardian.age - childAge;
  const parentRole = guardian.sex === "Female" ? "mother" : "father";
  const olderSiblingRole = guardian.sex === "Female" ? "older sister" : "older brother";
  const auntUncleRole = guardian.sex === "Female" ? "aunt" : "uncle";
  const childRole = childSex === "Female" ? "daughter" : "son";
  const niblingRole = childSex === "Female" ? "niece" : "nephew";
  const youngerSiblingRole = childSex === "Female" ? "younger sister" : "younger brother";

  if (ageGap >= 22 && roll(0.68)) {
    return { childRelation: `${childRole} of`, guardianRelation: `${parentRole} of`, reasonRole: parentRole };
  }
  if (ageGap <= 30 && roll(0.32)) {
    return { childRelation: `${youngerSiblingRole} of`, guardianRelation: `${olderSiblingRole} of`, reasonRole: olderSiblingRole };
  }
  if (roll(0.55)) {
    return { childRelation: `${niblingRole} of`, guardianRelation: `${auntUncleRole} of`, reasonRole: auntUncleRole };
  }
  return { childRelation: `${niblingRole} of`, guardianRelation: `${auntUncleRole} of`, reasonRole: auntUncleRole };
}

function mysteryBalancedSexPlan(total: number, playerSex?: Sex): Sex[] {
  if (total <= 0) return [];
  const nearEven = roll(0.5);
  const femaleLeansMajority = roll(0.5);
  const ratioAllowed = (femaleCount: number, maleCount: number) => {
    const count = femaleCount + maleCount;
    return count <= 0 || Math.max(femaleCount, maleCount) / count <= 0.6;
  };
  const candidates = Array.from({ length: total + 1 }, (_, femaleCount) => {
    const maleCount = total - femaleCount;
    const playerFemaleCount = playerSex === "Female" ? 1 : 0;
    const playerMaleCount = playerSex === "Male" ? 1 : 0;
    return {
      femaleCount,
      maleCount,
      gap: Math.abs(femaleCount - maleCount),
      allowed: ratioAllowed(femaleCount, maleCount) && ratioAllowed(femaleCount + playerFemaleCount, maleCount + playerMaleCount)
    };
  }).filter((candidate) => candidate.allowed);
  const safestCandidates = candidates.length > 0 ? candidates : [{ femaleCount: Math.ceil(total / 2), maleCount: Math.floor(total / 2), gap: total % 2, allowed: true }];
  const targetGap = nearEven ? Math.min(...safestCandidates.map((candidate) => candidate.gap)) : Math.max(...safestCandidates.map((candidate) => candidate.gap));
  const preferred = safestCandidates.filter((candidate) =>
    candidate.gap === targetGap &&
    (candidate.femaleCount === candidate.maleCount || (femaleLeansMajority ? candidate.femaleCount >= candidate.maleCount : candidate.maleCount >= candidate.femaleCount))
  );
  const chosen = pick(preferred.length > 0 ? preferred : safestCandidates.filter((candidate) => candidate.gap === targetGap));
  return shuffled([
    ...Array.from({ length: chosen.femaleCount }, () => "Female" as Sex),
    ...Array.from({ length: chosen.maleCount }, () => "Male" as Sex)
  ]);
}

function mysteryEducationFor(age: number, role: MysteryNpc["role"]): string {
  if (age < 14) return pick(["Some elementary school", "Completed elementary school", "Home-schooled through secondary level", "No formal education"]);
  if (age < 18) return role === "Guest" ? pick(["Some secondary school", "Home-schooled through secondary level", "Drama school training"]) : pick(["Some secondary school", "Workplace skills training", "Food hygiene training", "No formal education"]);
  if (role === "Staff") return pick(["No formal education", "Completed compulsory schooling", "Workplace skills training", "Food hygiene training", "Customer service training", "First aid training", "Security guard training"]);
  return pick(mysteryEducations);
}

function mysteryOccupationFor(age: number, role: MysteryNpc["role"]): string {
  if (age < 14) return role === "Guest" ? "Child guest" : "Household child";
  if (age < 18) return role === "Guest" ? pick(["Student", "Young heir", "Companion in training"]) : pick(["Kitchen helper", "Laundry helper", "Page"]);
  return role === "Guest" ? pick(mysteryGuestOccupations) : pick(mysteryStaffOccupations);
}

function mysteryProfileFor(age: number, role: MysteryNpc["role"]): { education: string; occupation: string } {
  if (age < 14) {
    return {
      education: pick(["Some elementary school", "Completed elementary school", "Home-schooled through secondary level", "No formal education"]),
      occupation: role === "Guest" ? "Child guest" : "Household child"
    };
  }
  if (age < 18) {
    return role === "Guest"
      ? {
        education: pick(["Some secondary school", "Home-schooled through secondary level", "Drama school training"]),
        occupation: pick(["Student", "Young heir", "Companion in training"])
      }
      : {
        education: pick(["Some secondary school", "Workplace skills training", "Food hygiene training", "No formal education"]),
        occupation: pick(["Kitchen helper", "Laundry helper", "Page"])
      };
  }
  if (role === "Staff") {
    const occupation = pick(mysteryStaffOccupations);
    const educationByStaffJob: Record<string, string[]> = {
      Butler: ["Customer service training", "Workplace skills training", "Completed compulsory schooling"],
      Cleaner: ["No formal education", "Workplace skills training", "Completed compulsory schooling"],
      Cook: ["Food hygiene training", "Workplace skills training", "Completed compulsory schooling"],
      Gardener: ["Workplace skills training", "Completed compulsory schooling"],
      "Head waiter": ["Customer service training", "Food hygiene training", "Completed compulsory schooling"],
      Housekeeper: ["Customer service training", "Workplace skills training", "Completed compulsory schooling"],
      "Kitchen porter": ["Food hygiene training", "Workplace skills training", "No formal education"],
      "Laundry worker": ["Workplace skills training", "No formal education", "Completed compulsory schooling"],
      "Night porter": ["Security guard training", "Customer service training", "Completed compulsory schooling"],
      Nurse: ["First aid training", "Medical secretary training", "Completed compulsory schooling"],
      "Security guard": ["Security guard training", "First aid training", "Completed compulsory schooling"],
      Waiter: ["Customer service training", "Food hygiene training", "Completed compulsory schooling"],
      Chauffeur: ["Workplace skills training", "First aid training", "Completed compulsory schooling"],
      "Estate cleaner": ["Workplace skills training", "No formal education", "Completed compulsory schooling"]
    };
    return { occupation, education: pick(educationByStaffJob[occupation] ?? ["Workplace skills training", "Completed compulsory schooling"]) };
  }
  const availableProfiles = mysteryGuestCareerProfiles.filter((profile) => age >= profile.minAge);
  const profile = pick(availableProfiles.length > 0 ? availableProfiles : mysteryGuestCareerProfiles.slice(0, 8));
  return { occupation: profile.occupation, education: pick(profile.educations) };
}

function ravenwoodPortraitAge(age: number): number {
  if (age < 14) return 10;
  if (age < 21) return 16;
  if (age < 28) return 24;
  if (age < 45) return 30;
  return 50;
}

function ravenwoodStaffPortraitAge(age: number): number {
  if (age < 24) return 16;
  if (age < 30) return 24;
  if (age < 50) return 30;
  return 50;
}

function chooseRavenwoodGuestPortrait(input: { sex: Sex; age: number; usedPortraitKeys: Set<string>; visualRace?: MysteryVisualRace; lineage?: string }): RavenwoodGuestPortraitAsset | null {
  const targetAge = ravenwoodPortraitAge(input.age);
  const base = ravenwoodGuestPortraitAssets.filter((asset) => asset.sex === input.sex && asset.age === targetAge && !input.usedPortraitKeys.has(asset.key));
  const lineageMatches = input.lineage ? base.filter((asset) => asset.lineage === input.lineage) : [];
  const raceMatches = input.visualRace ? base.filter((asset) => asset.visualRace === input.visualRace) : [];
  const candidates = lineageMatches.length > 0 ? lineageMatches : raceMatches.length > 0 ? raceMatches : base;
  const fallback = candidates.length > 0 ? candidates : ravenwoodGuestPortraitAssets.filter((asset) => asset.sex === input.sex && !input.usedPortraitKeys.has(asset.key));
  const portrait = fallback.length > 0 ? pick(fallback) : null;
  if (portrait) input.usedPortraitKeys.add(portrait.key);
  return portrait;
}

function chooseRavenwoodStaffPortrait(input: { sex: Sex; age: number; usedPortraitKeys: Set<string>; visualRace?: MysteryVisualRace; lineage?: string }): RavenwoodGuestPortraitAsset | null {
  const targetAge = ravenwoodStaffPortraitAge(input.age);
  const base = ravenwoodStaffPortraitAssets.filter((asset) => asset.sex === input.sex && asset.age === targetAge && !input.usedPortraitKeys.has(asset.key));
  const lineageMatches = input.lineage ? base.filter((asset) => asset.lineage === input.lineage) : [];
  const raceMatches = input.visualRace ? base.filter((asset) => asset.visualRace === input.visualRace) : [];
  const candidates = lineageMatches.length > 0 ? lineageMatches : raceMatches.length > 0 ? raceMatches : base;
  const fallback = candidates.length > 0 ? candidates : ravenwoodStaffPortraitAssets.filter((asset) => asset.sex === input.sex && !input.usedPortraitKeys.has(asset.key));
  const portrait = fallback.length > 0 ? pick(fallback) : null;
  if (portrait) input.usedPortraitKeys.add(portrait.key);
  return portrait;
}

function chooseRavenwoodPlayerPortrait(input: { sex: Sex; age: number; usedPortraitKeys: Set<string>; visualRace?: MysteryVisualRace }): RavenwoodGuestPortraitAsset | null {
  const targetAge = ravenwoodPortraitAge(input.age);
  const base = ravenwoodPlayerPortraitAssets.filter((asset) => asset.sex === input.sex && asset.age === targetAge && !input.usedPortraitKeys.has(asset.key));
  const raceMatches = input.visualRace ? base.filter((asset) => asset.visualRace === input.visualRace) : [];
  const candidates = raceMatches.length > 0 ? raceMatches : base;
  const fallback = candidates.length > 0 ? candidates : ravenwoodPlayerPortraitAssets.filter((asset) => asset.sex === input.sex && !input.usedPortraitKeys.has(asset.key));
  const portrait = fallback.length > 0 ? pick(fallback) : null;
  if (portrait) input.usedPortraitKeys.add(portrait.key);
  return portrait;
}

function addMysteryFamilyNote(npc: MysteryNpc, note: string) {
  npc.familyRelationNote = npc.familyRelationNote ? `${npc.familyRelationNote}; ${note}` : note;
}

function addMysteryNpcRelationship(
  relationships: MysteryNpcRelationship[],
  from: MysteryNpc,
  to: MysteryNpc,
  kind: MysteryNpcRelationshipKind,
  detail: string,
  options: Partial<Pick<MysteryNpcRelationship, "hidden" | "trustImpact" | "motiveRisk">> = {}
) {
  if (from.id === to.id) return;
  const duplicate = relationships.some((relationship) =>
    relationship.kind === kind &&
    ((relationship.fromId === from.id && relationship.toId === to.id) || (relationship.fromId === to.id && relationship.toId === from.id)) &&
    relationship.detail === detail
  );
  if (duplicate) return;
  relationships.push({
    id: uid(),
    fromId: from.id,
    toId: to.id,
    kind,
    detail,
    hidden: options.hidden ?? false,
    trustImpact: options.trustImpact ?? 0,
    motiveRisk: options.motiveRisk ?? 0
  });
}

function mysteryRelationshipLinesFor(npc: MysteryNpc, npcs: MysteryNpc[], relationships: MysteryNpcRelationship[]): string[] {
  return relationships
    .filter((relationship) => relationship.fromId === npc.id || relationship.toId === npc.id)
    .map((relationship) => {
      const otherId = relationship.fromId === npc.id ? relationship.toId : relationship.fromId;
      const other = npcs.find((candidate) => candidate.id === otherId);
      const visibility = relationship.hidden ? "hidden, testing visible" : "known";
      return `${relationship.kind} with ${other ? fullName(other) : "Unknown"} (${visibility}): ${relationship.detail}`;
    });
}

function buildMysteryNpcRelationshipPool(npcs: MysteryNpc[], relationships: MysteryNpcRelationship[]) {
  const guests = npcs.filter((npc) => npc.role === "Guest");
  const staff = npcs.filter((npc) => npc.role === "Staff");
  const adults = npcs.filter((npc) => npc.age >= 18);
  const adultGuests = guests.filter((npc) => npc.age >= 18);
  const children = npcs.filter((npc) => npc.isChild);
  const usedPairs = new Set(relationships.map((relationship) => [relationship.fromId, relationship.toId].sort().join(":")));
  const pairKey = (a: MysteryNpc, b: MysteryNpc) => [a.id, b.id].sort().join(":");
  const addRandom = (from: MysteryNpc, to: MysteryNpc, kind: MysteryNpcRelationshipKind, detail: string, hidden = false, trustImpact = 0, motiveRisk = 0) => {
    if (from.id === to.id) return false;
    const key = pairKey(from, to);
    if (usedPairs.has(key) && roll(0.72)) return false;
    usedPairs.add(key);
    addMysteryNpcRelationship(relationships, from, to, kind, detail, { hidden, trustImpact, motiveRisk });
    return true;
  };

  for (const staffMember of staff) {
    const guest = guests.length > 0 ? pick(guests) : undefined;
    if (guest && roll(0.38)) {
      const detail = pick([
        `${fullName(staffMember)} regularly serves ${fullName(guest)} and knows their habits.`,
        `${fullName(staffMember)} saw ${fullName(guest)} in a private corridor after dinner.`,
        `${fullName(staffMember)} is careful around ${fullName(guest)} because one complaint could cost the position.`
      ]);
      if (detail.includes("regularly serves")) ensureSharedRavenwoodHistory(staffMember, guest);
      addRandom(staffMember, guest, pick<MysteryNpcRelationshipKind>(["Work", "Suspicion", "Protection"]), detail, roll(0.45), rand(-8, 6), rand(1, 7));
    }
  }

  const targetExtraLinks = rand(12, 22);
  for (let index = 0; index < targetExtraLinks; index += 1) {
    const pool = roll(0.75) && adults.length >= 2 ? adults : npcs;
    if (pool.length < 2) break;
    const from = pick(pool);
    const to = pick(pool.filter((npc) => npc.id !== from.id));
    if (from.age < 18 || to.age < 18) {
      addRandom(from, to, pick<MysteryNpcRelationshipKind>(["Friendship", "Protection", "Suspicion"]), pick([
        `${fullName(from)} trusts ${fullName(to)} more than most people in the house.`,
        `${fullName(from)} has been warned not to be alone with ${fullName(to)}.`,
        `${fullName(from)} overheard ${fullName(to)} arguing and has not understood the meaning yet.`
      ]), roll(0.42), rand(-4, 8), rand(0, 4));
    } else if (roll(0.22)) {
      ensureSharedRavenwoodHistory(from, to);
      const romanceDetail = pick([
        `${fullName(from)} and ${fullName(to)} became romantically involved during an earlier Ravenwood stay and disagree about whether to make it public now.`,
        `${fullName(from)} has been meeting ${fullName(to)} in private again after a previous stay, which could ruin more than one reputation.`,
        `${fullName(from)} still wants answers from ${fullName(to)} after a promise made during an earlier visit.`
      ]);
      addRandom(from, to, pick<MysteryNpcRelationshipKind>(["Romance", "Affair"]), romanceDetail, true, rand(-10, 12), rand(5, 14));
    } else {
      const detail = pick([
        `${fullName(from)} owes ${fullName(to)} a favor and resents the reminder.`,
        `${fullName(from)} believes ${fullName(to)} lied about why they came to Ravenwood.`,
        `${fullName(from)} and ${fullName(to)} were seen arguing before the house was sealed.`,
        `${fullName(from)} knows an embarrassing secret about ${fullName(to)}.`,
        `${fullName(from)} considers ${fullName(to)} useful, but not trustworthy.`,
        `${fullName(from)} and ${fullName(to)} share an old friendship that has gone sour.`
      ]);
      if (detail.includes("old friendship")) ensureSharedRavenwoodHistory(from, to);
      addRandom(from, to, pick<MysteryNpcRelationshipKind>(["Friendship", "Rivalry", "Debt", "Blackmail", "Witness", "Suspicion"]), detail, roll(0.5), rand(-14, 10), rand(2, 12));
    }
  }

  for (const child of children) {
    const guardian = adultGuests.find((guest) => child.familyRelationNote?.includes(fullName(guest)));
    if (guardian) {
      const alreadyRecorded = relationships.some((relationship) =>
        relationship.kind === "Family" &&
        ((relationship.fromId === guardian.id && relationship.toId === child.id) || (relationship.fromId === child.id && relationship.toId === guardian.id))
      );
      if (alreadyRecorded) continue;
      addMysteryNpcRelationship(relationships, guardian, child, "Family", `${fullName(child)} is staying under ${fullName(guardian)}'s care.`, { trustImpact: 12, motiveRisk: 1 });
    }
  }
}

function buildMysterySanityLedger(mystery: Pick<MysteryGame, "id" | "title" | "player" | "day" | "daytime" | "rooms" | "npcs" | "npcRelationships" | "murders" | "currentRoomId" | "playerRoomId" | "inventory">): string[] {
  const roomName = (roomId: string) => mystery.rooms.find((room) => room.id === roomId)?.name ?? roomId;
  const lines = [
    `Ledger created for ${mystery.title} (${mystery.id}).`,
    `Player: ${fullName(mystery.player)}; ${mystery.player.sex}; assigned room ${roomName(mystery.playerRoomId)}; current room ${roomName(mystery.currentRoomId)}.`,
    `Clock: Day ${mystery.day}, ${mystery.daytime}. Inventory: ${mystery.inventory.join(", ")}.`,
    `Rooms: ${mystery.rooms.length} total; ${mystery.rooms.filter((room) => room.accessible).length} accessible at start.`,
    `NPCs: ${mystery.npcs.length} total; ${mystery.npcs.filter((npc) => npc.role === "Guest").length} guests; ${mystery.npcs.filter((npc) => npc.role === "Staff").length} staff.`,
    `NPC sex balance: ${mystery.npcs.filter((npc) => npc.sex === "Female").length} female; ${mystery.npcs.filter((npc) => npc.sex === "Male").length} male.`,
    "NPC roster:"
  ];
  lines.push(...mystery.npcs.map((npc) => `- ${fullName(npc)}: ${npc.sex}, age ${npc.age}, ${npc.role}, ${npc.alive ? "alive" : "dead"}, room/station ${roomName(npc.role === "Guest" ? npc.roomId : npc.stationRoomId)}. Stay: ${npc.currentStay ?? "not recorded"} ${npc.plannedStay ?? ""} Previous: ${npc.previousStay ?? "not recorded"}`));
  lines.push("NPC-to-NPC relationships:");
  lines.push(...(mystery.npcRelationships.length > 0
    ? mystery.npcRelationships.map((relationship) => {
      const from = mystery.npcs.find((npc) => npc.id === relationship.fromId);
      const to = mystery.npcs.find((npc) => npc.id === relationship.toId);
      return `- ${relationship.kind}: ${from ? fullName(from) : "Unknown"} <-> ${to ? fullName(to) : "Unknown"}; hidden=${relationship.hidden}; motiveRisk=${relationship.motiveRisk}; ${relationship.detail}`;
    })
    : ["- None recorded."]));
  lines.push("Murder blueprint:");
  lines.push(...mystery.murders.map((murder, index) => {
    const victim = mystery.npcs.find((npc) => npc.id === murder.victimId);
    const killer = mystery.npcs.find((npc) => npc.id === murder.killerId);
    return `- Murder ${index + 1}: victim ${victim ? fullName(victim) : "Unknown"}, killer ${killer ? fullName(killer) : "Unknown"}, Day ${murder.day} ${murder.daytime}, ${roomName(murder.roomId)}, ${murder.method}. Motive: ${cleanSentenceEnd(murder.motive)}. Proof: ${(murder.proofs?.length ? murder.proofs : [murder.proof]).join(" | ")}.`;
  }));
  return lines;
}

function buildMysteryRooms(): MysteryRoom[] {
  const guestBedSetups = [
    { bedSetup: "single bed", capacity: 1 },
    { bedSetup: "double bed", capacity: 2 },
    { bedSetup: "two single beds", capacity: 2 }
  ];
  const publicRooms: MysteryRoom[] = [
    { id: "grand-hall", name: "Great Hall", floor: 1, kind: "public", accessible: true, occupantIds: [] },
    { id: "drawing-room", name: "Drawing Room", floor: 1, kind: "public", accessible: true, occupantIds: [] },
    { id: "dining-room", name: "Dining Room", floor: 1, kind: "public", accessible: true, occupantIds: [] },
    { id: "library", name: "Library", floor: 1, kind: "public", accessible: true, occupantIds: [] },
    { id: "conservatory", name: "Conservatory", floor: 1, kind: "public", accessible: true, occupantIds: [] },
    { id: "billiards-room", name: "Billiards Room", floor: 1, kind: "public", accessible: true, occupantIds: [] },
    { id: "smoking-room", name: "Smoking Room", floor: 1, kind: "public", accessible: true, occupantIds: [] },
    { id: "west-gallery", name: "West Gallery", floor: 2, kind: "public", accessible: true, occupantIds: [] },
    { id: "garden-terrace", name: "Garden Terrace", floor: 1, kind: "public", accessible: true, occupantIds: [] },
    { id: "kitchen", name: "Kitchen", floor: 1, kind: "service", accessible: false, occupantIds: [] },
    { id: "staff-corridor", name: "Staff Corridor", floor: 1, kind: "staff", accessible: false, occupantIds: [] },
    { id: "servants-hall", name: "Servants Hall", floor: 1, kind: "staff", accessible: false, occupantIds: [] },
    { id: "pantry", name: "Pantry", floor: 1, kind: "service", accessible: false, occupantIds: [] },
    { id: "laundry", name: "Laundry", floor: 1, kind: "service", accessible: false, occupantIds: [] },
    { id: "back-stairs", name: "Back Stairs", floor: 2, kind: "staff", accessible: false, occupantIds: [] }
  ];
  const guestRooms: MysteryRoom[] = Array.from({ length: 13 }, (_, index) => ({
    ...guestBedSetups[index % guestBedSetups.length],
    id: `guest-room-${index + 1}`,
    name: `Guest Room ${index + 1}`,
    floor: index < 6 ? 2 : 3,
    kind: "guest",
    accessible: false,
    occupantIds: []
  }));
  return [...publicRooms, ...guestRooms];
}

function assignMysteryGuestRooms(rooms: MysteryRoom[], npcs: MysteryNpc[], relationships: MysteryNpcRelationship[], playerRoomId: string) {
  const guestRooms = rooms.filter((room) => room.kind === "guest");
  const playerRoom = rooms.find((room) => room.id === playerRoomId);
  for (const room of guestRooms) {
    room.occupantIds = room.id === playerRoomId ? ["player"] : [];
  }
  if (playerRoom) {
    playerRoom.accessible = true;
    playerRoom.capacity = 1;
    playerRoom.bedSetup = "single bed";
  }

  const availableRooms = guestRooms.filter((room) => room.id !== playerRoomId);
  let nextRoomIndex = 0;
  const unassigned = new Set(npcs.filter((npc) => npc.role === "Guest").map((npc) => npc.id));
  const guestById = new Map(npcs.filter((npc) => npc.role === "Guest").map((npc) => [npc.id, npc]));
  const roomForGroup = () => availableRooms[nextRoomIndex++] ?? availableRooms[availableRooms.length - 1];
  const placeGroup = (group: MysteryNpc[], bedSetup: string) => {
    const room = roomForGroup();
    if (!room || group.length === 0) return;
    room.occupantIds = [];
    room.capacity = Math.max(group.length, bedSetup === "double bed" ? 2 : 1);
    room.bedSetup = bedSetup;
    for (const npc of group) {
      npc.roomId = room.id;
      if (!room.occupantIds.includes(npc.id)) room.occupantIds.push(npc.id);
      unassigned.delete(npc.id);
    }
  };

  const marriageGroups: MysteryNpc[][] = [];
  for (const relationship of relationships.filter((candidate) => candidate.kind === "Marriage")) {
    const left = guestById.get(relationship.fromId);
    const right = guestById.get(relationship.toId);
    if (left && right && left.age >= 18 && right.age >= 18 && unassigned.has(left.id) && unassigned.has(right.id)) {
      marriageGroups.push([left, right]);
    }
  }

  const childrenByGuardian = new Map<string, MysteryNpc[]>();
  for (const child of npcs.filter((npc) => npc.role === "Guest" && npc.age < 18)) {
    const familyLinks = relationships.filter((relationship) =>
      relationship.kind === "Family" && (relationship.fromId === child.id || relationship.toId === child.id)
    );
    const guardian = familyLinks
      .map((relationship) => guestById.get(relationship.fromId === child.id ? relationship.toId : relationship.fromId))
      .find((candidate): candidate is MysteryNpc => Boolean(candidate && candidate.age >= 18))
      ?? npcs.find((candidate) => candidate.role === "Guest" && candidate.age >= 18 && candidate.familyName === child.familyName);
    if (!guardian) continue;
    childrenByGuardian.set(guardian.id, [...(childrenByGuardian.get(guardian.id) ?? []), child]);
  }

  for (const group of marriageGroups) {
    const children = group.flatMap((adult) => childrenByGuardian.get(adult.id) ?? []).filter((child) => unassigned.has(child.id));
    placeGroup([...group, ...children], children.length > 0 ? "double bed and child bed" : "double bed");
  }

  for (const [guardianId, children] of childrenByGuardian) {
    const guardian = guestById.get(guardianId);
    const remainingChildren = children.filter((child) => unassigned.has(child.id));
    if (guardian && unassigned.has(guardian.id) && remainingChildren.length > 0) {
      placeGroup([guardian, ...remainingChildren], remainingChildren.length > 1 ? "single bed and child beds" : "single bed and child bed");
    }
  }

  for (const npc of npcs.filter((candidate) => candidate.role === "Guest" && unassigned.has(candidate.id))) {
    placeGroup([npc], "single bed");
  }
}

function makeMysteryNpc(
  input: Partial<MysteryNpc> & { role: "Guest" | "Staff"; age: number; roomId: string; stationRoomId: string },
  usedNames: Set<string>,
  usedFirstNames: Set<string>,
  blockedFamilyNames = new Set<string>()
): MysteryNpc {
  const sex = input.sex ?? pick<Sex>(["Female", "Male"]);
  const familyName = input.familyName ?? ravenwoodFamilyName(undefined, blockedFamilyNames);
  if (!input.familyName) blockedFamilyNames.add(familyName.toLowerCase());
  const normalizedAge = clamp(input.age, input.role === "Staff" ? RAVENWOOD_MIN_STAFF_AGE : RAVENWOOD_MIN_NPC_AGE, RAVENWOOD_MAX_NPC_AGE);
  const isChild = normalizedAge < 14;
  const profile = mysteryProfileFor(normalizedAge, input.role);
  const reasonOfStay = input.reasonOfStay ?? (input.role === "Staff" ? "WORK" : pick(mysteryReasonsOfStay));
  const stayHistory = mysteryStayHistoryFor(input.role, normalizedAge, reasonOfStay);
  return {
    id: input.id ?? uid(),
    firstName: input.firstName ?? uniqueRavenwoodFirstName(sex, familyName, usedNames, usedFirstNames),
    familyName,
    sex,
    age: normalizedAge,
    role: input.role,
    familyStatus: input.familyStatus ?? mysteryFamilyStatusFor(normalizedAge, input.role),
    education: input.education ?? profile.education,
    occupation: input.occupation ?? profile.occupation,
    interests: input.interests ?? mysteryInterestsFor(normalizedAge),
    reasonOfStay,
    currentStay: input.currentStay ?? stayHistory.currentStay,
    plannedStay: input.plannedStay ?? stayHistory.plannedStay,
    previousStay: input.previousStay ?? stayHistory.previousStay,
    secret: input.secret ?? mysterySecretFor(normalizedAge),
    quirk: input.quirk ?? mysteryQuirkFor(normalizedAge),
    roomId: input.roomId,
    stationRoomId: input.stationRoomId,
    trust: input.trust ?? rand(4, 18),
    romance: input.romance ?? 0,
    romanceRevealed: input.romanceRevealed ?? false,
    familyRelationNote: input.familyRelationNote,
    ravenwoodPortraitKey: input.ravenwoodPortraitKey,
    portraitLineage: input.portraitLineage,
    visualRace: input.visualRace,
    alive: input.alive ?? true,
    isChild
  };
}

function createMysteryGameFromDraft(draft: CharacterDraft, detectiveProfile?: MysteryDetectiveProfile, detectiveAge = 30): MysteryGame {
  const playerInput = detectiveProfile ?? draft;
  const playerAge = detectiveProfile ? detectiveAge : 30;
  const usedNames = new Set<string>();
  const usedFirstNames = new Set<string>();
  const usedPortraitKeys = new Set<string>();
  const playerFamilyName = ravenwoodFamilyName(playerInput.familyName.trim());
  const blockedFamilyNames = new Set<string>([playerFamilyName.toLowerCase()]);
  const playerFirstName = uniqueRavenwoodFirstName(playerInput.sex, playerFamilyName, usedNames, usedFirstNames, playerInput.firstName.trim());
  const playerPortrait = detectiveProfile
    ? ravenwoodPlayerPortraitFor(detectiveProfile, playerAge)
    : chooseRavenwoodPlayerPortrait({ sex: playerInput.sex, age: playerAge, usedPortraitKeys });
  const rooms = buildMysteryRooms();
  const guestRooms = rooms.filter((room) => room.id.startsWith("guest-room"));
  const playerRoom = pick(guestRooms);
  playerRoom.accessible = true;
  playerRoom.capacity = 1;
  playerRoom.bedSetup = "single bed";
  playerRoom.occupantIds.push("player");
  const residentCount = rand(16, 20);
  const guestCount = rand(8, Math.min(12, residentCount - 8));
  const staffCount = residentCount - guestCount;
  const childCount = rand(0, 2);
  const npcs: MysteryNpc[] = [];
  const npcRelationships: MysteryNpcRelationship[] = [];
  const residentSexPlan = mysteryBalancedSexPlan(residentCount, playerInput.sex);
  let residentSexIndex = 0;
  const nextResidentSex = () => residentSexPlan[residentSexIndex++] ?? pick<Sex>(["Female", "Male"]);
  const roomsWithGuestSpace = () => guestRooms.filter((room) => room.id !== playerRoom.id && room.occupantIds.length < (room.capacity ?? 1));
  const moveNpcToRoom = (npc: MysteryNpc, room: MysteryRoom) => {
    const oldRoom = rooms.find((candidate) => candidate.id === npc.roomId);
    if (oldRoom) oldRoom.occupantIds = oldRoom.occupantIds.filter((id) => id !== npc.id);
    npc.roomId = room.id;
    if (!room.occupantIds.includes(npc.id)) room.occupantIds.push(npc.id);
  };
  const ensureChildCanStayWithAdult = (room: MysteryRoom) => {
    room.capacity = Math.max(room.capacity ?? 1, room.occupantIds.length + 1);
    if (!room.bedSetup?.toLowerCase().includes("child")) {
      room.bedSetup = room.bedSetup === "two single beds"
        ? "two single beds and child bed"
        : room.bedSetup === "single bed"
          ? "single bed and child bed"
          : "double bed and child bed";
    }
  };
  const adultGuests: MysteryNpc[] = [];
  for (let index = 0; index < guestCount - childCount; index += 1) {
    const roomsWithSpace = roomsWithGuestSpace();
    const sharedRooms = roomsWithSpace.filter((room) => room.occupantIds.length > 0);
    const emptyRooms = roomsWithSpace.filter((room) => room.occupantIds.length === 0);
    const room = sharedRooms.length > 0 && roll(0.25)
      ? pick(sharedRooms)
      : pick(emptyRooms.length > 0 ? emptyRooms : roomsWithSpace);
    const relatedAdult = adultGuests.length > 0 && roll(0.36) ? pick(adultGuests) : null;
    const possibleFamilyLinks = relatedAdult
      ? [
        "Sibling",
        "Cousin",
        relatedAdult.age >= 36 ? "Adult child" : "",
        relatedAdult.age <= 58 ? "Parent" : "",
        "Spouse"
      ].filter(Boolean)
      : [];
    const familyLink = relatedAdult ? pick(possibleFamilyLinks) : null;
    const relatedAge = relatedAdult?.age ?? rand(18, RAVENWOOD_MAX_NPC_AGE);
    const sex = nextResidentSex();
    const age = familyLink === "Spouse"
      ? clamp(relatedAge + rand(-9, 9), 18, RAVENWOOD_MAX_NPC_AGE)
      : familyLink === "Sibling" || familyLink === "Cousin"
        ? clamp(relatedAge + rand(-14, 14), 18, RAVENWOOD_MAX_NPC_AGE)
        : familyLink === "Adult child"
          ? rand(18, Math.max(18, relatedAge - 18))
          : familyLink === "Parent"
            ? clamp(relatedAge + rand(18, 38), 36, RAVENWOOD_MAX_NPC_AGE)
            : rand(18, RAVENWOOD_MAX_NPC_AGE);
    const familyStatus = familyLink === "Spouse" ? "Married" : undefined;
    const bloodRelative = Boolean(relatedAdult && familyLink !== "Spouse");
    const portrait = chooseRavenwoodGuestPortrait({
      sex,
      age,
      usedPortraitKeys,
      visualRace: bloodRelative ? relatedAdult?.visualRace : undefined,
      lineage: bloodRelative && relatedAdult?.sex === sex ? relatedAdult.portraitLineage : undefined
    });
    const npc = makeMysteryNpc({
      role: "Guest",
      sex,
      age,
      familyName: relatedAdult ? relatedAdult.familyName : undefined,
      familyStatus,
      familyRelationNote: relatedAdult ? `${familyLink} of ${fullName(relatedAdult)}` : undefined,
      currentStay: relatedAdult ? relatedAdult.currentStay : undefined,
      plannedStay: relatedAdult ? relatedAdult.plannedStay : undefined,
      previousStay: relatedAdult ? relatedAdult.previousStay : undefined,
      ravenwoodPortraitKey: portrait?.key,
      portraitLineage: portrait?.lineage,
      visualRace: portrait?.visualRace,
      roomId: room.id,
      stationRoomId: pick(["drawing-room", "library", "dining-room", "conservatory", "billiards-room", "smoking-room", "west-gallery"])
    }, usedNames, usedFirstNames, blockedFamilyNames);
    if (relatedAdult && familyLink === "Spouse") {
      relatedAdult.familyStatus = "Married";
      addMysteryFamilyNote(relatedAdult, `Spouse of ${fullName(npc)}`);
      addMysteryNpcRelationship(npcRelationships, relatedAdult, npc, "Marriage", `${fullName(relatedAdult)} and ${fullName(npc)} arrived as spouses.`, { trustImpact: 10, motiveRisk: 3 });
    } else if (relatedAdult && familyLink === "Sibling") {
      addMysteryFamilyNote(relatedAdult, `Sibling of ${fullName(npc)}`);
      addMysteryNpcRelationship(npcRelationships, relatedAdult, npc, "Family", `${fullName(relatedAdult)} and ${fullName(npc)} are siblings.`, { trustImpact: 8, motiveRisk: 2 });
    } else if (relatedAdult && familyLink === "Cousin") {
      addMysteryFamilyNote(relatedAdult, `Cousin of ${fullName(npc)}`);
      addMysteryNpcRelationship(npcRelationships, relatedAdult, npc, "Family", `${fullName(relatedAdult)} and ${fullName(npc)} are cousins.`, { trustImpact: 5, motiveRisk: 2 });
    } else if (relatedAdult && familyLink === "Adult child") {
      addMysteryFamilyNote(relatedAdult, `Parent of ${fullName(npc)}`);
      addMysteryNpcRelationship(npcRelationships, relatedAdult, npc, "Family", `${fullName(relatedAdult)} is parent to ${fullName(npc)}.`, { trustImpact: 9, motiveRisk: 3 });
    } else if (relatedAdult && familyLink === "Parent") {
      addMysteryFamilyNote(relatedAdult, `Adult child of ${fullName(npc)}`);
      addMysteryNpcRelationship(npcRelationships, relatedAdult, npc, "Family", `${fullName(npc)} is parent to ${fullName(relatedAdult)}.`, { trustImpact: 9, motiveRisk: 3 });
    }
    npcs.push(npc);
    adultGuests.push(npc);
    room.occupantIds.push(npc.id);
  }
  for (let index = 0; index < childCount; index += 1) {
    const childAge = rand(RAVENWOOD_MIN_NPC_AGE, 13);
    const plausibleGuardians = adultGuests.filter((guest) => guest.age >= childAge + 16);
    const guardian = pick(plausibleGuardians.length > 0 ? plausibleGuardians : adultGuests);
    const childRoom = guestRooms.find((room) => room.id === guardian.roomId) ?? pick(guestRooms.filter((room) => room.id !== playerRoom.id));
    if (!childRoom.occupantIds.includes(guardian.id)) moveNpcToRoom(guardian, childRoom);
    ensureChildCanStayWithAdult(childRoom);
    const childSex = nextResidentSex();
    const guardianRelation = mysteryChildGuardianRelation(childSex, childAge, guardian);
    const child = makeMysteryNpc({
      role: "Guest",
      sex: childSex,
      age: childAge,
      familyName: guardian.familyName,
      familyStatus: "Child",
      education: mysteryEducationFor(childAge, "Guest"),
      occupation: "Child guest",
      reasonOfStay: `Staying with ${guardianRelation.reasonRole} ${fullName(guardian)}`,
      familyRelationNote: `${titleCase(guardianRelation.childRelation)} ${fullName(guardian)}`,
      currentStay: guardian.currentStay,
      plannedStay: guardian.plannedStay,
      previousStay: guardian.previousStay,
      roomId: childRoom.id,
      stationRoomId: guardian.stationRoomId
    }, usedNames, usedFirstNames);
    const childPortrait = chooseRavenwoodGuestPortrait({
      sex: child.sex,
      age: child.age,
      usedPortraitKeys,
      visualRace: guardian.visualRace,
      lineage: guardian.sex === child.sex ? guardian.portraitLineage : undefined
    });
    child.ravenwoodPortraitKey = childPortrait?.key;
    child.portraitLineage = childPortrait?.lineage;
    child.visualRace = childPortrait?.visualRace ?? guardian.visualRace;
    addMysteryFamilyNote(guardian, `${titleCase(guardianRelation.guardianRelation)} ${fullName(child)}`);
    addMysteryNpcRelationship(npcRelationships, guardian, child, "Family", `${fullName(child)} is staying with ${guardianRelation.reasonRole} ${fullName(guardian)}.`, { trustImpact: 12, motiveRisk: 2 });
    npcs.push(child);
    childRoom.occupantIds.push(child.id);
  }
  for (let index = 0; index < staffCount; index += 1) {
    const stationRoomId = pick(staffStations);
    const sex = nextResidentSex();
    const age = rand(RAVENWOOD_MIN_STAFF_AGE, RAVENWOOD_MAX_NPC_AGE);
    const portrait = chooseRavenwoodStaffPortrait({ sex, age, usedPortraitKeys });
    const npc = makeMysteryNpc({
      role: "Staff",
      sex,
      age,
      ravenwoodPortraitKey: portrait?.key,
      portraitLineage: portrait?.lineage,
      visualRace: portrait?.visualRace,
      roomId: "servants-hall",
      stationRoomId
    }, usedNames, usedFirstNames, blockedFamilyNames);
    npcs.push(npc);
    rooms.find((room) => room.id === stationRoomId)?.occupantIds.push(npc.id);
  }
  buildMysteryNpcRelationshipPool(npcs, npcRelationships);
  assignMysteryGuestRooms(rooms, npcs, npcRelationships, playerRoom.id);
  const openingServant = npcs.find((npc) => npc.role === "Staff" && ["Butler", "Housekeeper", "Waiter", "Head waiter"].includes(npc.occupation)) ?? npcs.find((npc) => npc.role === "Staff");
  if (openingServant) {
    const oldStation = rooms.find((room) => room.id === openingServant.stationRoomId);
    if (oldStation) oldStation.occupantIds = oldStation.occupantIds.filter((id) => id !== openingServant.id);
    openingServant.stationRoomId = "grand-hall";
    const greatHall = rooms.find((room) => room.id === "grand-hall");
    if (greatHall && !greatHall.occupantIds.includes(openingServant.id)) greatHall.occupantIds.push(openingServant.id);
  }
  const murderCount = rand(1, 3);
  const murders: MysteryMurder[] = [];
  const deadNpcIds = new Set<string>();
  const previousKillerIds: string[] = [];
  let lastMurderDay = 2;
  for (let index = 0; index < murderCount; index += 1) {
    const livingNpcs = npcs.filter((npc) => !deadNpcIds.has(npc.id));
    const repeatKillerIds = previousKillerIds.filter((id) => !deadNpcIds.has(id));
    const killer = repeatKillerIds.length > 0 && roll(index === 1 ? 0.78 : 0.68)
      ? npcs.find((npc) => npc.id === pick(repeatKillerIds)) ?? pick(livingNpcs)
      : pick(livingNpcs);
    const victimPool = livingNpcs.filter((npc) => npc.id !== killer.id && !previousKillerIds.includes(npc.id));
    const fallbackVictimPool = livingNpcs.filter((npc) => npc.id !== killer.id);
    const victim = pick(victimPool.length > 0 ? victimPool : fallbackVictimPool);
    const day = index === 0 ? rand(2, 3) : rand(4, 13);
    lastMurderDay = Math.max(lastMurderDay, day);
    const method = pick(mysteryMethods);
    const room = pick(rooms.filter((candidate) => candidate.id !== playerRoom.id && (candidate.kind !== "guest" || candidate.accessible)));
    const motive = mysteryMotiveFor(killer, victim, npcs, npcRelationships);
    const proofs = mysteryProofsFor(method, motive, killer, victim, npcs, npcRelationships);
    murders.push({
      victimId: victim.id,
      killerId: killer.id,
      day: index === 0 ? day : Math.max(day, lastMurderDay),
      daytime: pick(["Evening", "Night", "Midnight", "Afternoon"] as Daytime[]),
      roomId: room.id,
      method,
      motive,
      proof: proofs[0],
      proofs,
      discovered: false
    });
    deadNpcIds.add(victim.id);
    previousKillerIds.push(killer.id);
  }
  murders.sort((a, b) => a.day === b.day ? daytimes.indexOf(a.daytime) - daytimes.indexOf(b.daytime) : a.day - b.day);
  const lockdownReason = pick(mysteryLockdownReasons);
  const mysteryId = uid();
  const inventory = [`key to ${playerRoom.name}`, "travel bag", "notebook", "pencil"];
  const mystery: MysteryGame = {
    id: mysteryId,
    title: "Ravenwood Murder Mystery",
    player: {
      id: uid(),
      firstName: playerFirstName,
      familyName: playerFamilyName,
      sex: playerInput.sex,
      origin: playerInput.origin,
      hairStyle: playerInput.hairStyle,
      hairColor: playerInput.hairColor,
      faceTrait: playerInput.faceTrait,
      age: playerAge,
      detectiveId: detectiveProfile?.id,
      detectiveQuirks: detectiveProfile?.quirks,
      ravenwoodPortraitKey: playerPortrait?.key,
      portraitLineage: playerPortrait?.lineage,
      visualRace: playerPortrait?.visualRace
    },
    day: 1,
    daytime: "Morning",
    rooms,
    npcs,
    npcRelationships,
    murders,
    currentRoomId: "grand-hall",
    playerRoomId: playerRoom.id,
    messages: [
      { id: uid(), speaker: "System", text: "Ravenwood prototype: investigate freely. Text advances time; risky actions use d12 rolls." },
      { id: uid(), speaker: "GM", text: `${playerFirstName} ${playerFamilyName} receives a brass key for ${playerRoom.name} in the Great Hall. ${openingServant ? `${openingServant.firstName} ${openingServant.familyName}, a ${openingServant.occupation.toLowerCase()}, waits nearby to answer the first questions. ` : ""}The host explains that ${lockdownReason}; no one is leaving Ravenwood Manor for the foreseeable future.` }
    ],
    journal: [],
    journalNotes: "",
    sanityLedger: [],
    discoveredProof: [],
    inventory,
    finished: false,
    won: false
  };
  return {
    ...mystery,
    sanityLedger: buildMysterySanityLedger(mystery)
  };
}

function petitionReady(story: Story): boolean {
  return story.player.birthStatus === "Bastard" && !story.player.legitimacySupport.petitioned && (story.player.legitimacySupport.royal >= 1 || story.player.legitimacySupport.noble >= story.player.legitimacySupport.requiredNoble);
}

function isCloseFamily(relation: Relation): boolean {
  return ["Mother", "Father", "Sibling", "Half Sibling", "Child", "Ward"].includes(relation.relation) || relation.isWard === true;
}

function relationCategory(story: Story, relation: Relation): RelationCategory {
  const familyIds = new Set(story.family.map((person) => person.id));
  if (relation.category === "family" || familyIds.has(relation.familyPersonId ?? relation.id)) return "family";
  if (relation.category) return relation.category;
  const palaceRelations = new Set([...courtRelations, ...servantRelations, "Court Contact", "Noble Acquaintance", "Suitor"]);
  if (palaceRelations.has(titleCase(relation.relation)) || relation.birthStatus === "Royal" || relation.birthStatus === "Noble") return "palace";
  return "city";
}

function successionCandidates(story: Story): Person[] {
  return story.family.filter((person) => (person.relation === "Child" || person.relation === "Ward") && person.alive);
}

function isRomanceEligible(story: Story, relation: Relation): boolean {
  return story.player.age >= 14 && relation.age >= 14 && relation.alive && !isCloseFamily(relation);
}

function isOppositeSex(story: Story, relation: Relation): boolean {
  return story.player.sex !== relation.sex;
}

function availableRelationActions(story: Story, relation: Relation): string[] {
  const actions = ["Talk", "Drink Together", "Fight", "Try to Learn Secret"];
  if (relation.allianceFormed) {
    actions.push("Influence to Kill", "Influence to Marry", "Influence to Lay With", "Influence to Talk To");
  } else {
    actions.push("Form Alliance");
  }
  const canConvinceLegitimacy =
    story.player.birthStatus === "Bastard" &&
    relation.birthStatus !== "Commoner" &&
    relation.relation !== "Mother" &&
    relation.relation !== "Father" &&
    !(relation.relation === "Sibling" && relation.isFullSibling);
  if (canConvinceLegitimacy && !relation.legitimacyConvinced) actions.push("Convince of Legitimacy");
  if (isRomanceEligible(story, relation)) {
    actions.push("Give Rose");
    if (isOppositeSex(story, relation) && !story.player.spouseId && !relation.spouseId) actions.push("Propose Marriage");
    if (story.player.sex === "Female" || relation.spouseId === story.player.id) actions.push("Lay With");
  }
  if (story.player.age >= 24 && relation.age <= 12 && !relation.isWard) actions.push("Take Ward");
  if (relation.isWard) actions.push("Abandon Ward");
  if (story.player.age > 12 && !relation.isWard) actions.push("Attempt to Kill");
  return actions;
}

function mayCreateChild(story: Story, relation: Relation): boolean {
  if (story.player.age < 14 || relation.age < 14) return false;
  if (!isOppositeSex(story, relation)) return false;
  if (story.player.sex === "Male" && relation.spouseId !== story.player.id) return false;
  const motherAge = story.player.sex === "Female" ? story.player.age : relation.age;
  if (motherAge > 48) return roll(0.01);
  const bloodBonus = story.player.bloodline !== "Common Blood" || relation.bloodline !== "Common Blood" ? 0.06 : 0;
  const marriageBonus = relation.spouseId === story.player.id ? 0.11 : 0;
  const ageFactor = motherAge >= 18 && motherAge <= 34 ? 0.16 : motherAge < 18 ? 0.08 : 0.07;
  return roll(ageFactor + bloodBonus + marriageBonus + story.player.fertility / 1000);
}

function currentPlaceFor(story: Story): string {
  return story.currentPlace ?? (story.player.birthStatus === "Royal" || story.player.birthStatus === "Noble" ? "palace halls" : "home");
}

function placeOpening(story: Story, place: string): string {
  const status = story.player.birthStatus.toLowerCase();
  const details: Record<string, string> = {
    "palace halls": "Banners lift in the high air. Every footstep has an audience, whether visible or hidden.",
    "throne room": "The throne room waits like a verdict, bright with ceremony and sharpened by silence.",
    "counsil room": "Maps, seals, and old grudges cover the council table.",
    "ball room": "Music and perfume drift beneath chandeliers; even a smile can be a political move.",
    "private chambers": "Curtains soften the light, but privacy in a castle is never complete.",
    chambers: "Curtains soften the light, but privacy in a castle is never complete.",
    home: "Home offers familiar shadows, useful tools, and the kind of quiet where trouble can knock.",
    "palace gardens": "Fountains murmur through rose-heavy paths, hiding conversations behind beauty.",
    market: "The market roars with coin, gossip, spices, and hands quick enough to matter.",
    "city gates": "The city gates breathe in travelers, guards, rumors, and road dust.",
    docks: "Salt air, ship bells, and wet rope fill the docks; news arrives here before it reaches court.",
    tavern: "Warm firelight and ale loosen tongues in the tavern.",
    forest: "The forest closes around the path, bright in places and watchful in others.",
    slums: "The slums lean close with hunger, bargaining, and doors that open only to the known.",
    sewers: "Water echoes under stone. Whatever moves down here prefers not to be named."
  };
  return `${story.player.firstName} is now in the ${titleCase(place)} as ${articleFor(story.player.birthStatus)} ${status}. ${details[place] ?? "The place waits to be explored."}`;
}

function choicesForPlace(place: string, activeScene?: ActiveScene | null): StoryChoice[] {
  if (activeScene?.type === "combat") {
    return [
      { id: "strike", label: "Strike", dc: 12, ability: "Strength" },
      { id: "guard", label: "Defend And Read The Enemy", dc: 11, ability: "Instinct" },
      { id: "flee", label: "Break Away", dc: 13, ability: "Instinct" }
    ];
  }
  if (activeScene?.type === "engagement") {
    return [
      { id: "press", label: "Press The Advantage", dc: 13, ability: "Honor" },
      { id: "listen", label: "Listen For The Hidden Truth", dc: 12, ability: "Instinct" },
      { id: "withdraw", label: "Withdraw Carefully", dc: 10, ability: "Honor" }
    ];
  }
  if (["slums", "sewers", "forest", "docks", "tavern"].includes(place)) {
    return [
      { id: "scout", label: "Scout The Area", dc: 11, ability: "Instinct" },
      { id: "approach", label: "Approach A Stranger", dc: 12, ability: "Honor" },
      { id: "force", label: "Force A Path", dc: 13, ability: "Strength" }
    ];
  }
  return [
    { id: "observe", label: "Observe The Room", dc: 10, ability: "Instinct" },
    { id: "speak", label: "Speak With Confidence", dc: 12, ability: "Honor" },
    { id: "search", label: "Search For Opportunity", dc: 11, ability: "Instinct" }
  ];
}

function abilityModifier(story: Story, ability: StoryChoice["ability"]): number {
  const score = ability === "Strength" ? story.player.strength : ability === "Honor" ? story.player.honor : Math.round((story.player.honor + story.player.happiness) / 2);
  return Math.floor((score - 50) / 12);
}

function d20Check(story: Story, choice: StoryChoice): { total: number; die: number; modifier: number; success: boolean; label: string } {
  const die = rand(1, 20);
  const modifier = abilityModifier(story, choice.ability);
  const total = die + modifier;
  return {
    die,
    modifier,
    total,
    success: total >= choice.dc,
    label: `d20 ${die}${modifier >= 0 ? "+" : ""}${modifier} = ${total} vs DC ${choice.dc}`
  };
}

function shouldStartDanger(place: string, success: boolean): boolean {
  if (success) return false;
  if (place === "sewers" || place === "slums") return roll(0.45);
  if (place === "forest" || place === "docks" || place === "tavern") return roll(0.28);
  return roll(0.12);
}

function choiceOutcome(story: Story, choice: StoryChoice, result: ReturnType<typeof d20Check>): { text: string; scene?: ActiveScene | null; healthDelta: number; honorDelta: number; happinessDelta: number } {
  const place = currentPlaceFor(story);
  if (story.activeScene?.type === "combat") {
    if (result.success || choice.id === "flee") {
      return {
        text: result.success
          ? `${choice.label} works. The danger breaks, leaving ${story.player.firstName} breathing hard but alive.`
          : `${story.player.firstName} escapes badly, trading dignity for distance.`,
        scene: null,
        healthDelta: result.success ? 0 : -4,
        honorDelta: choice.id === "flee" ? -2 : 2,
        happinessDelta: result.success ? 1 : -2
      };
    }
    return {
      text: `${choice.label} fails. The threat presses closer and pain answers the mistake.`,
      scene: { ...story.activeScene, roundsLeft: Math.max(1, story.activeScene.roundsLeft - 1) },
      healthDelta: -7,
      honorDelta: -1,
      happinessDelta: -3
    };
  }
  const danger = shouldStartDanger(place, result.success);
  if (danger) {
    return {
      text: `${choice.label} goes wrong. A hostile figure steps from the ${titleCase(place)} and the scene turns dangerous.`,
      scene: { type: "combat", title: `Danger in the ${titleCase(place)}`, roundsLeft: 3 },
      healthDelta: -2,
      honorDelta: -1,
      happinessDelta: -2
    };
  }
  if (result.success) {
    return {
      text: `${choice.label} succeeds. The ${titleCase(place)} gives up a useful thread: a name, a route, or a rumor worth following.`,
      scene: roll(0.18) ? { type: "engagement", title: `A choice sharpens in the ${titleCase(place)}`, roundsLeft: 2 } : null,
      healthDelta: 0,
      honorDelta: choice.ability === "Honor" ? 2 : 0,
      happinessDelta: 2
    };
  }
  return {
    text: `${choice.label} fails softly. Nothing disastrous happens, but the ${titleCase(place)} remains guarded.`,
    healthDelta: 0,
    honorDelta: -1,
    happinessDelta: -1
  };
}

function createPendingBirth(story: Story, relation: Relation): PendingBirth {
  const twinChance = 0.018 + (story.player.bloodline !== "Common Blood" || relation.bloodline !== "Common Blood" ? 0.025 : 0);
  const babyCount = roll(twinChance) ? 2 : 1;
  const babySexes = Array.from({ length: babyCount }, () => pick<Sex>(["Female", "Male"]));
  const defaultNames = babySexes.map(() => pick(childNames));
  const mother = story.player.sex === "Female" ? story.player.firstName : relation.firstName;
  return {
    id: uid(),
    parentRelationId: relation.id,
    babyCount,
    babySexes,
    defaultNames,
    message: `${mother} has given birth to ${babyCount === 2 ? "twins" : "a child"}. Name ${babyCount === 2 ? "them" : "the baby"} before the court invents names of its own.`
  };
}

function playerDeathCause(story: Story, nextAge: number): string | null {
  if (nextAge >= 100) return "old age after an impossibly long life";
  if (nextAge >= 70 && roll(Math.min(0.04 + (nextAge - 70) * 0.035, 0.85))) return pick(["old age", "winter fever", "a failing heart", "a quiet final sleep"]);
  if (story.player.health <= 5) return pick(["wounds left untended", "a wasting illness", "fever after a dangerous year"]);
  if (story.player.health < 20 && roll(0.18)) return pick(["illness", "blood fever", "an old wound reopening"]);
  if (story.player.honor < 18 && story.player.birthStatus !== "Commoner" && roll(0.06)) return "court poison after too many enemies learned patience";
  if ((story.placeUses.sewers ?? 0) > 0 && story.player.health < 45 && roll(0.04)) return "sewer fever";
  return null;
}

function oldAgeDeathCause(nextAge: number): string | null {
  if (nextAge >= 100) return "old age";
  if (nextAge >= 70 && roll(Math.min(0.035 + (nextAge - 70) * 0.033, 0.82))) return pick(["old age", "winter fever", "a failing heart"]);
  return null;
}

function relationDeathCause(_relation: Relation, nextAge: number): string | null {
  return oldAgeDeathCause(nextAge);
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("menu");
  const [themeName, setThemeName] = useState<ThemeName>("dark");
  const [draft, setDraft] = useState<CharacterDraft>(initialDraft);
  const [stories, setStories] = useState<Story[]>([]);
  const [activeStoryId, setActiveStoryId] = useState<string | null>(null);
  const [mysteries, setMysteries] = useState<MysteryGame[]>([]);
  const [activeMysteryId, setActiveMysteryId] = useState<string | null>(null);
  const [selectedMysteryDetectiveId, setSelectedMysteryDetectiveId] = useState(ravenwoodDetectiveProfiles[0].id);
  const [selectedMysteryDetectiveAge, setSelectedMysteryDetectiveAge] = useState(24);
  const [treeZoom, setTreeZoom] = useState(1);
  const [babyNames, setBabyNames] = useState<string[]>([]);
  const [influenceTargets, setInfluenceTargets] = useState<Record<string, string>>({});
  const [focusedRelationId, setFocusedRelationId] = useState<string | null>(null);
  const [focusedMysteryNpcId, setFocusedMysteryNpcId] = useState<string | null>(null);
  const [draggingRelationId, setDraggingRelationId] = useState<string | null>(null);
  const [draggingPossession, setDraggingPossession] = useState<string | null>(null);
  const [draggingMysteryItem, setDraggingMysteryItem] = useState<string | null>(null);
  const [storyInput, setStoryInput] = useState("");
  const [mysteryInput, setMysteryInput] = useState("");
  const [treeViewportWidth, setTreeViewportWidth] = useState(0);
  const familyTreeRef = useRef<ScrollView | null>(null);
  const C = themes[themeName];
  const activeStory = useMemo(() => stories.find((story) => story.id === activeStoryId) ?? null, [activeStoryId, stories]);
  const activeMystery = useMemo(() => mysteries.find((mystery) => mystery.id === activeMysteryId) ?? null, [activeMysteryId, mysteries]);
  const selectedMysteryDetective = useMemo(
    () => ravenwoodDetectiveProfiles.find((profile) => profile.id === selectedMysteryDetectiveId) ?? ravenwoodDetectiveProfiles[0],
    [selectedMysteryDetectiveId]
  );

  useEffect(() => {
    if (screen !== "family" || !activeStory || treeViewportWidth <= 0) return;
    const x = Math.max(0, (FAMILY_TREE_CANVAS_WIDTH - treeViewportWidth) / 2);
    const timer = setTimeout(() => {
      familyTreeRef.current?.scrollTo({ x, y: 0, animated: false });
    }, 80);
    return () => clearTimeout(timer);
  }, [screen, activeStory?.id, treeViewportWidth]);

  function patchDraft(next: Partial<CharacterDraft>) {
    setDraft((current) => ({ ...current, ...next }));
  }

  function chooseBirthStatus(birthStatus: BirthStatus) {
    const availableClothes = clothingOptionsFor(birthStatus, draft.sex);
    const availableColors = clothColorOptionsFor(birthStatus);
    patchDraft({
      birthStatus,
      clothing: availableClothes.includes(draft.clothing) ? draft.clothing : availableClothes[0],
      clothColor: availableColors.includes(draft.clothColor) ? draft.clothColor : availableColors[0]
    });
  }

  function chooseSex(sex: Sex) {
    const availableClothes = clothingOptionsFor(draft.birthStatus, sex);
    patchDraft({
      sex,
      clothing: availableClothes.includes(draft.clothing) ? draft.clothing : availableClothes[0]
    });
  }

  function startStory() {
    const visibleBastardSigns = draft.birthStatus === "Bastard" && roll(0.42);
    const legitimacyDoubt = draft.birthStatus === "Bastard" ? rand(25, 70) + (visibleBastardSigns ? 18 : 0) : 0;
    const usedNames = new Set<string>();
    const playerFamilyName = draft.familyName.trim() || pick(familyNames);
    const playerFirstName = uniqueNameFor(playerFamilyName, usedNames, draft.firstName.trim() || pick(firstNames));
    const player = {
      ...draft,
      id: uid(),
      firstName: playerFirstName,
      familyName: playerFamilyName,
      age: draft.startAge,
      alive: true,
      health: 70,
      happiness: 55,
      strength: 55,
      honor: 50,
      gold: initialGold(draft.birthStatus),
      possessions: initialPossessions(draft.birthStatus),
      possessionValues: {},
      visibleBastardSigns,
      legitimacyDoubt,
      fertility: rand(38, 78) + (draft.bloodline === "Witch Blood" || draft.bloodline === "Child of Atlantis" ? 8 : 0),
      labourLimit: rand(3, 5),
      legitimacySupport: { noble: 0, royal: 0, requiredNoble: rand(3, 5), petitioned: false },
      memory: []
    };
    const startingFamily = normalizeUniqueNames(buildStartingFamily(player), usedNames);
    const mother = startingFamily.find((person) => person.relation === "Mother");
    if (player.birthStatus === "Bastard" && mother) {
      player.familyName = mother.familyName;
      const finalPlayerKey = fullName(player).toLowerCase();
      if (usedNames.has(finalPlayerKey)) player.firstName = uniqueNameFor(player.familyName, usedNames, player.firstName);
      else usedNames.add(finalPlayerKey);
    }
    player.possessionValues = possessionValueMap(player.possessions, player.birthStatus);
    const royalBuild = buildRoyalFamily(player, startingFamily, usedNames);
    const family = royalBuild.family;
    const royalFamily = royalBuild.royalFamily;
    const relations = normalizeNewRelationNames(buildStartingRelations(player, family), usedNames);
    const firstLines = [
      `${player.firstName} ${player.familyName} began this year as ${articleFor(player.birthStatus)} ${player.birthStatus.toLowerCase()} of ${player.bloodline}, dressed in ${player.clothColor.toLowerCase()} ${player.clothing.toLowerCase()}.`,
      player.birthStatus === "Bastard"
        ? `The noble father was not written openly into every prayer, but the family tree knows: the claim begins in noble blood.${player.visibleBastardSigns ? ` The ${bastardSuspicionFeature(player)} makes denial harder, and danger sharper.` : " The face gives useful room for denial."}`
        : `${player.birthStatus} parentage gives ${player.firstName} a place in the halls, and a target on the back.`
    ];
    const story: Story = {
      id: uid(),
      title: `${player.familyName} Chronicle`,
      player,
      family,
      royalFamily,
      relations,
      currentYear: player.age,
      currentPlace: draft.birthStatus === "Royal" || draft.birthStatus === "Noble" ? "palace halls" : "home",
      storyMessages: [
        { id: uid(), speaker: "System", text: "Prototype GM: lightweight 5e-style d20 checks are active. Write freely or choose a crossroad below." },
        { id: uid(), speaker: "GM", text: firstLines.join(" ") }
      ],
      storyChoices: choicesForPlace(draft.birthStatus === "Royal" || draft.birthStatus === "Noble" ? "palace halls" : "home"),
      activeScene: null,
      yearLog: [
        {
          year: player.age,
          lines: firstLines
        }
      ],
      placeUses: {},
      milestones: [],
      pendingBirth: null,
      outerPolitics: [
        "The Marcher princes test the border roads with patrols and polite letters.",
        "Merchants report higher tariffs at the southern ports."
      ],
      innerPolitics: [
        "The court watches the royal succession closely.",
        "Servants whisper that one council seat may soon change hands."
      ],
      finished: false
    };
    setStories((current) => [story, ...current]);
    setActiveStoryId(story.id);
    setScreen("chronicle");
  }

  function patchActive(mutator: (story: Story) => Story) {
    setStories((current) => current.map((story) => (story.id === activeStoryId ? mutator(story) : story)));
  }

  function chooseMysteryDetective(profileId: string) {
    setSelectedMysteryDetectiveId(profileId);
    setSelectedMysteryDetectiveAge(24);
  }

  function confirmMysteryDetective() {
    setSelectedMysteryDetectiveAge(24);
    setScreen("mysteryPortraitSelect");
  }

  function startMystery() {
    const mystery = createMysteryGameFromDraft(draft, selectedMysteryDetective, selectedMysteryDetectiveAge);
    setMysteries((current) => [mystery, ...current]);
    setActiveMysteryId(mystery.id);
    setMysteryInput("");
    setScreen("mystery");
  }

  function patchMystery(mutator: (mystery: MysteryGame) => MysteryGame) {
    setMysteries((current) => current.map((mystery) => (mystery.id === activeMysteryId ? mutator(mystery) : mystery)));
  }

  function mysteryRoomName(mystery: MysteryGame, roomId: string): string {
    return mystery.rooms.find((room) => room.id === roomId)?.name ?? titleCase(roomId.replace(/-/g, " "));
  }

  function mysteryNpcName(mystery: MysteryGame, npcId: string): string {
    const npc = mystery.npcs.find((candidate) => candidate.id === npcId);
    return npc ? fullName(npc) : "Unknown";
  }

  function readableMysterySecret(secret: string): string {
    return secret
      .replace(/secretly changed room keys before arrival/gi, "requested a room change at arrival")
      .replace(/secretly changed room keys/gi, "requested a room change")
      .replace(/changed room keys before arrival/gi, "requested a room change at arrival");
  }

  function mysteryPeopleInRoom(mystery: MysteryGame, roomId: string) {
    const mealTime = mystery.daytime === "Breakfast" || mystery.daytime === "Lunch";
    const mealAttendees = new Set(
      mystery.npcs
        .filter((npc) => npc.alive && mealTime && stableHash(`${mystery.id}-${mystery.day}-${mystery.daytime}-${npc.id}`) % 100 < (npc.role === "Guest" ? 82 : 35))
        .map((npc) => npc.id)
    );
    const people = [];
    if (roomId === mystery.currentRoomId) {
      people.push({
        id: mystery.player.id,
        firstName: mystery.player.firstName,
        familyName: mystery.player.familyName,
        sex: mystery.player.sex,
        age: mysteryPlayerAge(mystery.player),
        ravenwoodPortraitKey: mystery.player.ravenwoodPortraitKey,
        portraitLineage: mystery.player.portraitLineage,
        visualRace: mystery.player.visualRace,
        alive: true
      });
    }
    people.push(...mystery.npcs.filter((npc) => {
      if (mealTime && mealAttendees.has(npc.id)) return roomId === "dining-room";
      return (npc.role === "Guest" ? npc.roomId : npc.stationRoomId) === roomId;
    }));
    return people;
  }

  function nextMysteryTime(day: number, daytime: Daytime): { day: number; daytime: Daytime } {
    const index = daytimes.indexOf(daytime);
    if (index >= daytimes.length - 1) return { day: day + 1, daytime: "Morning" };
    return { day, daytime: daytimes[index + 1] };
  }

  function mysteryCheckKindForText(text: string): MysteryCheckKind | undefined {
    const lower = text.toLowerCase();
    if (lower.match(/\b(flirt|romance|romantic|kiss|date|dance|seduce|wink|blush)\b/)) return "Rizz";
    if (lower.match(/\b(pickpocket|palm|steal|snatch|plant|lockpick|pick the lock|unlock|sleight|conceal)\b/)) return "Sleight of Hand";
    if (lower.match(/\b(sneak|hide|follow|tail|shadow|slip past|crawl|quiet|eavesdrop)\b/)) return "Stealth";
    if (lower.match(/\b(lie|bluff|deceive|trick|mislead|pretend|fake|cover story|disguise)\b/)) return "Deception";
    if (lower.match(/\b(persuade|convince|promise|negotiate|reason|plead|appeal|argue)\b/)) return "Persuasion";
    if (lower.match(/\b(charm|command|impress|confidence|talk|greet|socialize|speak|ask|question|interview|accuse|arrest)\b/)) return "Charisma";
    if (lower.match(/\b(body|corpse|blood|death|dead|wound|poison|illness|medicine|medical|doctor|examine|heal|treat)\b/)) return "Medicine";
    if (lower.match(/\b(history|remember|recall|archive|record|ledger|family tree|lineage|antique|old story|date|guest book)\b/)) return "History";
    if (lower.match(/\b(search|investigate|proof|evidence|listen|inspect|study|look|read|trace|clue|find)\b/)) return "Search";
    if (lower.match(/\b(fear|panic|storm|midnight|wait|watch|endure|calm|pressure|threat|threaten)\b/)) return "Composure";
    if (lower.match(/\b(force|attack|kill|fight|break|push|strike|shove|shoot|stab|run|chase|climb|carry|jump|swim|athletic)\b/)) return "Athletics";
    return undefined;
  }

  function mysteryQuirkModifierFor(quirks: MysteryDetectiveQuirk[] | undefined, check: MysteryCheckKind): number {
    const total = (quirks ?? [])
      .filter((quirk) => quirk.check === check)
      .reduce((total, quirk) => total + quirk.modifier, 0);
    return clamp(total, -3, 3);
  }

  function mysteryRoll(text: string, mystery: MysteryGame): string | undefined {
    const check = mysteryCheckKindForText(text);
    if (!check) return undefined;
    const die = rand(1, 12);
    const quirkModifier = mysteryQuirkModifierFor(mystery.player.detectiveQuirks, check);
    const result = die + quirkModifier;
    const quirkText = quirkModifier === 0 ? "" : " with detective trait";
    return `Roll: ${check} d12 ${die}${quirkText} = ${result}`;
  }

  function appendMysteryJournal(journal: StoryMessage[], archived: StoryMessage[]): StoryMessage[] {
    const existingIds = new Set(journal.map((message) => message.id));
    return [...journal, ...archived.filter((message) => !existingIds.has(message.id))].slice(-120);
  }

  function splitMysteryMessages(messages: StoryMessage[]): { visible: StoryMessage[]; archived: StoryMessage[] } {
    return {
      visible: messages.slice(-5),
      archived: messages.slice(0, Math.max(0, messages.length - 5))
    };
  }

  function mysteryDialogueColor(npc: MysteryNpc, mystery?: MysteryGame): string {
    if (npc.role === "Staff") return "#b8b9bd";
    const guestColors = [
      "#f0c45c", "#7ed7d1", "#d99bff", "#8fb7ff", "#f195a7",
      "#9fd984", "#ffbf80", "#c7a7ff", "#81c7f5", "#e6d06f",
      "#f58fd6", "#90e0a8", "#e5a66f", "#b9d47a", "#9fd0ff",
      "#d8a1a7", "#ace2dd", "#e7c37d", "#bca8ff", "#f2a089"
    ];
    const guestIndex = mystery
      ? mystery.npcs.filter((candidate) => candidate.role === "Guest").findIndex((candidate) => candidate.id === npc.id)
      : -1;
    return guestColors[(guestIndex >= 0 ? guestIndex : stableHash(npc.id)) % guestColors.length];
  }

  function mysteryNpcSegments(text: string, mystery: MysteryGame): StoryMessageSegment[] {
    const names = mystery.npcs
      .map((npc) => ({ npc, name: fullName(npc) }))
      .sort((a, b) => b.name.length - a.name.length);
    const segments: StoryMessageSegment[] = [];
    let remaining = text;
    while (remaining.length > 0) {
      const hit = names
        .map(({ npc, name }) => {
          const index = remaining.toLowerCase().indexOf(name.toLowerCase());
          return index >= 0 ? { npc, name, index } : null;
        })
        .filter(Boolean)
        .sort((a, b) => (a?.index ?? 0) - (b?.index ?? 0))[0];
      if (!hit) {
        segments.push({ text: remaining });
        break;
      }
      if (hit.index > 0) segments.push({ text: remaining.slice(0, hit.index) });
      segments.push({ text: remaining.slice(hit.index, hit.index + hit.name.length), npcId: hit.npc.id, color: mysteryDialogueColor(hit.npc, mystery) });
      remaining = remaining.slice(hit.index + hit.name.length);
    }
    return segments;
  }

  function mysteryRoomMood(room: MysteryRoom): string {
    const moods: Record<string, string> = {
      "grand-hall": "polished floors, cold brass, and too many listening corners make the hall feel formal and unsafe",
      "drawing-room": "soft chairs and low conversation make every pause feel deliberate",
      "dining-room": "silverware waits beside cooling coffee, and the room smells faintly of toast and nerves",
      library: "dust, leather, and locked cabinets press close around the reading lamps",
      conservatory: "wet leaves tap the glass while the storm makes the plants whisper",
      "billiards-room": "green baize and cigar smoke hide small gestures badly",
      "smoking-room": "the air is stale with ash, brandy, and decisions made in private",
      "west-gallery": "portraits stare down from the walls as if keeping their own account"
    };
    if (room.kind === "guest") return "a neat private room holds luggage, folded linen, and the quiet panic of interrupted plans";
    if (room.kind === "staff") return "work sounds carry through the narrow passage, quick footsteps and lowered voices";
    if (room.kind === "service") return "service clutter turns the space practical, cramped, and easy to overlook";
    return moods[room.id] ?? "the room settles around you with small sounds and watchful shadows";
  }

  function mysteryRoomDescription(mystery: MysteryGame, roomId: string): StoryMessage {
    const room = mystery.rooms.find((candidate) => candidate.id === roomId);
    const people = mysteryPeopleInRoom(mystery, roomId).filter((person) => person.id !== mystery.player.id) as MysteryNpc[];
    const visiblePeople = people.slice(0, 4);
    const extra = people.length > visiblePeople.length ? ` and ${people.length - visiblePeople.length} more` : "";
    const text = room
      ? `You enter the ${room.name}: ${mysteryRoomMood(room)}. ${visiblePeople.length > 0 ? `${visiblePeople.map(fullName).join(", ")}${extra} ${visiblePeople.length === 1 ? "is" : "are"} here.` : "No resident is openly present."}`
      : `You pause, unsure where Ravenwood has led you.`;
    return { id: uid(), speaker: "GM", text, rich: mysteryNpcSegments(text, mystery) };
  }

  function detectMysteryRoomIntent(text: string, mystery: MysteryGame): MysteryRoom | undefined {
    const lower = text.toLowerCase();
    if (!lower.match(/\b(go|walk|move|head|enter|leave|return|visit|switch|travel)\b/)) return undefined;
    return mystery.rooms
      .filter((room) => room.accessible)
      .sort((a, b) => b.name.length - a.name.length)
      .find((room) => lower.includes(room.name.toLowerCase()) || lower.includes(room.id.replace(/-/g, " ")));
  }

  function mysterySpeechIntent(text: string): boolean {
    return /\b(i|he|she|they|we)\s+(say|says|ask|asks|tell|tells|reply|replies|whisper|whispers|shout|shouts)\b/i.test(text)
      || /["“”]/.test(text);
  }

  function mysteryAttitudeFor(npc: MysteryNpc, mystery: MysteryGame): string {
    const relationRisk = mystery.npcRelationships
      .filter((relationship) => relationship.fromId === npc.id || relationship.toId === npc.id)
      .reduce((total, relationship) => total + relationship.motiveRisk + relationship.trustImpact, 0);
    if (!npc.alive) return "can no longer answer";
    if (npc.trust >= 15) return "seems willing to help, though not without fear";
    if (relationRisk > 18) return "looks cornered by private obligations";
    if (npc.trust <= 6) return "keeps their expression carefully shut";
    return "answers with cautious politeness";
  }

  function mysteryDialogueMessage(text: string, mystery: MysteryGame, namedNpc?: MysteryNpc): StoryMessage {
    const roomPeople = mysteryPeopleInRoom(mystery, mystery.currentRoomId).filter((person) => person.id !== mystery.player.id) as MysteryNpc[];
    const npc = namedNpc ?? roomPeople[0];
    if (!npc) {
      const line = `Your words fall into the ${mysteryRoomName(mystery, mystery.currentRoomId)} without an answer; no resident is close enough to reply.`;
      return { id: uid(), speaker: "GM", text: line, rich: mysteryNpcSegments(line, mystery) };
    }
    const relationship = mystery.npcRelationships.find((item) => item.fromId === npc.id || item.toId === npc.id);
    const proofMention = mystery.discoveredProof.find((proof) => proof.toLowerCase().includes(npc.firstName.toLowerCase()) || proof.toLowerCase().includes(npc.familyName.toLowerCase()));
    const answer = proofMention
      ? `I know what that proof suggests. Ask me carefully, and I may remember who stood close enough to plant it.`
      : relationship && npc.trust > 10
        ? `I heard something connected to ${relationship.kind.toLowerCase()}, but I will not say it loudly here.`
        : npc.trust > 12
          ? `I can answer, but Ravenwood has taught me to choose every word twice.`
          : `That is a bold question for someone I barely know.`;
    const intro = `${fullName(npc)} ${mysteryAttitudeFor(npc, mystery)}. `;
    return {
      id: uid(),
      speaker: "GM",
      text: `${intro}"${answer}"`,
      rich: [
        { text: fullName(npc), npcId: npc.id, color: mysteryDialogueColor(npc, mystery) },
        { text: ` ${mysteryAttitudeFor(npc, mystery)}. ` },
        { text: `"${answer}"`, color: mysteryDialogueColor(npc, mystery) }
      ]
    };
  }

  function submitMysteryInput() {
    if (!activeMystery || activeMystery.finished) return;
    const text = mysteryInput.trim().slice(0, 500);
    if (!text) return;
    patchMystery((mystery) => {
      const nextTime = nextMysteryTime(mystery.day, mystery.daytime);
      const lower = text.toLowerCase();
      const rollText = mysteryRoll(text, mystery);
      const namedSuspect = mystery.npcs.find((npc) => lower.includes(npc.firstName.toLowerCase()) || lower.includes(fullName(npc).toLowerCase()));
      const suspectMurders = namedSuspect ? mystery.murders.filter((murder) => murder.killerId === namedSuspect.id) : [];
      const suspectProofs = suspectMurders.flatMap((murder) => murder.proofs?.length ? murder.proofs : [murder.proof]);
      const movementRoom = detectMysteryRoomIntent(text, mystery);
      let currentRoom = movementRoom?.id ?? mystery.currentRoomId;
      const messages: StoryMessage[] = [
        { id: uid(), speaker: "Player", text }
      ];
      let journal = [...mystery.journal];
      let npcs = mystery.npcs;
      let murders = mystery.murders;
      let discoveredProof = [...mystery.discoveredProof];
      let finished = false;
      let won = false;
      let summary = mystery.summary;
      let lossPending = mystery.lossPending;
      const ledgerLines = [
        `Turn: Day ${mystery.day} ${mystery.daytime}, ${mysteryRoomName(mystery, mystery.currentRoomId)}. Player wrote: "${text}". Next clock: Day ${nextTime.day} ${nextTime.daytime}.`
      ];
      if (movementRoom && movementRoom.id !== mystery.currentRoomId) {
        messages.push(mysteryRoomDescription({ ...mystery, currentRoomId: currentRoom }, currentRoom));
        ledgerLines.push(`Typed movement: ${mystery.player.firstName} moved from ${mysteryRoomName(mystery, mystery.currentRoomId)} to ${movementRoom.name}.`);
      }

      const dueMurders = murders.filter((murder) => !murder.discovered && (murder.day < nextTime.day || (murder.day === nextTime.day && daytimes.indexOf(murder.daytime) <= daytimes.indexOf(nextTime.daytime))));
      if (dueMurders.length > 0) {
        const murder = dueMurders[0];
        murders = murders.map((candidate) => candidate === murder ? { ...candidate, discovered: true } : candidate);
        npcs = npcs.map((npc) => npc.id === murder.victimId ? { ...npc, alive: false } : npc);
        messages.push({ id: uid(), speaker: "GM", text: `${mysteryNpcName(mystery, murder.victimId)} is found dead in the ${mysteryRoomName(mystery, murder.roomId)}. The method appears to be ${murder.method}.` });
        ledgerLines.push(`Murder discovered: victim ${mysteryNpcName(mystery, murder.victimId)}; killer ${mysteryNpcName(mystery, murder.killerId)}; room ${mysteryRoomName(mystery, murder.roomId)}; method ${murder.method}. Victim marked dead.`);
      } else if (lower.includes("search") || lower.includes("investigate") || lower.includes("proof") || lower.includes("evidence")) {
        const matchingMurder = murders.find((murder) => murder.discovered && murder.roomId === currentRoom && (murder.proofs?.length ? murder.proofs : [murder.proof]).some((proof) => !discoveredProof.includes(proof)));
        const foundProof = matchingMurder ? (matchingMurder.proofs?.length ? matchingMurder.proofs : [matchingMurder.proof]).find((proof) => !discoveredProof.includes(proof)) : undefined;
        if (matchingMurder && foundProof) {
          discoveredProof.push(foundProof);
          messages.push({ id: uid(), speaker: "GM", text: `You find proof: ${foundProof}. It points toward ${mysteryNpcName(mystery, matchingMurder.killerId)} if you can connect it cleanly.`, roll: rollText });
          ledgerLines.push(`Proof discovered in ${mysteryRoomName(mystery, currentRoom)}: ${foundProof}. Linked killer: ${mysteryNpcName(mystery, matchingMurder.killerId)}.`);
        } else {
          messages.push({ id: uid(), speaker: "GM", text: `You press the ${mysteryRoomName(mystery, currentRoom)} for answers. Dust, etiquette, and old money resist you.`, roll: rollText });
          ledgerLines.push(`Search/investigation found no new proof in ${mysteryRoomName(mystery, currentRoom)}.${rollText ? ` ${rollText}.` : ""}`);
        }
      } else if ((lower.includes("accuse") || lower.includes("arrest")) && namedSuspect && suspectMurders.length > 0) {
        if (discoveredProof.some((proof) => suspectProofs.includes(proof))) {
          finished = true;
          won = true;
          summary = `${mystery.player.firstName} proved ${fullName(namedSuspect)} was tied to the Ravenwood murders.`;
          messages.push({ id: uid(), speaker: "GM", text: `${fullName(namedSuspect)} breaks under the weight of proof. The arrest is made before midnight can claim another name.`, roll: rollText });
          ledgerLines.push(`Win by arrest: accused ${fullName(namedSuspect)} with matching proof. Case finished.`);
        } else {
          messages.push({ id: uid(), speaker: "GM", text: `${fullName(namedSuspect)} smiles at the accusation. Without proof, the room turns against you.`, roll: rollText });
          ledgerLines.push(`Failed accusation: ${fullName(namedSuspect)} is a real killer but no discovered proof matched yet.${rollText ? ` ${rollText}.` : ""}`);
        }
      } else if ((lower.includes("kill") || lower.includes("attack") || lower.includes("shoot") || lower.includes("stab")) && namedSuspect && suspectMurders.length > 0) {
        finished = true;
        won = true;
        summary = `${mystery.player.firstName} killed ${fullName(namedSuspect)} and ended the murders.`;
        npcs = npcs.map((npc) => npc.id === namedSuspect.id ? { ...npc, alive: false } : npc);
        messages.push({ id: uid(), speaker: "GM", text: `${fullName(namedSuspect)} dies before the house can protect them. It is not clean justice, but Ravenwood survives.`, roll: rollText });
        ledgerLines.push(`Win by killing culprit: ${fullName(namedSuspect)} marked dead. Case finished.${rollText ? ` ${rollText}.` : ""}`);
      } else if (movementRoom && movementRoom.id !== mystery.currentRoomId) {
        ledgerLines.push(`Room description shown for ${movementRoom.name}.`);
      } else if (mysterySpeechIntent(text)) {
        const dialogue = mysteryDialogueMessage(text, { ...mystery, currentRoomId: currentRoom, npcs, discoveredProof }, namedSuspect);
        messages.push({ ...dialogue, roll: rollText });
        ledgerLines.push(`Dialogue resolved in ${mysteryRoomName(mystery, currentRoom)}${namedSuspect ? ` with ${fullName(namedSuspect)}` : ""}.${rollText ? ` ${rollText}.` : ""}`);
      } else {
        const room = mysteryRoomName(mystery, currentRoom);
        const people = mysteryPeopleInRoom({ ...mystery, currentRoomId: currentRoom, npcs }, currentRoom).filter((person) => person.id !== mystery.player.id) as MysteryNpc[];
        const knownProof = discoveredProof.length > 0 ? ` You are carrying ${discoveredProof.length} piece${discoveredProof.length === 1 ? "" : "s"} of proof, so careless questions may change who trusts you.` : "";
        const nearby = people.length > 0 ? ` ${fullName(people[0])} is close enough to notice your interest.` : " No one nearby openly reacts.";
        const line = `The ${room} answers in small details: ${mysteryRoomMood(mystery.rooms.find((candidate) => candidate.id === currentRoom) ?? { id: currentRoom, name: room, floor: 1, kind: "public", accessible: true, occupantIds: [] })}.${nearby}${knownProof}`;
        messages.push({ id: uid(), speaker: "GM", text: line, roll: rollText, rich: mysteryNpcSegments(line, { ...mystery, npcs }) });
        ledgerLines.push(`Free action resolved in ${room}.${rollText ? ` ${rollText}.` : ""}`);
      }

      if (!finished && (nextTime.day > 13 || (mystery.day === 13 && mystery.daytime === "Midnight"))) {
        finished = true;
        won = false;
        lossPending = true;
        summary = `${mystery.player.firstName} failed to solve Ravenwood before the thirteenth midnight.`;
        messages.push({ id: uid(), speaker: "GM", text: "The thirteenth midnight passes. The killer remains free." });
        ledgerLines.push("Loss triggered: thirteenth midnight passed with no solved case.");
      } else if (!finished && (nextTime.daytime === "Breakfast" || nextTime.daytime === "Lunch")) {
        messages.push({ id: uid(), speaker: "System", text: `Most guests drift toward the Dining Room for ${nextTime.daytime.toLowerCase()}. The map reflects who is likely present there now.` });
        ledgerLines.push(`${nextTime.daytime} gathering triggered; dining room attendance recalculated by deterministic hash.`);
      }

      const splitMessages = splitMysteryMessages([...mystery.messages, ...messages]);
      journal = appendMysteryJournal(journal, splitMessages.archived);

      return {
        ...mystery,
        day: nextTime.day,
        daytime: nextTime.daytime,
        currentRoomId: currentRoom,
        messages: splitMessages.visible,
        journal,
        sanityLedger: [...(mystery.sanityLedger ?? []), ...ledgerLines].slice(-600),
        npcs,
        murders,
        discoveredProof,
        finished,
        won,
        summary,
        lossPending
      };
    });
    setMysteryInput("");
  }

  function visitMysteryRoom(roomId: string) {
    if (!activeMystery || activeMystery.finished) return;
    const room = activeMystery.rooms.find((candidate) => candidate.id === roomId);
    if (!room?.accessible) return;
    patchMystery((mystery) => {
      const splitMessages = splitMysteryMessages([...mystery.messages, mysteryRoomDescription({ ...mystery, currentRoomId: roomId }, roomId)]);
      return {
        ...mystery,
        currentRoomId: roomId,
        messages: splitMessages.visible,
        journal: appendMysteryJournal(mystery.journal, splitMessages.archived),
        sanityLedger: [...(mystery.sanityLedger ?? []), `Move: Day ${mystery.day} ${mystery.daytime}; ${mystery.player.firstName} moved from ${mysteryRoomName(mystery, mystery.currentRoomId)} to ${room.name}.`].slice(-600)
      };
    });
  }

  function closeMysteryLoss() {
    if (!activeMystery) return;
    patchMystery((mystery) => ({ ...mystery, lossPending: false }));
    setScreen("menu");
  }

  function addLine(line: string) {
    patchActive((story) => {
      const yearLog = [...story.yearLog];
      const latest = yearLog[yearLog.length - 1];
      if (!latest) return story;
      yearLog[yearLog.length - 1] = { ...latest, lines: [...latest.lines, line] };
      return { ...story, yearLog };
    });
  }

  function pushStoryMessages(story: Story, messages: StoryMessage[]): StoryMessage[] {
    return [...(story.storyMessages ?? []), ...messages].slice(-60);
  }

  function focusRelationFromTree(personId: string) {
    if (!activeStory?.relations.some((relation) => relation.id === personId || relation.familyPersonId === personId)) return;
    setFocusedRelationId(personId);
    setScreen("relationships");
  }

  function focusMysteryNpc(npcId: string) {
    if (!activeMystery?.npcs.some((npc) => npc.id === npcId)) return;
    setFocusedMysteryNpcId(npcId);
    setScreen("mysteryRelations");
  }

  function relationCardColors(relation: Relation) {
    const backgroundColor = relation.sex === "Male" ? "rgba(74, 144, 226, 0.16)" : "rgba(216, 99, 137, 0.16)";
    return { backgroundColor, ...rankFrameFor(relation.birthStatus) };
  }

  function rankFrameFor(status: BirthStatus) {
    if (status === "Royal") {
      return { borderColor: C.gold, borderWidth: 4, shadowColor: C.gold, shadowOpacity: 0.55, shadowRadius: 12, shadowOffset: { width: 0, height: 0 }, elevation: 7 };
    }
    if (status === "Noble") {
      return { borderColor: C.silver, borderWidth: 3, shadowColor: C.silver, shadowOpacity: 0.42, shadowRadius: 10, shadowOffset: { width: 0, height: 0 }, elevation: 5 };
    }
    return { borderColor: C.line, borderWidth: 1, shadowOpacity: 0, shadowRadius: 0, elevation: 0 };
  }

  function moveRelationWithinCategory(relationId: string, direction: -1 | 1) {
    patchActive((story) => {
      const relation = story.relations.find((candidate) => candidate.id === relationId);
      if (!relation) return story;
      const category = relationCategory(story, relation);
      const categoryRelations = story.relations.filter((candidate) => relationCategory(story, candidate) === category);
      const categoryIndex = categoryRelations.findIndex((candidate) => candidate.id === relationId);
      const neighbor = categoryRelations[categoryIndex + direction];
      if (!neighbor) return story;
      const relations = [...story.relations];
      const fromIndex = relations.findIndex((candidate) => candidate.id === relationId);
      const toIndex = relations.findIndex((candidate) => candidate.id === neighbor.id);
      [relations[fromIndex], relations[toIndex]] = [relations[toIndex], relations[fromIndex]];
      return { ...story, relations };
    });
  }

  function dropRelationOn(targetId: string) {
    if (!draggingRelationId || draggingRelationId === targetId) {
      setDraggingRelationId(null);
      return;
    }
    patchActive((story) => {
      const dragged = story.relations.find((relation) => relation.id === draggingRelationId);
      const target = story.relations.find((relation) => relation.id === targetId);
      if (!dragged || !target || relationCategory(story, dragged) !== relationCategory(story, target)) return story;
      const withoutDragged = story.relations.filter((relation) => relation.id !== draggingRelationId);
      const targetIndex = withoutDragged.findIndex((relation) => relation.id === targetId);
      const relations = [...withoutDragged.slice(0, targetIndex), dragged, ...withoutDragged.slice(targetIndex)];
      return { ...story, relations };
    });
    setDraggingRelationId(null);
  }

  function visit(place: string) {
    if (!activeStory || activeStory.finished || !activeStory.player.alive || activeStory.awaitingSuccession) return;
    const currentPlace = currentPlaceFor(activeStory);
    if (activeStory.activeScene && currentPlace !== place) {
      addLine(`${activeStory.player.firstName} cannot leave the ${currentPlace} while ${activeStory.activeScene.title.toLowerCase()} is unresolved.`);
      return;
    }

    const encounter = Math.random() < encounterChance(activeStory.player.birthStatus, place);
    const newRelation = encounter ? normalizeNewRelationNames([createRelationFromPlace(activeStory, place)], usedNamesForStory(activeStory))[0] : null;
    const line = describePlaceVisit(activeStory, place, (activeStory.placeUses[place] ?? 0) + 1, newRelation);
    const opening = placeOpening(activeStory, place);

    patchActive((story) => ({
      ...story,
      currentPlace: place,
      storyMessages: pushStoryMessages(story, [
        { id: uid(), speaker: "GM", text: opening },
        { id: uid(), speaker: "GM", text: line }
      ]),
      storyChoices: choicesForPlace(place, story.activeScene),
      player: {
        ...story.player,
        happiness: clamp(story.player.happiness + (place === "private chambers" || place === "home" ? 3 : 1), 0, 100),
        strength: place === "forest" || place === "sewers" ? clamp(story.player.strength + 1, 0, 100) : story.player.strength,
        honor: place === "slums" ? clamp(story.player.honor - 1, 0, 100) : story.player.honor
      },
      relations: newRelation ? [newRelation, ...story.relations] : story.relations,
      placeUses: { ...story.placeUses, [place]: (story.placeUses[place] ?? 0) + 1 }
    }));
  }

  function chooseStoryChoice(choice: StoryChoice) {
    if (!activeStory || activeStory.finished || !activeStory.player.alive || activeStory.awaitingSuccession) return;
    const result = d20Check(activeStory, choice);
    const outcome = choiceOutcome(activeStory, choice, result);
    patchActive((story) => {
      const nextScene = outcome.scene === undefined ? story.activeScene : outcome.scene;
      return {
        ...story,
        activeScene: nextScene,
        storyChoices: choicesForPlace(currentPlaceFor(story), nextScene),
        player: {
          ...story.player,
          health: clamp(story.player.health + outcome.healthDelta, 0, 100),
          honor: clamp(story.player.honor + outcome.honorDelta, 0, 100),
          happiness: clamp(story.player.happiness + outcome.happinessDelta, 0, 100)
        },
        storyMessages: pushStoryMessages(story, [
          { id: uid(), speaker: "Player", text: choice.label },
          { id: uid(), speaker: "GM", text: outcome.text, roll: result.label }
        ])
      };
    });
  }

  function submitStoryInput() {
    if (!activeStory || activeStory.finished || !activeStory.player.alive || activeStory.awaitingSuccession) return;
    const text = storyInput.trim().slice(0, 500);
    if (!text) return;
    const freeChoice: StoryChoice = {
      id: "free",
      label: "Free Action",
      dc: activeStory.activeScene ? 13 : 11,
      ability: text.toLowerCase().match(/hit|fight|force|break|push|attack/) ? "Strength" : text.toLowerCase().match(/convince|command|promise|honor|truth/) ? "Honor" : "Instinct"
    };
    const result = d20Check(activeStory, freeChoice);
    const outcome = choiceOutcome(activeStory, { ...freeChoice, label: text }, result);
    patchActive((story) => {
      const nextScene = outcome.scene === undefined ? story.activeScene : outcome.scene;
      return {
        ...story,
        activeScene: nextScene,
        storyChoices: choicesForPlace(currentPlaceFor(story), nextScene),
        player: {
          ...story.player,
          health: clamp(story.player.health + outcome.healthDelta, 0, 100),
          honor: clamp(story.player.honor + outcome.honorDelta, 0, 100),
          happiness: clamp(story.player.happiness + outcome.happinessDelta, 0, 100)
        },
        storyMessages: pushStoryMessages(story, [
          { id: uid(), speaker: "Player", text },
          { id: uid(), speaker: "GM", text: outcome.text, roll: result.label }
        ])
      };
    });
    setStoryInput("");
  }

  function labour() {
    if (!activeStory || activeStory.finished || !activeStory.player.alive || activeStory.awaitingSuccession || !["Bastard", "Commoner"].includes(activeStory.player.birthStatus)) return;
    const used = activeStory.placeUses.labour ?? 0;
    if (used >= activeStory.player.labourLimit) {
      addLine(`${activeStory.player.firstName} has no strength left for more paid labour this year.`);
      return;
    }
    const earned = activeStory.player.birthStatus === "Bastard" ? rand(7, 24) : rand(5, 18);
    const line = `${activeStory.player.firstName} took labour for coin, earning ${earned} gold and a little honest exhaustion.`;
    patchActive((story) => ({
      ...story,
      player: {
        ...story.player,
        gold: story.player.gold + earned,
        health: clamp(story.player.health - 2, 0, 100),
        strength: clamp(story.player.strength + 1, 0, 100),
        happiness: clamp(story.player.happiness - 1, 0, 100),
        memory: [...story.player.memory, line].slice(-40)
      },
      placeUses: { ...story.placeUses, labour: used + 1 }
    }));
    addLine(line);
  }

  function changePossession(item: string, action: "Sell" | "Abandon") {
    if (!activeStory) return;
    const value = action === "Sell" ? activeStory.player.possessionValues[item] ?? possessionWorth(item, activeStory.player.birthStatus) : 0;
    const line =
      action === "Sell"
        ? `${activeStory.player.firstName} sold ${item} for ${value} gold.`
        : `${activeStory.player.firstName} abandoned ${item}; some things are lighter when left behind.`;
    patchActive((story) => ({
      ...story,
      player: {
        ...story.player,
        gold: story.player.gold + value,
        possessions: story.player.possessions.filter((possession) => possession !== item),
        possessionValues: Object.fromEntries(Object.entries(story.player.possessionValues).filter(([possession]) => possession !== item)),
        memory: [...story.player.memory, line].slice(-40)
      }
    }));
    addLine(line);
  }

  function movePossession(item: string, direction: -1 | 1) {
    patchActive((story) => {
      const index = story.player.possessions.indexOf(item);
      const nextIndex = index + direction;
      if (index < 0 || nextIndex < 0 || nextIndex >= story.player.possessions.length) return story;
      const possessions = [...story.player.possessions];
      [possessions[index], possessions[nextIndex]] = [possessions[nextIndex], possessions[index]];
      return { ...story, player: { ...story.player, possessions } };
    });
  }

  function dropPossessionOn(targetItem: string) {
    if (!draggingPossession || draggingPossession === targetItem) {
      setDraggingPossession(null);
      return;
    }
    patchActive((story) => {
      const possessions = story.player.possessions;
      const draggedIndex = possessions.indexOf(draggingPossession);
      const targetIndex = possessions.indexOf(targetItem);
      if (draggedIndex < 0 || targetIndex < 0) return story;
      const next = possessions.filter((item) => item !== draggingPossession);
      next.splice(targetIndex, 0, draggingPossession);
      return { ...story, player: { ...story.player, possessions: next } };
    });
    setDraggingPossession(null);
  }

  function changeMysteryInventory(item: string, action: "Abandon") {
    if (!activeMystery || action !== "Abandon") return;
    patchMystery((mystery) => {
      const splitMessages = splitMysteryMessages([...mystery.messages, { id: uid(), speaker: "GM" as const, text: `${mystery.player.firstName} abandons ${item}.` }]);
      return {
        ...mystery,
        inventory: mystery.inventory.filter((inventoryItem) => inventoryItem !== item),
        messages: splitMessages.visible,
        journal: appendMysteryJournal(mystery.journal, splitMessages.archived)
      };
    });
  }

  function moveMysteryInventory(item: string, direction: -1 | 1) {
    patchMystery((mystery) => {
      const index = mystery.inventory.indexOf(item);
      const nextIndex = index + direction;
      if (index < 0 || nextIndex < 0 || nextIndex >= mystery.inventory.length) return mystery;
      const inventory = [...mystery.inventory];
      [inventory[index], inventory[nextIndex]] = [inventory[nextIndex], inventory[index]];
      return { ...mystery, inventory };
    });
  }

  function dropMysteryInventoryOn(targetItem: string) {
    if (!draggingMysteryItem || draggingMysteryItem === targetItem) {
      setDraggingMysteryItem(null);
      return;
    }
    patchMystery((mystery) => {
      const draggedIndex = mystery.inventory.indexOf(draggingMysteryItem);
      const targetIndex = mystery.inventory.indexOf(targetItem);
      if (draggedIndex < 0 || targetIndex < 0) return mystery;
      const inventory = mystery.inventory.filter((item) => item !== draggingMysteryItem);
      inventory.splice(targetIndex, 0, draggingMysteryItem);
      return { ...mystery, inventory };
    });
    setDraggingMysteryItem(null);
  }

  function petitionForLegitimacy() {
    if (!activeStory || !activeStory.player.alive || activeStory.awaitingSuccession || !petitionReady(activeStory)) return;
    const nobleParent = activeStory.family.find((person) => (person.relation === "Father" || person.relation === "Mother") && (person.birthStatus === "Royal" || person.birthStatus === "Noble"));
    const targetStatus: BirthStatus = nobleParent?.birthStatus === "Royal" ? "Royal" : "Noble";
    const supportScore = activeStory.player.legitimacySupport.royal * 45 + activeStory.player.legitimacySupport.noble * 15 + activeStory.player.honor + rand(-20, 25);
    const success = supportScore >= 95;
    const line = success
      ? `${activeStory.player.firstName} petitioned for legitimacy and won. The stain of bastardy was rewritten into ${targetStatus.toLowerCase()} standing.`
      : `${activeStory.player.firstName} petitioned for legitimacy and failed. The great houses closed ranks and smiled coldly.`;
    patchActive((story) => ({
      ...story,
      player: {
        ...story.player,
        birthStatus: success ? targetStatus : story.player.birthStatus,
        legitimacyDoubt: success ? 0 : clamp(story.player.legitimacyDoubt + 18, 0, 100),
        legitimacySupport: { ...story.player.legitimacySupport, petitioned: true },
        honor: success ? clamp(story.player.honor + 10, 0, 100) : clamp(story.player.honor - 8, 0, 100),
        memory: [...story.player.memory, line].slice(-40)
      },
      relations: story.relations.map((relation) =>
        !success && (relation.birthStatus === "Royal" || relation.birthStatus === "Noble")
          ? { ...relation, trust: clamp(relation.trust - 20, 0, 100), note: `${relation.firstName} withdrew warmth after the failed petition.` }
          : relation
      )
    }));
    addLine(line);
  }

  function interact(relationId: string, action: string) {
    if (!activeStory || !activeStory.player.alive || activeStory.awaitingSuccession) return;
    const relation = activeStory.relations.find((candidate) => candidate.id === relationId);
    if (!relation) return;
    const used = relation.actionUses[action] ?? 0;
    if (used >= relation.actionLimit) {
      addLine(`${relation.firstName} has no more patience for ${action.toLowerCase()} this year.`);
      return;
    }

    let line = `${activeStory.player.firstName} spent time with ${relation.firstName}.`;
    const delta = { trust: 0, romance: 0, resentment: 0, health: 0, happiness: 0, honor: 0 };
    let spouseId: string | undefined = activeStory.player.spouseId;
    let relationSpouseId: string | undefined = relation.spouseId;
    let wardPerson: Person | null = null;
    let removeWardPersonId: string | undefined;
    let pendingBirth: PendingBirth | null = null;
    let killedRelationId: string | undefined;

    if (action === "Talk") {
      delta.trust = 8;
      delta.happiness = 2;
      line = `${activeStory.player.firstName} spoke with ${relation.firstName}; ${relation.relation.toLowerCase()} became a little less like a title and more like a bond.`;
    } else if (action === "Drink Together") {
      delta.trust = 6;
      delta.happiness = 4;
      line = `${activeStory.player.firstName} drank with ${relation.firstName}, and laughter made room for dangerous honesty.`;
    } else if (action === "Fight") {
      delta.trust = -12;
      delta.resentment = 10;
      delta.health = -4;
      line = `${activeStory.player.firstName} came to blows with ${relation.firstName}; bruises answered where words had failed.`;
    } else if (action === "Give Rose") {
      delta.romance = 12;
      delta.trust = 3;
      line = `${activeStory.player.firstName} offered ${relation.firstName} a rose, and the gesture did not go unnoticed.`;
    } else if (action === "Try to Learn Secret") {
      delta.trust = -2;
      line = `${activeStory.player.firstName} watched ${relation.firstName}'s silences carefully and drew near to a secret.`;
    } else if (action === "Attempt to Kill") {
      const killScore = activeStory.player.strength + (100 - relation.trust) + relation.resentment + rand(-55, 35);
      const success = killScore >= 105;
      delta.honor = success ? -18 : -10;
      delta.happiness = success ? -6 : -3;
      delta.trust = success ? 0 : -28;
      delta.resentment = success ? 0 : 22;
      delta.health = success ? (roll(0.35) ? -5 : 0) : -8;
      if (success) {
        killedRelationId = relation.id;
        line = `${activeStory.player.firstName} attempted to kill ${relation.firstName} ${relation.familyName}, and the attempt succeeded. Blood now sits inside the chronicle.`;
      } else {
        line = `${activeStory.player.firstName} attempted to kill ${relation.firstName} ${relation.familyName}, but the attempt failed. Suspicion and danger moved closer.`;
      }
    } else if (action === "Form Alliance") {
      delta.trust = 10;
      delta.honor = 3;
      line = `${activeStory.player.firstName} and ${relation.firstName} bound themselves to common cause.`;
    } else if (action.startsWith("Influence to")) {
      const targetId = influenceTargets[relationId];
      const target = activeStory.relations.find((candidate) => candidate.id === targetId);
      if (!target) {
        addLine(`${activeStory.player.firstName} needs to choose who ${relation.firstName} should influence first.`);
        return;
      }
      delta.trust = 3;
      const command = action.replace("Influence to ", "").toLowerCase();
      line = `${activeStory.player.firstName} asked ${relation.firstName} to influence ${target.firstName} ${target.familyName} to ${command}. The alliance now has teeth.`;
    } else if (action === "Convince of Legitimacy") {
      delta.trust = activeStory.player.visibleBastardSigns ? 7 : 11;
      delta.honor = 4;
      line = `${activeStory.player.firstName} pressed ${relation.firstName} to see the blood, not the insult. The claim sounded ${activeStory.player.visibleBastardSigns ? "dangerous because it was visible" : "carefully plausible"}.`;
    } else if (action === "Propose Marriage") {
      if (!isOppositeSex(activeStory, relation)) {
        addLine(`${activeStory.player.firstName} cannot initiate marriage with ${relation.firstName}; marriage is limited to male and female pairs in this prototype.`);
        return;
      }
      const acceptance = relation.trust + relation.romance + activeStory.player.honor - relation.resentment + rand(-20, 25);
      if (acceptance >= 95 && !activeStory.player.spouseId && !relation.spouseId) {
        spouseId = relation.id;
        relationSpouseId = activeStory.player.id;
        delta.trust = 12;
        delta.romance = 18;
        line = `${relation.firstName} accepted the proposal. The match now binds love, blood, and politics together.`;
      } else {
        delta.resentment = 5;
        delta.romance = -4;
        line = `${relation.firstName} refused the proposal for now. The court will remember the question almost as sharply as the answer.`;
      }
    } else if (action === "Lay With") {
      delta.romance = relation.isWard ? -20 : 9;
      delta.trust = relation.isWard ? -20 : 1;
      line = relation.isWard
        ? `${activeStory.player.firstName} stopped before crossing a sacred line. A ward is family by duty, not a lover.`
        : `${activeStory.player.firstName} and ${relation.firstName} shared a night that may echo beyond the bedchamber.`;
      if (!relation.isWard && mayCreateChild(activeStory, relation)) {
        pendingBirth = createPendingBirth(activeStory, relation);
        setBabyNames(pendingBirth.defaultNames);
        line = `${line} By year's end, a child cry will join the chronicle.`;
      }
    } else if (action === "Take Ward") {
      wardPerson = makePerson({
        id: relation.id,
        firstName: relation.firstName,
        familyName: relation.familyName,
        sex: relation.sex,
        relation: "Ward",
        age: relation.age,
        birthStatus: relation.birthStatus,
        bloodline: relation.bloodline,
        origin: relation.origin,
        parentIds: [activeStory.player.id],
        isWard: true,
        memory: [`Taken as ${activeStory.player.firstName}'s ward at age ${relation.age}.`]
      });
      delta.trust = 16;
      delta.romance = -100;
      line = `${activeStory.player.firstName} took ${relation.firstName} as a ward. The child now belongs to the family tree by duty.`;
    } else if (action === "Abandon Ward") {
      removeWardPersonId = relation.familyPersonId ?? relation.id;
      delta.trust = -35;
      delta.resentment = 25;
      line = `${activeStory.player.firstName} abandoned ${relation.firstName} as a ward. Trust broke loudly, even if the hall stayed quiet.`;
    }

    patchActive((story) => ({
      ...story,
      player: {
        ...story.player,
        health: clamp(story.player.health + delta.health, 0, 100),
        happiness: clamp(story.player.happiness + delta.happiness, 0, 100),
        honor: clamp(story.player.honor + delta.honor, 0, 100),
        spouseId,
        legitimacyDoubt: action === "Convince of Legitimacy" ? clamp(story.player.legitimacyDoubt - (activeStory.player.visibleBastardSigns ? 4 : 7), 0, 100) : story.player.legitimacyDoubt,
        legitimacySupport:
          action === "Convince of Legitimacy" && !relation.legitimacyConvinced
            ? {
                ...story.player.legitimacySupport,
                noble: relation.birthStatus === "Noble" ? story.player.legitimacySupport.noble + 1 : story.player.legitimacySupport.noble,
                royal: relation.birthStatus === "Royal" ? story.player.legitimacySupport.royal + 1 : story.player.legitimacySupport.royal
              }
            : story.player.legitimacySupport,
        memory: [...story.player.memory, line].slice(-40)
      },
      family: [
        ...story.family
          .filter((person) => person.id !== removeWardPersonId)
          .map((person) => (killedRelationId && (person.id === killedRelationId || person.id === relation.familyPersonId) ? { ...person, alive: false, memory: [...(person.memory ?? []), line].slice(-20) } : person)),
        ...(wardPerson ? [wardPerson] : [])
      ],
      relations: story.relations.map((candidate) =>
        candidate.id === relationId
          ? {
              ...candidate,
              trust: clamp(candidate.trust + delta.trust, 0, 100),
              romance: clamp(candidate.romance + delta.romance, 0, 100),
              resentment: clamp(candidate.resentment + delta.resentment, 0, 100),
              alive: killedRelationId === candidate.id ? false : candidate.alive,
              spouseId: relationSpouseId,
              isWard: action === "Take Ward" ? true : action === "Abandon Ward" ? false : candidate.isWard,
              allianceFormed: action === "Form Alliance" ? true : candidate.allianceFormed,
              legitimacyConvinced: action === "Convince of Legitimacy" ? true : candidate.legitimacyConvinced,
              familyPersonId: action === "Take Ward" ? relation.id : action === "Abandon Ward" ? undefined : candidate.familyPersonId,
              actionUses: { ...candidate.actionUses, [action]: used + 1 },
              memory: [...candidate.memory, line].slice(-20),
              note: killedRelationId === candidate.id ? `${candidate.firstName} died after an attempted killing.` : line
            }
          : candidate
      ),
      pendingBirth: pendingBirth ?? story.pendingBirth
    }));
    addLine(line);
  }

  function ageUp() {
    patchActive((story) => {
      const nextYear = story.currentYear + 1;
      const age = story.player.age + 1;
      const playerCause = playerDeathCause(story, age);
      const deathRoll = playerCause !== null;
      const player = {
        ...story.player,
        age,
        health: clamp(story.player.health - (age > 55 ? 2 : 0), 0, 100),
        alive: deathRoll ? false : story.player.alive,
        causeOfDeath: playerCause ?? story.player.causeOfDeath
      };
      const relationUpdates = story.relations.map((relation) => {
        if (!relation.alive) return { relation: { ...relation, actionUses: {} }, line: null as string | null };
        const aged = relation.age + 1;
        const deathCause = relationDeathCause(relation, aged);
        if (deathCause) {
          const line = `${relation.firstName} ${relation.familyName} died of ${deathCause} at age ${aged}.`;
          return {
            relation: { ...relation, age: aged, alive: false, actionUses: {}, memory: [...relation.memory, line].slice(-20), note: line },
            line: null
          };
        }
        return {
          relation: {
            ...relation,
            age: aged,
            actionUses: {}
          },
          line: null
        };
      });
      const backgroundLines = relationUpdates.map((item) => item.line).filter((line): line is string => Boolean(line)).slice(0, 5);
      const lines = player.alive ? backgroundLines : [...backgroundLines, `${player.firstName} died of ${player.causeOfDeath}.`];
      const familyUpdates = story.family.map((person) => {
        const matchingRelation = relationUpdates.find((item) => item.relation.familyPersonId === person.id || item.relation.id === person.id)?.relation;
        return {
          ...person,
          age: person.alive ? person.age + 1 : person.age,
          alive: matchingRelation ? matchingRelation.alive : person.alive,
          memory: matchingRelation ? matchingRelation.memory : person.memory
        };
      });
      return {
        ...story,
        currentYear: nextYear,
        player,
        family: familyUpdates,
        royalFamily: story.royalFamily.map((person) => {
          if (person.id === story.player.id) return { ...person, age: player.age, alive: player.alive };
          const matchingFamily = familyUpdates.find((familyPerson) => familyPerson.id === person.id);
          if (matchingFamily) return { ...person, age: matchingFamily.age, alive: matchingFamily.alive };
          const nextAge = person.alive ? person.age + 1 : person.age;
          const deathCause = person.alive ? oldAgeDeathCause(nextAge) : null;
          const line = deathCause ? `${person.firstName} ${person.familyName} died of ${deathCause} at age ${nextAge}.` : null;
          return {
            ...person,
            age: nextAge,
            alive: deathCause ? false : person.alive,
            memory: line ? [...(person.memory ?? []), line].slice(-20) : person.memory
          };
        }),
        relations: relationUpdates.map((item) => item.relation),
        placeUses: {},
        finished: !player.alive && successionCandidates({ ...story, player, family: familyUpdates }).length === 0,
        awaitingSuccession: !player.alive && successionCandidates({ ...story, player, family: familyUpdates }).length > 0,
        summary: !player.alive && successionCandidates({ ...story, player, family: familyUpdates }).length === 0 ? `${player.firstName} ${player.familyName} died at age ${age} after ${story.yearLog.length} recorded years.` : story.summary,
        yearLog: [...story.yearLog, { year: nextYear, lines }]
      };
    });
  }

  function continueAsSuccessor(successorId: string) {
    if (!activeStory) return;
    patchActive((story) => {
      const successor = successionCandidates(story).find((person) => person.id === successorId);
      if (!successor) return story;
      const matchingRelation = story.relations.find((relation) => relation.id === successor.id || relation.familyPersonId === successor.id);
      const oldPlayer = story.player;
      const formerPlayerPerson = makePerson({
        id: oldPlayer.id,
        firstName: oldPlayer.firstName,
        familyName: oldPlayer.familyName,
        sex: oldPlayer.sex,
        relation: successor.isWard ? "Guardian" : oldPlayer.sex === "Female" ? "Mother" : "Father",
        age: oldPlayer.age,
        birthStatus: oldPlayer.birthStatus,
        bloodline: oldPlayer.bloodline,
        origin: oldPlayer.origin,
        parentIds: [],
        spouseId: oldPlayer.spouseId,
        alive: false,
        memory: [...oldPlayer.memory, `Died of ${oldPlayer.causeOfDeath ?? "unknown causes"} in year ${story.currentYear}.`].slice(-20)
      });
      const inheritedPossessions = [...oldPlayer.possessions];
      const successorPlayer: Story["player"] = {
        id: successor.id,
        firstName: successor.firstName,
        familyName: successor.familyName,
        sex: successor.sex,
        birthStatus: successor.birthStatus,
        bloodline: successor.bloodline,
        startAge: successor.age,
        origin: successor.origin ?? matchingRelation?.origin ?? pick(origins),
        hairStyle: pick(hairStyles),
        hairColor: pick(hairColors),
        faceTrait: pick(faceTraits),
        clothing: clothingOptionsFor(successor.birthStatus, successor.sex)[0],
        clothColor: clothColorOptionsFor(successor.birthStatus)[0],
        age: successor.age,
        alive: true,
        health: clamp(72 - Math.max(0, successor.age - 40), 35, 100),
        happiness: 48,
        strength: clamp(35 + Math.floor(successor.age / 2), 15, 85),
        honor: story.player.honor,
        gold: story.player.gold,
        possessions: inheritedPossessions,
        possessionValues: { ...story.player.possessionValues },
        spouseId: matchingRelation?.spouseId,
        visibleBastardSigns: successor.visibleBastardSigns ?? false,
        legitimacyDoubt: successor.birthStatus === "Bastard" ? rand(20, 60) : 0,
        fertility: rand(38, 78) + (successor.bloodline === "Witch Blood" || successor.bloodline === "Child of Atlantis" ? 8 : 0),
        labourLimit: rand(3, 5),
        legitimacySupport: { noble: 0, royal: 0, requiredNoble: rand(3, 5), petitioned: false },
        memory: [`Continued the chronicle after ${oldPlayer.firstName} ${oldPlayer.familyName}'s death.`]
      };
      const line = `${successor.firstName} ${successor.familyName} took up the chronicle after ${oldPlayer.firstName}'s death.`;
      const yearLog = [...story.yearLog];
      const latest = yearLog[yearLog.length - 1];
      if (latest) yearLog[yearLog.length - 1] = { ...latest, lines: [...latest.lines, line] };
      return {
        ...story,
        player: successorPlayer,
        family: [
          formerPlayerPerson,
          ...story.family
            .filter((person) => person.id !== successor.id && person.id !== oldPlayer.id)
            .map((person) => person.parentIds.includes(oldPlayer.id) ? { ...person, relation: person.relation === "Child" ? "Sibling" : person.relation } : person)
        ],
        royalFamily: story.royalFamily.map((person) => {
          if (person.id === oldPlayer.id) return { ...person, alive: false, age: oldPlayer.age };
          if (person.id === successor.id) return { ...person, relation: "You", age: successor.age, alive: true };
          return person;
        }),
        relations: [
          relationFromPerson(formerPlayerPerson),
          ...story.relations.filter((relation) => relation.id !== successor.id && relation.familyPersonId !== successor.id)
        ],
        awaitingSuccession: false,
        finished: false,
        summary: undefined,
        yearLog
      };
    });
    setFocusedRelationId(null);
    setScreen("chronicle");
  }

  function removeStory(storyId: string) {
    setStories((current) => current.filter((story) => story.id !== storyId));
    if (activeStoryId === storyId) setActiveStoryId(null);
  }

  function removeMystery(mysteryId: string) {
    setMysteries((current) => current.filter((mystery) => mystery.id !== mysteryId));
    if (activeMysteryId === mysteryId) setActiveMysteryId(null);
  }

  function nameBabies() {
    if (!activeStory?.pendingBirth) return;
    const pending = activeStory.pendingBirth;
    patchActive((story) => {
      const otherParent = pending.parentRelationId ? story.relations.find((relation) => relation.id === pending.parentRelationId) : undefined;
      const usedNames = usedNamesForStory(story);
      const parentsMarried = otherParent?.spouseId === story.player.id || story.player.spouseId === otherParent?.id;
      const motherFamilyName = story.player.sex === "Female" ? story.player.familyName : otherParent?.familyName ?? story.player.familyName;
      const motherOrigin = story.player.sex === "Female" ? story.player.origin : otherParent?.origin ?? story.player.origin;
      const childFamilyName = parentsMarried ? story.player.familyName : motherFamilyName;
      const babies = Array.from({ length: pending.babyCount }, (_, index) =>
        makePerson({
          firstName: uniqueNameFor(childFamilyName, usedNames, babyNames[index]?.trim() || pending.defaultNames[index] || pick(childNames)),
          familyName: childFamilyName,
          sex: pending.babySexes[index],
          age: 0,
          relation: "Child",
          birthStatus: story.player.birthStatus === "Royal" || otherParent?.birthStatus === "Royal" ? "Royal" : story.player.birthStatus === "Noble" || otherParent?.birthStatus === "Noble" ? "Noble" : story.player.birthStatus === "Bastard" ? "Bastard" : "Commoner",
          bloodline: pick([story.player.bloodline, otherParent?.bloodline ?? "Common Blood"]),
          origin: motherOrigin,
          parentIds: [story.player.id, ...(otherParent ? [otherParent.id] : [])],
          memory: [`Born in year ${story.currentYear}.`]
        })
      );
      const line = `${babies.map((baby) => baby.firstName).join(pending.babyCount === 2 ? " and " : "")} joined the family tree as ${pending.babyCount === 2 ? "newborn twins" : "a newborn child"}.`;
      const yearLog = [...story.yearLog];
      const latest = yearLog[yearLog.length - 1];
      yearLog[yearLog.length - 1] = { ...latest, lines: [...latest.lines, line] };
      return {
        ...story,
        family: [...story.family, ...babies],
        relations: [
          ...babies.map((baby) => createKnownRelation({ ...baby, relation: "Child", trust: 90, note: "Newborn child of the player.", familyPersonId: baby.id })),
          ...story.relations
        ],
        pendingBirth: null,
        yearLog
      };
    });
    setBabyNames([]);
  }

  function Shell({ children, menuBackground = false }: { children: React.ReactNode; menuBackground?: boolean }) {
    const showMysteryBottomMenu = Boolean(activeMystery && ["mystery", "mysteryCharacter", "mysteryRelations", "mysteryMap", "mysteryJournal"].includes(screen));
    const content = (
      <SafeAreaView style={[styles.safe, { backgroundColor: menuBackground ? "transparent" : C.bg }]}>
        <StatusBar barStyle={themeName === "dark" ? "light-content" : "dark-content"} />
        <ScrollView style={styles.scroll} contentContainerStyle={[styles.container, menuBackground && styles.menuContainer, showMysteryBottomMenu && styles.fixedBottomContent]}>
          {children}
        </ScrollView>
        {showMysteryBottomMenu ? (
          <View style={[styles.fixedBottomMenu, { backgroundColor: C.bg }]}>
            <MysteryBottomMenu />
          </View>
        ) : null}
        {activeStory?.pendingBirth ? (
          <Modal visible transparent animationType="fade">
            <View style={styles.modalShade}>
              <View style={[styles.modalCard, { backgroundColor: C.panel, borderColor: C.line }]}>
                <Text style={[styles.heading, { color: C.text }]}>A Child Is Born</Text>
                <Text style={[styles.body, { color: C.text }]}>{activeStory.pendingBirth.message}</Text>
                {activeStory.pendingBirth.defaultNames.map((name, index) => (
                  <Field
                    key={`${activeStory.pendingBirth?.id}-${index}`}
                    label={activeStory.pendingBirth?.babySexes[index] ?? "Baby"}
                    value={babyNames[index] ?? name}
                    placeholder={name}
                    onChangeText={(value) => setBabyNames((current) => current.map((existing, babyIndex) => (babyIndex === index ? value : existing)))}
                  />
                ))}
                <Button label="Name Child" onPress={nameBabies} />
              </View>
            </View>
          </Modal>
        ) : null}
      </SafeAreaView>
    );

    if (!menuBackground) return content;

    return (
      <ImageBackground source={menuBackgrounds[themeName]} resizeMode="cover" style={styles.backgroundImage}>
        <View style={[styles.backgroundTint, { backgroundColor: themeName === "dark" ? "rgba(4, 4, 7, 0.38)" : "rgba(255, 250, 242, 0.18)" }]}>{content}</View>
      </ImageBackground>
    );
  }

  function Card({ children }: { children: React.ReactNode }) {
    return <View style={[styles.card, { backgroundColor: C.panel, borderColor: C.line }]}>{children}</View>;
  }

  function Button({ label, onPress, disabled = false, small = false, variant = "accent" }: { label: string; onPress: () => void; disabled?: boolean; small?: boolean; variant?: "accent" | "warning" | "neutral" }) {
    const backgroundColor = disabled ? C.panel2 : variant === "warning" ? C.warning : variant === "neutral" ? C.panel2 : C.accent;
    return (
      <Pressable onPress={disabled ? undefined : onPress} style={[styles.button, small && styles.buttonSmall, { backgroundColor, borderColor: C.line, opacity: disabled ? 0.55 : 1 }]}>
        <Text style={[styles.buttonText, { color: variant === "neutral" && !disabled ? C.text : "#fff", fontSize: small ? 14 : 17 }]}>{label}</Text>
      </Pressable>
    );
  }

  function Chip({ label, selected, onPress, disabled = false }: { label: string; selected: boolean; onPress: () => void; disabled?: boolean }) {
    return (
      <Pressable onPress={disabled ? undefined : onPress} style={[styles.chip, { backgroundColor: selected ? C.accent : C.panel2, borderColor: selected ? C.accent : C.line, opacity: disabled ? 0.5 : 1 }]}>
        <Text style={[styles.chipText, { color: selected ? "#fff" : C.text }]}>{label}</Text>
      </Pressable>
    );
  }

  function Field({ label, value, onChangeText, placeholder }: { label: string; value: string; onChangeText: (value: string) => void; placeholder: string }) {
    return (
      <View style={styles.field}>
        <Text style={[styles.label, { color: C.dim }]}>{label}</Text>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={C.dim}
          style={[styles.input, { backgroundColor: C.panel2, borderColor: C.line, color: C.text }]}
        />
      </View>
    );
  }

  function PortraitImage({ subject, size = "large", highlight = false }: { subject: PortraitSubject; size?: "hero" | "large" | "resident" | "map" | "thumb"; highlight?: boolean }) {
    const initials = `${subject.firstName?.[0] ?? "?"}${subject.familyName?.[0] ?? ""}`.toUpperCase();
    const isHero = size === "hero";
    const isLarge = size === "large" || isHero;
    const isResident = size === "resident";
    const isMap = size === "map";
    const ravenwoodPortrait = subject.ravenwoodPortraitKey ? ravenwoodPortraitByKey[subject.ravenwoodPortraitKey] : null;
    const frameStyle = isHero
      ? styles.portraitHeroFrame
      : isLarge
        ? styles.portraitImageFrame
        : isResident
          ? styles.portraitResidentFrame
          : isMap
            ? styles.portraitMapFrame
            : styles.portraitThumbFrame;
    const frameWidth = isHero ? 114 : isLarge ? 72 : isResident ? 72 : isMap ? 40 : 36;
    const frameHeight = isHero ? 190 : isLarge ? 128 : isResident ? 122 : isMap ? 68 : 62;
    if (ravenwoodPortrait) {
      const isStaffPortrait = ravenwoodPortrait.sourceKind === "staff";
      const sourceWidth = ravenwoodPortrait.imageWidth;
      const sourceHeight = ravenwoodPortrait.imageHeight;
      const cropPaddingX = 0;
      const cropPaddingTop = 0;
      const cropPaddingBottom = 0;
      const cropX = clamp(ravenwoodPortrait.crop.x - cropPaddingX, 0, sourceWidth - 1);
      const cropY = clamp(ravenwoodPortrait.crop.y - cropPaddingTop, 0, sourceHeight - 1);
      const cropWidth = Math.min(sourceWidth - cropX, ravenwoodPortrait.crop.width + cropPaddingX * 2);
      const cropHeight = Math.min(sourceHeight - cropY, ravenwoodPortrait.crop.height + cropPaddingTop + cropPaddingBottom);
      const crop = {
        x: cropX,
        y: cropY,
        width: Math.max(1, cropWidth),
        height: Math.max(1, cropHeight)
      };
      const scaleBoost = isStaffPortrait
        ? isHero
          ? 1.08
          : isResident
            ? 1.08
            : isMap
              ? 1.06
              : 1.07
        : isHero
          ? 1.07
          : isResident
            ? 1.06
            : isMap
              ? 1.04
              : 1.05;
      const placementY = isStaffPortrait
        ? isHero
          ? 10
          : isResident
            ? 6
            : isMap
              ? 3
              : 5
        : isHero
          ? 3
          : isResident
            ? 2
            : isMap
              ? 1
              : 1;
      const scale = Math.max(frameWidth / crop.width, frameHeight / crop.height) * scaleBoost;
      return (
        <View style={[frameStyle, { borderColor: highlight ? C.accent : C.line, backgroundColor: C.panel2 }, subject.alive === false && styles.deadPortraitFrame]}>
          <Image
            source={ravenwoodPortrait.source}
            resizeMode="stretch"
            style={[
              styles.ravenwoodPortraitSheet,
              {
                width: sourceWidth * scale,
                height: sourceHeight * scale,
                left: -crop.x * scale + (frameWidth - crop.width * scale) / 2,
                top: -crop.y * scale + (frameHeight - crop.height * scale) / 2 + placementY,
                opacity: subject.alive === false ? 0.56 : 1
              }
            ]}
          />
          {subject.alive === false ? <View pointerEvents="none" style={styles.deadPortraitWash} /> : null}
        </View>
      );
    }
    return (
      <View style={[frameStyle, styles.picturelessPortrait, { borderColor: highlight ? C.accent : C.line, backgroundColor: C.panel2 }, subject.alive === false && styles.deadPortraitFrame]}>
        <Text style={[styles.picturelessInitials, { color: subject.alive === false ? C.dim : C.text, fontSize: isHero ? 46 : isLarge ? 28 : isResident ? 18 : 13 }]}>{initials}</Text>
        <Text style={[styles.picturelessMeta, { color: C.dim, fontSize: isHero ? 14 : isLarge ? 12 : isResident ? 9 : 8 }]}>{subject.sex}</Text>
        {subject.alive === false ? <View pointerEvents="none" style={styles.deadPortraitWash} /> : null}
      </View>
    );
  }

  function Portrait({ story }: { story: Story }) {
    const p = story.player;
    return (
      <View style={[styles.portrait, { backgroundColor: C.panel2, borderColor: C.line }]}>
        <Text style={[styles.portraitStage, { color: C.silver }]}>{p.age < 16 ? "young portrait" : p.age < 45 ? "adult portrait" : "elder portrait"}</Text>
        <PortraitImage subject={p} />
        <Text style={[styles.portraitName, { color: C.text }]}>{p.firstName}</Text>
      </View>
    );
  }

  function StoryWindow({ story }: { story: Story }) {
    const currentPlace = story.currentPlace ?? (story.player.birthStatus === "Royal" || story.player.birthStatus === "Noble" ? "palace halls" : "home");
    const choices = story.storyChoices?.length ? story.storyChoices : choicesForPlace(currentPlace, story.activeScene);
    const canWrite = story.player.alive && !story.finished && !story.awaitingSuccession;
    const messages: StoryMessage[] = story.storyMessages?.length
      ? story.storyMessages
      : story.yearLog[story.yearLog.length - 1]?.lines.map((line) => ({ id: line, speaker: "GM", text: line })) ?? [];
    const visibleMessages = messages.slice(-5);
    const background = locationBackgrounds[currentPlace] ?? locationBackgrounds["palace halls"];
    const choiceTone = (index: number) => [C.gold, C.accent, C.warning][index % 3];
    return (
      <View style={[styles.storyFrame, { borderColor: C.line, backgroundColor: C.panel }]}>
        <View style={styles.storyPanelRow}>
          <ImageBackground source={background} resizeMode="cover" style={styles.storyPlacePanel} imageStyle={styles.storyPlaceImage}>
            <View style={styles.storyPlaceTint}>
              <Text style={styles.storyPlaceLabel}>Year</Text>
              <Text style={styles.storyYearNumber}>{story.currentYear}</Text>
              <Text style={styles.storyPlaceSmall}>Current place</Text>
              <Text style={styles.storyPlaceName}>{titleCase(currentPlace)}</Text>
            </View>
          </ImageBackground>
          <View style={[styles.storyTextPanel, { backgroundColor: themeName === "dark" ? "rgba(10, 9, 10, 0.82)" : "rgba(255, 250, 242, 0.82)", borderColor: C.line }]}>
            <View style={styles.storyPlayerHeader}>
              <PortraitImage subject={story.player} size="large" highlight />
              <View style={styles.storyPlayerHeaderText}>
                <Text style={[styles.storySpeaker, { color: C.gold }]}>Player</Text>
                <Text style={[styles.heading, styles.storyPlayerName, { color: C.text }]}>{story.player.firstName} {story.player.familyName}</Text>
                <Text style={[styles.rollText, { color: C.dim }]}>Age {story.player.age} - {story.player.birthStatus}</Text>
              </View>
            </View>
            {story.activeScene ? <Text style={[styles.scenePill, { color: "#fff", backgroundColor: C.accent }]}>{story.activeScene.type === "combat" ? "Active Combat" : "Active Scene"}</Text> : null}
            <ScrollView style={styles.storyMessages}>
              {visibleMessages.map((message) => (
                <View key={message.id} style={styles.storyMessageBlock}>
                  <Text style={[styles.storySpeaker, { color: message.speaker === "Player" ? C.accent : C.gold }]}>{message.speaker}</Text>
                  <Text style={[styles.body, { color: C.text }]}>{message.text}</Text>
                  {message.roll ? <Text style={[styles.rollText, { color: C.dim }]}>{message.roll}</Text> : null}
                </View>
              ))}
            </ScrollView>
            {choices.length > 0 ? (
              <View style={styles.storyChoiceStack}>
                {choices.map((choice, index) => (
                  <Pressable
                    key={choice.id}
                    onPress={canWrite ? () => chooseStoryChoice(choice) : undefined}
                    style={[styles.storyChoiceRow, { borderColor: choiceTone(index), backgroundColor: `${choiceTone(index)}16`, opacity: canWrite ? 1 : 0.48 }]}
                  >
                    <Text style={[styles.storyChoiceText, { color: C.text }]}>{choice.label}</Text>
                    <Text style={[styles.storyChoiceMeta, { color: C.dim }]}>{choice.ability} DC {choice.dc}</Text>
                  </Pressable>
                ))}
              </View>
            ) : null}
          </View>
        </View>
        <View style={[styles.storyInputPanel, { backgroundColor: themeName === "dark" ? "rgba(10, 9, 10, 0.78)" : "rgba(255, 250, 242, 0.82)", borderColor: C.line }]}>
          <TextInput
            value={storyInput}
            onChangeText={(value) => setStoryInput(value.slice(0, 500))}
            placeholder="Write what your character tries..."
            placeholderTextColor={C.dim}
            multiline
            maxLength={500}
            editable={canWrite}
            style={[styles.storyInput, { color: C.text }]}
          />
          <View style={styles.storySendButton}>
            <Button small label="Send" onPress={submitStoryInput} disabled={!canWrite || storyInput.trim().length === 0} />
          </View>
          <Text style={[styles.rollText, styles.storyCount, { color: C.dim }]}>{storyInput.length}/500</Text>
        </View>
      </View>
    );
  }

  function Stat({ label, value, muted = false }: { label: string; value: number; muted?: boolean }) {
    return (
      <View style={styles.stat}>
        <View style={styles.rowBetween}>
          <Text style={{ color: muted ? "#a8a8a8" : C.dim }}>{label}</Text>
          <Text style={{ color: muted ? "#d2d2d2" : C.text }}>{value}</Text>
        </View>
        <View style={[styles.bar, { backgroundColor: muted ? "#4a4a4d" : C.panel2 }]}>
          <View style={[styles.barFill, { backgroundColor: muted ? "#8f8f92" : value >= 60 ? C.good : C.accent, width: `${clamp(value, 0, 100)}%` }]} />
        </View>
      </View>
    );
  }

  function PlayerStatStrip({ story }: { story: Story }) {
    const stats = [
      { label: "Health", value: story.player.health, color: C.good },
      { label: "Happiness", value: story.player.happiness, color: C.accent },
      { label: "Strength", value: story.player.strength, color: C.warning },
      { label: "Honor", value: story.player.honor, color: C.gold }
    ];
    return (
      <View style={[styles.statStrip, { backgroundColor: themeName === "dark" ? "rgba(5, 5, 8, 0.45)" : "rgba(255, 255, 255, 0.62)", borderColor: C.line }]}>
        {stats.map((stat, index) => (
          <View key={stat.label} style={[styles.statStripItem, { borderColor: C.line }, index === stats.length - 1 && styles.statStripItemLast]}>
            <Text style={[styles.statStripLabel, { color: C.dim }]} numberOfLines={1}>{stat.label}</Text>
            <Text style={[styles.statStripValue, { color: C.text }]}>{stat.value}</Text>
            <View style={[styles.statStripBar, { backgroundColor: C.panel2 }]}>
              <View style={[styles.statStripFill, { backgroundColor: stat.color, width: `${clamp(stat.value, 0, 100)}%` }]} />
            </View>
          </View>
        ))}
      </View>
    );
  }

  function RelationStatStrip({ relation, showRomance = true }: { relation: Pick<Relation, "trust" | "romance" | "alive">; showRomance?: boolean }) {
    const muted = !relation.alive;
    const stats = [
      { label: "Trust", value: relation.trust, color: C.good },
      ...(showRomance ? [{ label: "Romance", value: relation.romance, color: C.accent }] : [])
    ];
    return (
      <View style={[styles.relationStatStrip, { backgroundColor: muted ? "rgba(70, 70, 74, 0.45)" : themeName === "dark" ? "rgba(5, 5, 8, 0.32)" : "rgba(255, 255, 255, 0.52)", borderColor: C.line }]}>
        {stats.map((stat, index) => (
          <View key={stat.label} style={[styles.relationStatItem, { borderColor: C.line }, index === stats.length - 1 && styles.statStripItemLast]}>
            <Text style={[styles.relationStatLabel, { color: muted ? "#a8a8a8" : C.dim }]} numberOfLines={1}>{stat.label}</Text>
            <Text style={[styles.relationStatValue, { color: muted ? "#d2d2d2" : C.text }]}>{stat.value}</Text>
            <View style={[styles.relationStatBar, { backgroundColor: muted ? "#4a4a4d" : C.panel2 }]}>
              <View style={[styles.statStripFill, { backgroundColor: muted ? "#8f8f92" : stat.color, width: `${clamp(stat.value, 0, 100)}%` }]} />
            </View>
          </View>
        ))}
      </View>
    );
  }

  function MysteryTrustPill({ npc }: { npc: MysteryNpc }) {
    const muted = !npc.alive;
    return (
      <View style={[styles.mysteryTrustPill, { borderColor: muted ? "#777" : C.good, backgroundColor: muted ? "rgba(70, 70, 74, 0.45)" : `${C.good}18` }]}>
        <Text style={[styles.mysteryTrustPillLabel, { color: muted ? "#c9c9c9" : C.good }]}>Trust</Text>
        <Text style={[styles.mysteryTrustPillValue, { color: muted ? "#d2d2d2" : C.text }]}>{npc.trust}</Text>
      </View>
    );
  }

  function GameplayBottomMenu() {
    return (
      <View style={[styles.bottomMenu, { backgroundColor: C.panel, borderColor: C.line }]}>
        <Pressable onPress={() => setScreen("character")} style={[styles.bottomMenuItem, { borderColor: C.line }]}>
          <Text style={[styles.bottomMenuText, { color: C.text }]}>Character</Text>
        </Pressable>
        <Pressable onPress={() => setScreen("family")} style={[styles.bottomMenuItem, { borderColor: C.line }]}>
          <Text style={[styles.bottomMenuText, { color: C.text }]}>Family Tree</Text>
        </Pressable>
        <Pressable onPress={() => setScreen("relationships")} style={[styles.bottomMenuItem, { borderColor: C.line }]}>
          <Text style={[styles.bottomMenuText, { color: C.text }]}>Relationships</Text>
        </Pressable>
        <Pressable onPress={() => setScreen("journal")} style={[styles.bottomMenuItem, { borderColor: C.line }]}>
          <Text style={[styles.bottomMenuText, { color: C.text }]}>Journal</Text>
        </Pressable>
      </View>
    );
  }

  function nameById(id?: string): string | null {
    if (!id || !activeStory) return null;
    if (id === activeStory.player.id) return fullName(activeStory.player);
    const familyPerson = activeStory.family.find((person) => person.id === id);
    if (familyPerson) return fullName(familyPerson);
    const royalPerson = activeStory.royalFamily.find((person) => person.id === id);
    if (royalPerson) return fullName(royalPerson);
    const relation = activeStory.relations.find((candidate) => candidate.id === id);
    return relation ? fullName(relation) : null;
  }

  function spouseNameFor(relation: Relation): string | null {
    if (!relation.spouseId || !activeStory) return null;
    const directName = nameById(relation.spouseId);
    if (directName) return relation.spouseId === activeStory.player.id ? `${directName} (you)` : directName;
    const reverseRelation = activeStory.relations.find((candidate) => candidate.spouseId === relation.id);
    return reverseRelation ? fullName(reverseRelation) : null;
  }

  function marriageText(person: Person): string | null {
    const spouseName = nameById(person.spouseId);
    if (spouseName) return `Married to ${spouseName}`;
    if (person.age >= 14) return "Not married";
    return null;
  }

  function MysteryBottomMenu() {
    return (
      <View style={[styles.bottomMenu, { backgroundColor: C.panel, borderColor: C.line }]}>
        <Pressable onPress={() => setScreen("mysteryCharacter")} style={[styles.bottomMenuItem, { borderColor: C.line }]}>
          <Text style={[styles.bottomMenuText, { color: C.text }]}>Character</Text>
        </Pressable>
        <Pressable onPress={() => setScreen("mysteryRelations")} style={[styles.bottomMenuItem, { borderColor: C.line }]}>
          <Text style={[styles.bottomMenuText, { color: C.text }]}>Residents</Text>
        </Pressable>
        <Pressable onPress={() => setScreen("mysteryMap")} style={[styles.bottomMenuItem, { borderColor: C.line }]}>
          <Text style={[styles.bottomMenuText, { color: C.text }]}>Map</Text>
        </Pressable>
        <Pressable onPress={() => setScreen("mysteryJournal")} style={[styles.bottomMenuItem, { borderColor: C.line }]}>
          <Text style={[styles.bottomMenuText, { color: C.text }]}>Journal</Text>
        </Pressable>
      </View>
    );
  }

  function MysteryHeader({ mystery }: { mystery: MysteryGame }) {
    return (
      <View style={styles.rowBetween}>
        <Button small label="Menu" onPress={() => setScreen("menu")} />
        <View style={styles.mysteryHeaderProfile}>
          <Text style={[styles.heading, styles.mysteryHeaderName, { color: C.text }]}>{mystery.player.firstName} {mystery.player.familyName}</Text>
        </View>
      </View>
    );
  }

  function MysteryMessageText({ message, mystery }: { message: StoryMessage; mystery: MysteryGame }) {
    const segments = message.rich ?? mysteryNpcSegments(message.text, mystery);
    return (
      <Text style={[styles.body, { color: C.text }]}>
        {segments.map((segment, index) => (
          <Text
            key={`${message.id}-${index}`}
            onPress={segment.npcId ? () => focusMysteryNpc(segment.npcId!) : undefined}
            style={[
              segment.color ? { color: segment.color } : null,
              segment.npcId ? styles.clickableNpcName : null
            ]}
          >
            {segment.text}
          </Text>
        ))}
      </Text>
    );
  }

  function MysteryStoryWindow({ mystery }: { mystery: MysteryGame }) {
    const visibleMessages = mystery.messages.slice(-5);
    const currentRoom = mysteryRoomName(mystery, mystery.currentRoomId);
    const roomBackground = ravenwoodRoomBackgroundFor(mystery, themeName);
    const sceneHeaderStyle = [styles.mysterySceneHeader, styles.ravenwoodBubbleBackdrop, { backgroundColor: themeName === "dark" ? "#141217" : "#efe8dc", borderColor: "rgba(240, 196, 92, 0.28)" }];
    const storyPanelStyle = [styles.storyTextPanel, styles.mysteryTextPanelWide, styles.ravenwoodBubbleBackdrop, { backgroundColor: themeName === "dark" ? "rgba(10, 9, 10, 0.82)" : "rgba(255, 250, 242, 0.82)", borderColor: C.line }];
    const inputPanelStyle = [styles.storyInputPanel, styles.ravenwoodBubbleBackdrop, { backgroundColor: themeName === "dark" ? "rgba(10, 9, 10, 0.78)" : "rgba(255, 250, 242, 0.82)", borderColor: C.line }];
    const sceneHeaderContent = (
      <>
        <PortraitImage subject={mysteryPlayerPortraitSubject(mystery.player)} size="large" highlight />
        <View style={styles.mysterySceneMeta}>
          <Text style={styles.storyPlaceLabel}>Day</Text>
          <View style={styles.mysterySceneMetaRow}>
            <Text style={styles.storyYearNumber}>{mystery.day}</Text>
            <View style={styles.mysteryScenePlaceBlock}>
              <Text style={styles.storyPlaceSmall}>{mystery.daytime}</Text>
              <Text style={styles.mysteryScenePlaceName}>{currentRoom}</Text>
            </View>
          </View>
        </View>
      </>
    );
    const storyPanelContent = (
      <ScrollView style={[styles.storyMessages, styles.mysteryStoryMessages]}>
        {visibleMessages.map((message) => (
          <View key={message.id} style={styles.storyMessageBlock}>
            <Text style={[styles.storySpeaker, { color: message.speaker === "Player" ? C.accent : C.gold }]}>{message.speaker}</Text>
            {message.speaker === "GM" ? <MysteryMessageText message={message} mystery={mystery} /> : <Text style={[styles.body, { color: C.text }]}>{message.text}</Text>}
            {message.roll ? <Text style={[styles.rollText, { color: C.dim }]}>{message.roll}</Text> : null}
          </View>
        ))}
      </ScrollView>
    );
    const inputPanelContent = (
      <>
        <TextInput
          value={mysteryInput}
          onChangeText={(value) => setMysteryInput(value.slice(0, 500))}
          placeholder="Write what your detective tries..."
          placeholderTextColor={C.dim}
          multiline
          maxLength={500}
          editable={!mystery.finished}
          style={[styles.storyInput, { color: C.text }]}
        />
        <View style={styles.storySendButton}>
          <Button small label="Send" onPress={submitMysteryInput} disabled={mystery.finished || mysteryInput.trim().length === 0} />
        </View>
        <Text style={[styles.rollText, styles.storyCount, { color: C.dim }]}>{mysteryInput.length}/500</Text>
      </>
    );
    return (
      <View style={[styles.storyFrame, styles.mysteryStoryFrame, { borderColor: C.line, backgroundColor: C.panel }]}>
        {roomBackground ? (
          <ImageBackground source={roomBackground} resizeMode="cover" imageStyle={[styles.ravenwoodBubbleBackdropImage, { opacity: 0.22 }]} style={sceneHeaderStyle}>
            {sceneHeaderContent}
          </ImageBackground>
        ) : (
          <View style={sceneHeaderStyle}>{sceneHeaderContent}</View>
        )}
        {roomBackground ? (
          <ImageBackground source={roomBackground} resizeMode="cover" imageStyle={[styles.ravenwoodBubbleBackdropImage, { opacity: 0.16 }]} style={storyPanelStyle}>
            {storyPanelContent}
          </ImageBackground>
        ) : (
          <View style={storyPanelStyle}>{storyPanelContent}</View>
        )}
        {roomBackground ? (
          <ImageBackground source={roomBackground} resizeMode="cover" imageStyle={[styles.ravenwoodBubbleBackdropImage, { opacity: 0.18 }]} style={inputPanelStyle}>
            {inputPanelContent}
          </ImageBackground>
        ) : (
          <View style={inputPanelStyle}>{inputPanelContent}</View>
        )}
      </View>
    );
  }

  if (screen === "menu") {
    return (
      <Shell menuBackground>
        <Text style={[styles.title, styles.menuTextShadow, { color: C.text }]}>Dragon Chronicles</Text>
        <Text style={[styles.subtitle, styles.menuTextShadow, { color: themeName === "dark" ? "#e7e1dc" : C.text }]}>Forge a soul. Year by year, keep the bloodline alive.</Text>
        <Button label="New Game" onPress={() => setScreen("bookSelect")} />
        <Button label="Load Game" onPress={() => setScreen("load")} />
        <Button label="Past Games" onPress={() => setScreen("past")} />
        <Button label="Settings" onPress={() => setScreen("settings")} />
        <Button label="Exit" onPress={() => undefined} disabled />
      </Shell>
    );
  }

  if (screen === "bookSelect") {
    return (
      <Shell>
        <Text style={[styles.titleSmall, { color: C.text }]}>Choose Book</Text>
        <Text style={[styles.subtitle, { color: C.dim }]}>Each book will become its own world and rules mood.</Text>
        <Card>
          <Text style={[styles.heading, { color: C.text }]}>Kingdom Of Old Atlantis</Text>
          <Text style={[styles.body, { color: C.text }]}>Dynasty, bloodlines, court intrigue, and D&D-style exploration.</Text>
          <Button label="Begin This Book" onPress={() => setScreen("builder1")} />
        </Card>
        <Card>
          <Text style={[styles.heading, { color: C.text }]}>Ravenwood Murder Mystery Book</Text>
          <Text style={[styles.body, { color: C.text }]}>A 13-day murder investigation in a mansion hotel with suspects, secrets and open exploration.</Text>
          <Button label="Begin This Book" onPress={() => setScreen("mysteryDetectiveSelect")} />
        </Card>
        <Card>
          <Text style={[styles.heading, { color: C.text }]}>Birmingham Books</Text>
          <Text style={[styles.body, { color: C.dim }]}>Blank for now.</Text>
          <Button label="Blank For Now" onPress={() => undefined} disabled />
        </Card>
        <Card>
          <Text style={[styles.heading, { color: C.text }]}>Zombie Apocalypse Book</Text>
          <Text style={[styles.body, { color: C.dim }]}>Blank for now.</Text>
          <Button label="Blank For Now" onPress={() => undefined} disabled />
        </Card>
        <Button label="Back" onPress={() => setScreen("menu")} />
      </Shell>
    );
  }

  if (screen === "mysteryDetectiveSelect") {
    return (
      <Shell>
        <View style={styles.rowBetween}>
          <Text style={[styles.titleSmall, { color: C.text }]}>Choose Detective</Text>
          <Button small label="Back" onPress={() => setScreen("bookSelect")} />
        </View>
        <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} contentContainerStyle={styles.detectiveCarousel}>
          {ravenwoodDetectiveProfiles.map((profile) => {
            const selected = selectedMysteryDetective.id === profile.id;
            return (
              <Pressable
                key={profile.id}
                onPress={() => chooseMysteryDetective(profile.id)}
                style={[styles.detectiveCard, { backgroundColor: selected ? C.panel2 : C.panel, borderColor: selected ? C.accent : C.line }]}
              >
                <PortraitImage subject={mysteryDetectivePortraitSubject(profile, 24)} size="hero" highlight={selected} />
                <Text style={[styles.heading, styles.detectiveName, { color: C.text }]}>{profile.firstName} {profile.familyName}</Text>
                <Text style={[styles.rollText, { color: C.dim }]}>{profile.sex} - age 24 portrait</Text>
                <View style={styles.detectiveQuirkList}>
                  {profile.quirks.map((quirk) => (
                    <View key={quirk.id} style={[styles.detectiveQuirkRow, { borderColor: C.line }]}>
                      <Text style={[styles.body, styles.detectiveQuirkText, { color: C.text }]}>{quirk.label}</Text>
                      <Text style={[styles.rollText, styles.gameHiddenText]}>{signedModifier(quirk.modifier)} {quirk.check}</Text>
                    </View>
                  ))}
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
        <Button label="THIS IS MY DETECTIVE" onPress={confirmMysteryDetective} />
      </Shell>
    );
  }

  if (screen === "mysteryPortraitSelect") {
    return (
      <Shell>
        <View style={styles.rowBetween}>
          <Text style={[styles.titleSmall, { color: C.text }]}>Choose Portrait Age</Text>
          <Button small label="Back" onPress={() => setScreen("mysteryDetectiveSelect")} />
        </View>
        <Card>
          <Text style={[styles.heading, { color: C.text }]}>{selectedMysteryDetective.firstName} {selectedMysteryDetective.familyName}</Text>
          <Text style={[styles.body, { color: C.text }]}>The case will begin with this detective at the selected age.</Text>
          <View style={styles.detectiveAgeGrid}>
            {ravenwoodPlayerSelectableAges.map((age) => {
              const selected = selectedMysteryDetectiveAge === age;
              return (
                <Pressable
                  key={age}
                  onPress={() => setSelectedMysteryDetectiveAge(age)}
                  style={[styles.detectiveAgeCard, { backgroundColor: selected ? C.panel2 : C.panel, borderColor: selected ? C.accent : C.line }]}
                >
                  <PortraitImage subject={mysteryDetectivePortraitSubject(selectedMysteryDetective, age)} size="hero" highlight={selected} />
                  <Text style={[styles.heading, styles.detectiveAgeLabel, { color: C.text }]}>Age {age}</Text>
                </Pressable>
              );
            })}
          </View>
          <View style={styles.detectiveQuirkList}>
            {selectedMysteryDetective.quirks.map((quirk) => (
              <Text key={quirk.id} style={[styles.rollText, styles.gameHiddenText]}>{quirk.label}: {signedModifier(quirk.modifier)} {quirk.check}</Text>
            ))}
          </View>
        </Card>
        <Button label="Start Case" onPress={startMystery} />
      </Shell>
    );
  }

  if (screen === "mystery" && activeMystery) {
    const roomsByFloor = [1, 2, 3].map((floor) => activeMystery.rooms.filter((room) => room.floor === floor));
    return (
      <Shell>
        <MysteryHeader mystery={activeMystery} />
        <MysteryStoryWindow mystery={activeMystery} />
        <Card>
          <Text style={[styles.label, { color: C.dim }]}>Places</Text>
          {roomsByFloor.map((rooms, index) => (
            <View key={index} style={styles.mysteryFloorBlock}>
              <Text style={[styles.mysteryFloorTitle, { color: C.text }]}>Floor {index + 1}</Text>
              <View style={styles.wrapRow}>
                {rooms.map((room) => (
                  <Chip
                    key={room.id}
                    label={room.name}
                    selected={activeMystery.currentRoomId === room.id}
                    disabled={!room.accessible || activeMystery.finished}
                    onPress={() => visitMysteryRoom(room.id)}
                  />
                ))}
              </View>
            </View>
          ))}
        </Card>
        {activeMystery.finished ? (
          <Card>
            <Text style={[styles.heading, { color: activeMystery.won ? C.good : C.warning }]}>{activeMystery.won ? "Case Won" : "Case Lost"}</Text>
            <Text style={[styles.body, { color: C.text }]}>{activeMystery.summary}</Text>
          </Card>
        ) : null}
        <Modal visible={Boolean(activeMystery.lossPending)} transparent animationType="fade">
          <View style={styles.modalShade}>
            <View style={[styles.modalCard, { backgroundColor: C.panel, borderColor: C.line }]}>
              <Text style={[styles.heading, { color: C.warning }]}>Ravenwood Is Lost</Text>
              <Text style={[styles.body, { color: C.text }]}>The thirteenth midnight passes. The killer remains free, and the report moves to finished games.</Text>
              <Button label="Main Menu" onPress={closeMysteryLoss} />
            </View>
          </View>
        </Modal>
      </Shell>
    );
  }

  if (screen === "mysteryCharacter" && activeMystery) {
    return (
      <Shell>
        <View style={styles.rowBetween}>
          <Text style={[styles.titleSmall, { color: C.text }]}>Character</Text>
          <Button small label="Back" onPress={() => setScreen("mystery")} />
        </View>
        <Card>
          <View style={styles.characterHeader}>
            <PortraitImage subject={mysteryPlayerPortraitSubject(activeMystery.player)} size="hero" highlight />
            <View style={styles.characterHeaderText}>
              <Text style={[styles.heading, { color: C.text }]}>{activeMystery.player.firstName} {activeMystery.player.familyName}</Text>
              <Text style={{ color: C.dim }}>{activeMystery.player.sex}</Text>
              <Text style={{ color: C.dim }}>Age {mysteryPlayerAge(activeMystery.player)}</Text>
              <Text style={{ color: C.dim }}>Room key: {mysteryRoomName(activeMystery, activeMystery.playerRoomId)}</Text>
              <Text style={{ color: C.dim }}>Current room: {mysteryRoomName(activeMystery, activeMystery.currentRoomId)}</Text>
              <Text style={{ color: C.dim }}>Day {activeMystery.day}, {activeMystery.daytime}</Text>
            </View>
          </View>
        </Card>
        {activeMystery.player.detectiveQuirks?.length ? (
          <Card>
            <Text style={[styles.heading, { color: C.text }]}>Quirks</Text>
            {activeMystery.player.detectiveQuirks.map((quirk) => (
              <Text key={quirk.id} style={[styles.body, { color: C.text }]}>
                {quirk.label} <Text style={styles.gameHiddenText}>({signedModifier(quirk.modifier)} {quirk.check})</Text>
              </Text>
            ))}
          </Card>
        ) : null}
        <Card>
          <Text style={[styles.heading, { color: C.text }]}>Roll Modifiers</Text>
          <View style={styles.detectiveModifierGrid}>
            {mysteryRollTypes.map((check) => {
              const modifier = mysteryQuirkModifierFor(activeMystery.player.detectiveQuirks, check);
              return (
                <Text key={check} style={[styles.rollText, modifier === 0 ? { color: C.dim } : styles.gameHiddenText]}>
                  {check}: {signedModifier(modifier)}
                </Text>
              );
            })}
          </View>
        </Card>
        <Card>
          <Text style={[styles.heading, { color: C.text }]}>Inventory</Text>
          {activeMystery.inventory.length === 0 ? <Text style={[styles.body, { color: C.text }]}>Nothing carried.</Text> : null}
          {activeMystery.inventory.map((item, index) => (
            <Pressable
              key={item}
              onLongPress={() => setDraggingMysteryItem(item)}
              onPress={draggingMysteryItem && draggingMysteryItem !== item ? () => dropMysteryInventoryOn(item) : undefined}
              style={[styles.itemRow, { borderColor: C.line }, draggingMysteryItem === item && styles.relationCardDragging]}
            >
              <Text style={[styles.body, styles.itemName, { color: C.text }]}>{titleCase(item)}</Text>
              <View style={styles.wrapRow}>
                <Button small label="Up" onPress={() => moveMysteryInventory(item, -1)} disabled={index === 0} />
                <Button small label="Down" onPress={() => moveMysteryInventory(item, 1)} disabled={index === activeMystery.inventory.length - 1} />
                <Button small label="Abandon" onPress={() => changeMysteryInventory(item, "Abandon")} variant="warning" />
              </View>
            </Pressable>
          ))}
        </Card>
      </Shell>
    );
  }

  if (screen === "mysteryRelations" && activeMystery) {
    const focusedMysteryNpcs = focusedMysteryNpcId
      ? [
        ...activeMystery.npcs.filter((npc) => npc.id === focusedMysteryNpcId),
        ...activeMystery.npcs.filter((npc) => npc.id !== focusedMysteryNpcId)
      ]
      : activeMystery.npcs;
    return (
      <Shell>
        <View style={styles.rowBetween}>
          <Text style={[styles.titleSmall, { color: C.text }]}>Relationships</Text>
          <Button small label="Back" onPress={() => setScreen("mystery")} />
        </View>
        {focusedMysteryNpcs.map((npc) => (
          <View key={npc.id} style={[styles.card, { backgroundColor: C.panel, borderColor: C.line }, focusedMysteryNpcId === npc.id && styles.focusedMysteryNpcCard, !npc.alive && styles.deadTile, !npc.alive && styles.deadRelationCard]}>
            <View style={styles.relationHeader}>
              <PortraitImage subject={npc} size="resident" />
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={[styles.heading, styles.relationName, { color: npc.alive ? C.text : C.dim }]}>{npc.firstName} {npc.familyName}</Text>
                <Text style={{ color: C.dim }}>{npc.role} - {npc.sex} - age {npc.age}{npc.isChild ? " - Child" : ""}</Text>
                {!npc.alive ? <Text style={{ color: C.warning }}>Dead</Text> : null}
              </View>
              <MysteryTrustPill npc={npc} />
            </View>
            {!npc.romanceRevealed ? <Text style={[styles.rollText, styles.discoverableHiddenText]}>Romance hidden until romantic action.</Text> : null}
            <View style={[styles.relationshipLedgerBox, { borderColor: C.line, backgroundColor: C.panel2 }]}>
              <Text style={[styles.rollText, styles.gameHiddenText]}>NPC relationships for testing</Text>
              {mysteryRelationshipLinesFor(npc, activeMystery.npcs, activeMystery.npcRelationships ?? []).length === 0 ? (
                <Text style={[styles.rollText, { color: C.dim }]}>No direct NPC relationship record.</Text>
              ) : mysteryRelationshipLinesFor(npc, activeMystery.npcs, activeMystery.npcRelationships ?? []).map((line) => (
                <Text key={line} style={[styles.rollText, line.includes("(hidden") ? styles.discoverableHiddenText : { color: C.text }]}>{line}</Text>
              ))}
            </View>
            <View style={styles.mysteryDossierGrid}>
              {npc.familyRelationNote ? <Text style={[styles.body, { color: C.gold }]}>Family relation: {npc.familyRelationNote}</Text> : null}
              <Text style={[styles.body, npc.familyStatus.toLowerCase().includes("secret") ? styles.discoverableHiddenText : { color: C.text }]}>Family status: {npc.familyStatus}</Text>
              <Text style={[styles.body, { color: C.text }]}>Education: {npc.education}</Text>
              <Text style={[styles.body, { color: C.text }]}>Occupation: {npc.occupation}</Text>
              <Text style={[styles.body, { color: C.text }]}>Interests: {npc.interests.join(", ")}</Text>
              <Text style={[styles.body, { color: C.text }]}>Reason of stay: {npc.reasonOfStay}</Text>
              <Text style={[styles.body, { color: C.text }]}>Current stay: {npc.currentStay ?? "Not recorded yet."}</Text>
              <Text style={[styles.body, { color: C.text }]}>Planned stay: {npc.plannedStay ?? "Not recorded yet."}</Text>
              <Text style={[styles.body, { color: C.text }]}>Previous stay: {npc.previousStay ?? "Not recorded yet."}</Text>
              <Text style={[styles.body, styles.discoverableHiddenText]}>Secret: {readableMysterySecret(npc.secret)}</Text>
              <Text style={[styles.body, { color: C.text }]}>Quirk: {npc.quirk}</Text>
              <Text style={[styles.body, { color: C.dim }]}>Room/station: {mysteryRoomName(activeMystery, npc.role === "Guest" ? npc.roomId : npc.stationRoomId)}</Text>
            </View>
          </View>
        ))}
      </Shell>
    );
  }

  if (screen === "mysteryMap" && activeMystery) {
    return (
      <Shell>
        <View style={styles.rowBetween}>
          <Text style={[styles.titleSmall, { color: C.text }]}>Mansion Map</Text>
          <Button small label="Back" onPress={() => setScreen("mystery")} />
        </View>
        {[1, 2, 3].map((floor) => (
          <Card key={floor}>
            <Text style={[styles.heading, { color: C.text }]}>Floor {floor}</Text>
            <View style={styles.mysteryMapGrid}>
              {activeMystery.rooms.filter((room) => room.floor === floor).map((room) => {
                const people = mysteryPeopleInRoom(activeMystery, room.id);
                return (
                  <View key={room.id} style={[styles.mysteryRoomTile, { borderColor: room.accessible ? C.accent : C.line, backgroundColor: room.accessible ? C.panel2 : "rgba(100, 100, 105, 0.15)" }]}>
                    <Text style={[styles.mysteryRoomName, { color: C.text }]}>{room.name}</Text>
                    {room.bedSetup ? <Text style={[styles.rollText, { color: C.dim }]}>{titleCase(room.bedSetup)}</Text> : null}
                    <Text style={[styles.rollText, { color: room.accessible ? C.good : C.dim }]}>{room.accessible ? "Accessible" : "Locked"}</Text>
                    <View style={styles.row}>
                      {people.slice(0, 5).map((person) => (
                        <Pressable key={person.id} onPress={() => focusMysteryNpc(person.id)} style={styles.mapPortraitButton}>
                          <PortraitImage subject={person} size="map" />
                        </Pressable>
                      ))}
                    </View>
                  </View>
                );
              })}
            </View>
          </Card>
        ))}
      </Shell>
    );
  }

  if (screen === "mysteryJournal" && activeMystery) {
    const blueprint = activeMystery.murders.map((murder, index) => `Murder ${index + 1}: ${mysteryNpcName(activeMystery, murder.victimId)} by ${mysteryNpcName(activeMystery, murder.killerId)} on day ${murder.day} ${murder.daytime}, ${murder.method}. Motive: ${cleanSentenceEnd(murder.motive)}. Clues/proof: ${(murder.proofs?.length ? murder.proofs : [murder.proof]).join(", ")}.`);
    return (
      <Shell>
        <View style={styles.rowBetween}>
          <Text style={[styles.titleSmall, { color: C.text }]}>Journal</Text>
          <Button small label="Back" onPress={() => setScreen("mystery")} />
        </View>
        <Card>
          <Text style={[styles.heading, { color: C.text }]}>Your Notes</Text>
          <TextInput
            value={activeMystery.journalNotes}
            onChangeText={(journalNotes) => patchMystery((mystery) => ({ ...mystery, journalNotes: journalNotes.slice(0, 3000) }))}
            placeholder="Write your own suspicions, clues, and theories..."
            placeholderTextColor={C.dim}
            multiline
            style={[styles.input, styles.notesInput, { backgroundColor: C.panel2, borderColor: C.line, color: C.text }]}
          />
        </Card>
        <Card>
          <Text style={[styles.heading, styles.gameHiddenText]}>Case Blueprint For Testing</Text>
          {blueprint.map((line) => <Text key={line} style={[styles.body, styles.gameHiddenText]}>{line}</Text>)}
          {activeMystery.discoveredProof.length > 0 ? <Text style={[styles.body, styles.discoverableHiddenText]}>Discovered proof: {activeMystery.discoveredProof.join(", ")}</Text> : null}
        </Card>
        <Card>
          <Text style={[styles.heading, styles.gameHiddenText]}>Sanity Ledger</Text>
          <View style={[styles.ledgerBox, { borderColor: C.line, backgroundColor: C.panel2 }]}>
            {(activeMystery.sanityLedger ?? ["No ledger recorded for this older save."]).map((line, index) => (
              <Text key={`${index}-${line}`} style={[styles.ledgerText, styles.gameHiddenText]}>{line}</Text>
            ))}
          </View>
        </Card>
        <Text style={[styles.heading, { color: C.text }]}>Story Archive</Text>
        {activeMystery.journal.length === 0 ? <Text style={[styles.subtitle, { color: C.dim }]}>Older story text will appear here after more than five responses.</Text> : null}
        {activeMystery.journal.map((message) => (
          <Card key={message.id}>
            <Text style={[styles.storySpeaker, { color: message.speaker === "Player" ? C.accent : C.gold }]}>{message.speaker}</Text>
            <Text style={[styles.body, { color: C.text }]}>{message.text}</Text>
            {message.roll ? <Text style={[styles.rollText, { color: C.dim }]}>{message.roll}</Text> : null}
          </Card>
        ))}
      </Shell>
    );
  }

  if (screen === "builder1") {
    return (
      <Shell>
        <Text style={[styles.titleSmall, { color: C.text }]}>Character Builder</Text>
        <Text style={[styles.subtitle, { color: C.dim }]}>Step 1 of 2: name, status, and bloodline.</Text>
        <Card>
          <Field label="First Name" value={draft.firstName} onChangeText={(firstName) => patchDraft({ firstName })} placeholder="Aelira" />
          <Field label="Family Name" value={draft.familyName} onChangeText={(familyName) => patchDraft({ familyName })} placeholder="Duskblade" />
          <Text style={[styles.label, { color: C.dim }]}>Sex</Text>
          <View style={styles.wrapRow}>{(["Female", "Male"] as const).map((sex) => <Chip key={sex} label={sex} selected={draft.sex === sex} onPress={() => chooseSex(sex)} />)}</View>
          <Text style={[styles.label, { color: C.dim }]}>Birth Status</Text>
          <View style={styles.wrapRow}>{(["Royal", "Noble", "Bastard", "Commoner"] as const).map((birthStatus) => <Chip key={birthStatus} label={birthStatus} selected={draft.birthStatus === birthStatus} onPress={() => chooseBirthStatus(birthStatus)} />)}</View>
          <Text style={[styles.label, { color: C.dim }]}>Bloodline</Text>
          <View style={styles.wrapRow}>{bloodlines.map((bloodline) => <Chip key={bloodline} label={bloodline} selected={draft.bloodline === bloodline} onPress={() => patchDraft({ bloodline })} />)}</View>
        </Card>
        <Button label="Next" onPress={() => setScreen("builder2")} />
        <Button label="Back" onPress={() => setScreen("menu")} />
      </Shell>
    );
  }

  if (screen === "builder2") {
    const availableClothes = clothingOptionsFor(draft.birthStatus, draft.sex);
    const availableColors = clothColorOptionsFor(draft.birthStatus);
    return (
      <Shell>
        <Text style={[styles.titleSmall, { color: C.text }]}>Character Builder</Text>
        <Text style={[styles.subtitle, { color: C.dim }]}>Step 2 of 2: age, origin, and portrait seed.</Text>
        <Card>
          <Text style={[styles.label, { color: C.dim }]}>Starting Age</Text>
          <View style={styles.wrapRow}>{[0, 12, 16, 24].map((startAge) => <Chip key={startAge} label={String(startAge)} selected={draft.startAge === startAge} onPress={() => patchDraft({ startAge })} />)}</View>
          <Text style={[styles.label, { color: C.dim }]}>Origin</Text>
          <View style={styles.wrapRow}>{origins.map((origin) => <Chip key={origin} label={origin} selected={draft.origin === origin} onPress={() => patchDraft({ origin })} />)}</View>
          <Text style={[styles.label, { color: C.dim }]}>Hair Style</Text>
          <View style={styles.wrapRow}>{hairStyles.map((hairStyle) => <Chip key={hairStyle} label={hairStyle} selected={draft.hairStyle === hairStyle} onPress={() => patchDraft({ hairStyle })} />)}</View>
          <Text style={[styles.label, { color: C.dim }]}>Hair Colour</Text>
          <View style={styles.wrapRow}>{hairColors.map((hairColor) => <Chip key={hairColor} label={hairColor} selected={draft.hairColor === hairColor} onPress={() => patchDraft({ hairColor })} />)}</View>
          <Text style={[styles.label, { color: C.dim }]}>Clothing For {draft.birthStatus}</Text>
          <View style={styles.wrapRow}>{availableClothes.map((clothing) => <Chip key={clothing} label={clothing} selected={draft.clothing === clothing} onPress={() => patchDraft({ clothing })} />)}</View>
          <Text style={[styles.label, { color: C.dim }]}>Cloth Colour For {draft.birthStatus}</Text>
          <View style={styles.wrapRow}>{availableColors.map((clothColor) => <Chip key={clothColor} label={clothColor} selected={draft.clothColor === clothColor} onPress={() => patchDraft({ clothColor })} />)}</View>
          <Text style={[styles.label, { color: C.dim }]}>Face Trait</Text>
          <View style={styles.wrapRow}>{faceTraits.map((faceTrait) => <Chip key={faceTrait} label={faceTrait} selected={draft.faceTrait === faceTrait} onPress={() => patchDraft({ faceTrait })} />)}</View>
        </Card>
        <Button label="Start Chronicle" onPress={startStory} />
        <Button label="Back" onPress={() => setScreen("builder1")} />
      </Shell>
    );
  }

  if (screen === "chronicle" && activeStory) {
    const places = placesByStatus[activeStory.player.birthStatus];
    const successionOptions = successionCandidates(activeStory);
    const canAct = activeStory.player.alive && !activeStory.finished && !activeStory.awaitingSuccession;
    const canLeaveScene = canAct && !activeStory.activeScene;
    return (
      <Shell>
        <View style={styles.rowBetween}>
          <Button small label="Menu" onPress={() => setScreen("menu")} />
          <Text style={[styles.heading, { color: C.text }]}>{activeStory.player.firstName} {activeStory.player.familyName}</Text>
        </View>
        <View style={styles.row}>
          <Button small label="Daily Paper" onPress={() => setScreen("paper")} />
          {["Bastard", "Commoner"].includes(activeStory.player.birthStatus) ? <Button small label="Labour" onPress={labour} disabled={!canLeaveScene || (activeStory.placeUses.labour ?? 0) >= activeStory.player.labourLimit} /> : null}
          {petitionReady(activeStory) ? <Button small label="Petition Legitimacy" onPress={petitionForLegitimacy} disabled={!canAct} /> : null}
          <Button small label="Age Up" onPress={ageUp} disabled={!canLeaveScene} variant="warning" />
        </View>
        <StoryWindow story={activeStory} />
        {activeStory.awaitingSuccession ? (
          <Card>
            <Text style={[styles.heading, { color: C.text }]}>Choose Who Continues</Text>
            <Text style={[styles.body, { color: C.text }]}>The player character has died, but the chronicle can continue through a living child or ward.</Text>
            {successionOptions.map((person) => (
              <View key={person.id} style={[styles.itemRow, { borderColor: C.line }]}>
                <Text style={[styles.body, styles.itemName, { color: C.text }]}>{person.firstName} {person.familyName} - {person.relation}, {person.sex}, age {person.age}</Text>
                <Button small label="Continue" onPress={() => continueAsSuccessor(person.id)} />
              </View>
            ))}
          </Card>
        ) : null}
        <Card>
          <Text style={[styles.label, { color: C.dim }]}>Places</Text>
          {activeStory.activeScene ? <Text style={[styles.body, { color: C.warning }]}>You cannot change places until {activeStory.activeScene.title.toLowerCase()} is resolved.</Text> : null}
          <View style={styles.wrapRow}>
            {places.map((place) => (
              <Chip
                key={place}
                label={titleCase(place)}
                selected={currentPlaceFor(activeStory) === place}
                disabled={!canAct || Boolean(activeStory.activeScene && currentPlaceFor(activeStory) !== place)}
                onPress={() => visit(place)}
              />
            ))}
          </View>
        </Card>
        {activeStory.milestones.length > 0 ? (
          <Card>
            <Text style={[styles.heading, { color: C.text }]}>Milestones</Text>
            {activeStory.milestones.map((milestone) => <Text key={milestone.id} style={{ color: C.dim }}>{milestone.title} - year {milestone.year}</Text>)}
          </Card>
        ) : null}
        {activeStory.finished ? (
          <Card>
            <Text style={[styles.heading, { color: C.text }]}>Game Over</Text>
            <Text style={[styles.body, { color: C.text }]}>{activeStory.summary}</Text>
          </Card>
        ) : null}
        <GameplayBottomMenu />
      </Shell>
    );
  }

  if (screen === "character" && activeStory) {
    return (
      <Shell>
        <View style={styles.rowBetween}>
          <Text style={[styles.titleSmall, { color: C.text }]}>Character</Text>
          <Button small label="Back" onPress={() => setScreen("chronicle")} />
        </View>
        <Card>
          <View style={styles.characterHeader}>
            <PortraitImage subject={activeStory.player} size="hero" highlight />
            <View style={styles.characterHeaderText}>
              <Text style={[styles.heading, { color: C.text }]}>{activeStory.player.firstName} {activeStory.player.familyName}</Text>
              <Text style={{ color: C.dim }}>{activeStory.player.birthStatus} - {activeStory.player.bloodline} - {activeStory.player.sex}</Text>
              <Text style={{ color: C.dim }}>Age {activeStory.player.age}</Text>
              <Text style={{ color: C.dim }}>Gold: {activeStory.player.gold}</Text>
              {activeStory.player.birthStatus === "Bastard" ? <Text style={{ color: C.warning }}>Legitimacy Doubt: {activeStory.player.legitimacyDoubt}{activeStory.player.visibleBastardSigns ? ` - ${bastardSuspicionFeature(activeStory.player)} invites suspicion` : ""}</Text> : null}
              {activeStory.player.birthStatus === "Bastard" ? <Text style={{ color: C.dim }}>Support: {activeStory.player.legitimacySupport.noble}/{activeStory.player.legitimacySupport.requiredNoble} nobles or {activeStory.player.legitimacySupport.royal}/1 royals</Text> : null}
            </View>
          </View>
          <PlayerStatStrip story={activeStory} />
        </Card>
        <Card>
          <Text style={[styles.heading, { color: C.text }]}>Possessions</Text>
          {activeStory.player.possessions.length === 0 ? <Text style={[styles.body, { color: C.text }]}>Nothing carried.</Text> : null}
          {activeStory.player.possessions.map((item, index) => (
            <Pressable
              key={item}
              onLongPress={() => setDraggingPossession(item)}
              onPress={draggingPossession && draggingPossession !== item ? () => dropPossessionOn(item) : undefined}
              style={[styles.itemRow, { borderColor: C.line }, draggingPossession === item && styles.relationCardDragging]}
            >
              <Text style={[styles.body, styles.itemName, { color: C.text }]}>{titleCase(item)} - worth {activeStory.player.possessionValues[item] ?? 0} gold</Text>
              <View style={styles.wrapRow}>
                <Button small label="Up" onPress={() => movePossession(item, -1)} disabled={index === 0} />
                <Button small label="Down" onPress={() => movePossession(item, 1)} disabled={index === activeStory.player.possessions.length - 1} />
                <Button small label="Sell" onPress={() => changePossession(item, "Sell")} />
                <Button small label="Abandon" onPress={() => changePossession(item, "Abandon")} />
              </View>
            </Pressable>
          ))}
        </Card>
        <Button label="Back" onPress={() => setScreen("chronicle")} />
      </Shell>
    );
  }

  if (screen === "journal" && activeStory) {
    const messages: StoryMessage[] = activeStory.storyMessages?.length
      ? activeStory.storyMessages
      : activeStory.yearLog.flatMap((entry) => entry.lines.map((line) => ({ id: `${entry.year}-${line}`, speaker: "GM" as const, text: line })));
    const archivedMessages = messages.slice(0, Math.max(0, messages.length - 5));
    return (
      <Shell>
        <View style={styles.rowBetween}>
          <Text style={[styles.titleSmall, { color: C.text }]}>Journal</Text>
          <Button small label="Back" onPress={() => setScreen("chronicle")} />
        </View>
        {archivedMessages.length === 0 ? <Text style={[styles.subtitle, { color: C.dim }]}>Older story text will appear here after more than five responses.</Text> : null}
        {archivedMessages.map((message) => (
          <Card key={message.id}>
            <Text style={[styles.storySpeaker, { color: message.speaker === "Player" ? C.accent : C.gold }]}>{message.speaker}</Text>
            <Text style={[styles.body, { color: C.text }]}>{message.text}</Text>
            {message.roll ? <Text style={[styles.rollText, { color: C.dim }]}>{message.roll}</Text> : null}
          </Card>
        ))}
        <Button label="Back" onPress={() => setScreen("chronicle")} />
      </Shell>
    );
  }

  if (screen === "paper" && activeStory) {
    const rulers = activeStory.royalFamily.filter((person) => person.royalTitle);
    const heirs = activeStory.royalFamily.filter((person) => person.successionRank).sort((a, b) => (a.successionRank ?? 99) - (b.successionRank ?? 99));
    return (
      <Shell>
        <View style={styles.rowBetween}>
          <Text style={[styles.titleSmall, { color: C.text }]}>Daily Paper</Text>
          <Button small label="Back" onPress={() => setScreen("chronicle")} />
        </View>
        <Card>
          <Text style={[styles.heading, { color: C.text }]}>Royal Family Tree</Text>
          <View style={styles.treeRow}>
            {rulers.map((person) => <TreeNode key={person.id} person={person} />)}
          </View>
          {heirs.length > 0 ? (
            <>
              <Text style={[styles.treeLine, { color: C.dim }]}>|</Text>
              <View style={styles.treeRow}>
                {heirs.map((person) => <TreeNode key={person.id} person={person} />)}
              </View>
            </>
          ) : null}
        </Card>
        <Card>
          <Text style={[styles.heading, { color: C.text }]}>Outer Politics</Text>
          {activeStory.outerPolitics.map((line) => <Text key={line} style={[styles.body, { color: C.text }]}>{line}</Text>)}
        </Card>
        <Card>
          <Text style={[styles.heading, { color: C.text }]}>Inner Politics</Text>
          {activeStory.innerPolitics.map((line) => <Text key={line} style={[styles.body, { color: C.text }]}>{line}</Text>)}
        </Card>
        <Button label="Back" onPress={() => setScreen("chronicle")} />
      </Shell>
    );
  }

  if (screen === "family" && activeStory) {
    const player = activeStory.player;
    const grandparents = activeStory.family.filter((person) => person.relation === "Grandfather" || person.relation === "Grandmother");
    const parents = activeStory.family.filter((person) => person.relation === "Mother" || person.relation === "Father");
    const auntUncles = activeStory.family.filter((person) => person.relation === "Aunt" || person.relation === "Uncle");
    const cousins = activeStory.family.filter((person) => person.relation === "Cousin");
    const siblings = activeStory.family.filter((person) => person.relation === "Sibling" || person.relation === "Half Sibling");
    const childrenAndWards = activeStory.family.filter((person) => person.relation === "Child" || person.relation === "Ward");
    const spouseRelation = activeStory.player.spouseId ? activeStory.relations.find((relation) => relation.id === activeStory.player.spouseId) : undefined;
    const spousePerson = spouseRelation
      ? makePerson({
          id: spouseRelation.id,
          firstName: spouseRelation.firstName,
          familyName: spouseRelation.familyName,
          sex: spouseRelation.sex,
          relation: "Spouse",
          age: spouseRelation.age,
          birthStatus: spouseRelation.birthStatus,
          bloodline: spouseRelation.bloodline,
          origin: spouseRelation.origin,
          hairStyle: spouseRelation.hairStyle,
          hairColor: spouseRelation.hairColor,
          spouseId: player.id
        })
      : null;
    const playerRoyalRecord = activeStory.royalFamily.find((person) => person.id === player.id || fullName(person) === fullName(player));
    const playerNode: Person = { id: player.id, firstName: player.firstName, familyName: player.familyName, sex: player.sex, age: player.age, birthStatus: player.birthStatus, bloodline: player.bloodline, origin: player.origin, hairStyle: player.hairStyle, hairColor: player.hairColor, relation: "You", parentIds: parents.map((parent) => parent.id), spouseId: spousePerson?.id, royalTitle: playerRoyalRecord?.royalTitle, successionRank: playerRoyalRecord?.successionRank, alive: player.alive };
    return (
      <Shell>
        <Text style={[styles.titleSmall, { color: C.text }]}>Family Tree</Text>
        <View style={styles.row}>
          <Button small label="Zoom -" onPress={() => setTreeZoom((zoom) => clamp(Number((zoom - 0.1).toFixed(1)), 0.7, 1.6))} />
          <Button small label={`${treeZoom.toFixed(1)}x`} onPress={() => undefined} disabled />
          <Button small label="Zoom +" onPress={() => setTreeZoom((zoom) => clamp(Number((zoom + 0.1).toFixed(1)), 0.7, 1.6))} />
        </View>
        <Text style={[styles.subtitle, { color: C.dim }]}>Drag or scroll sideways to move through the tree.</Text>
        <ScrollView
          ref={familyTreeRef}
          horizontal
          style={[styles.treeViewport, { borderColor: C.line }]}
          onLayout={(event) => setTreeViewportWidth(event.nativeEvent.layout.width)}
        >
          <View style={[styles.treeCanvas, { transform: [{ scale: treeZoom }] }]}>
            <View style={styles.treeGeneration}>
              <Text style={[styles.treeSectionLabel, { color: C.dim }]}>Grandparent Generation</Text>
              <View style={styles.treeRow}>{grandparents.map((person) => <TreeNode key={person.id} person={person} />)}</View>
            </View>
            {grandparents.length > 0 || parents.length > 0 || auntUncles.length > 0 ? <View style={[styles.treeStem, { backgroundColor: C.line }]} /> : null}
            <View style={styles.treeGeneration}>
              <Text style={[styles.treeSectionLabel, { color: C.dim }]}>Parent Generation</Text>
              <View style={styles.treeGenerationRow}>
                {parents.length > 0 ? (
                  <View style={[styles.treeKinGroup, styles.treePrimaryGroup, { backgroundColor: C.panel2, borderColor: C.line }]}>
                    <Text style={[styles.treeGroupLabel, { color: C.dim }]}>Parents</Text>
                    <View style={styles.treeRow}>{parents.map((person) => <TreeNode key={person.id} person={person} />)}</View>
                  </View>
                ) : null}
                {auntUncles.length > 0 ? (
                  <View style={[styles.treeKinGroup, { backgroundColor: C.panel2, borderColor: C.line }]}>
                    <Text style={[styles.treeGroupLabel, { color: C.dim }]}>Aunts And Uncles</Text>
                    <View style={styles.treeRow}>{auntUncles.map((person) => <TreeNode key={person.id} person={person} />)}</View>
                  </View>
                ) : null}
              </View>
            </View>
            <View style={[styles.treeStem, { backgroundColor: C.line }]} />
            <View style={styles.treeGeneration}>
              <Text style={[styles.treeSectionLabel, { color: C.dim }]}>Player Generation</Text>
              <View style={styles.treeGenerationRow}>
                <View style={[styles.treeKinGroup, styles.treePrimaryGroup, { backgroundColor: C.panel2, borderColor: C.line }]}>
                  <Text style={[styles.treeGroupLabel, { color: C.dim }]}>You And Siblings</Text>
                  <View style={styles.treeRow}>
                    <TreeNode person={playerNode} highlight />
                    {siblings.map((person) => <TreeNode key={person.id} person={person} />)}
                  </View>
                </View>
                {cousins.length > 0 ? (
                  <View style={[styles.treeKinGroup, { backgroundColor: C.panel2, borderColor: C.line }]}>
                    <Text style={[styles.treeGroupLabel, { color: C.dim }]}>Cousins</Text>
                    <View style={styles.treeRow}>{cousins.map((person) => <TreeNode key={person.id} person={person} />)}</View>
                  </View>
                ) : null}
              </View>
            </View>
            {spousePerson ? (
              <View style={styles.spouseBranch}>
                <Text style={[styles.treeLine, { color: C.dim }]}>|--</Text>
                <TreeNode person={spousePerson} />
              </View>
            ) : null}
            {childrenAndWards.length > 0 ? (
              <>
                <Text style={[styles.treeLine, { color: C.dim }]}>|</Text>
                <View style={styles.treeRow}>
                  {childrenAndWards.map((person) => <TreeNode key={person.id} person={person} />)}
                </View>
              </>
            ) : null}
          </View>
        </ScrollView>
        <Button label="Back" onPress={() => setScreen("chronicle")} />
      </Shell>
    );
  }

  function TreeNode({ person, highlight = false }: { person: Person; highlight?: boolean }) {
    const married = marriageText(person);
    const royalLabel = successionLabel(person);
    const canOpen = activeStory?.relations.some((relation) => relation.id === person.id || relation.familyPersonId === person.id) ?? false;
    return (
      <Pressable onPress={canOpen ? () => focusRelationFromTree(person.id) : undefined} style={[styles.treeNode, rankFrameFor(person.birthStatus), { backgroundColor: highlight ? C.accent : C.panel, opacity: canOpen || highlight ? 1 : 0.82 }, !person.alive && styles.deadTile]}>
        <View style={styles.treeNodeHeader}>
          <PortraitImage subject={person} size="thumb" highlight={highlight} />
          <Text style={[styles.treeNodeName, { color: highlight ? "#fff" : C.text }]}>{person.firstName} {person.familyName}</Text>
        </View>
        <Text style={{ color: highlight ? "#fff" : C.dim }}>{titleCase(person.relation)} - {person.sex} - age {person.age}</Text>
        {royalLabel ? <Text style={{ color: C.gold, fontWeight: "800" }}>{royalLabel}</Text> : null}
        {married ? <Text style={{ color: highlight ? "#fff" : C.warning }}>{married}</Text> : null}
      </Pressable>
    );
  }

  if (screen === "relationships" && activeStory) {
    const focusedRelation = focusedRelationId
      ? activeStory.relations.find((relation) => relation.id === focusedRelationId || relation.familyPersonId === focusedRelationId)
      : null;
    const relationSections = focusedRelation
      ? [{ key: relationCategory(activeStory, focusedRelation), title: "Character Sheet", relations: [focusedRelation] }]
      : ([
          { key: "family", title: "Family", relations: activeStory.relations.filter((relation) => relationCategory(activeStory, relation) === "family") },
          { key: "palace", title: "Palace", relations: activeStory.relations.filter((relation) => relationCategory(activeStory, relation) === "palace") },
          { key: "city", title: "City", relations: activeStory.relations.filter((relation) => relationCategory(activeStory, relation) === "city") }
        ] as { key: RelationCategory; title: string; relations: Relation[] }[]);
    const renderRelationCard = (relation: Relation, categoryRelations: Relation[]) => {
      const cardColors = relationCardColors(relation);
      const isDragging = draggingRelationId === relation.id;
      const categoryIndex = categoryRelations.findIndex((candidate) => candidate.id === relation.id);
      const relationTextColor = relation.alive ? C.text : "#d2d2d2";
      const relationDimColor = relation.alive ? C.dim : "#a8a8a8";
      const relationWarningColor = relation.alive ? C.warning : "#bcbcbc";
      const spouseName = spouseNameFor(relation);
      const visibleNote = relation.note && relation.note !== "Known since the beginning of the chronicle." ? relation.note : null;
      return (
        <Pressable
          key={relation.id}
          onLongPress={() => setDraggingRelationId(relation.id)}
          onPress={draggingRelationId && draggingRelationId !== relation.id ? () => dropRelationOn(relation.id) : undefined}
          style={[styles.card, styles.relationCard, isDragging && styles.relationCardDragging, cardColors, !relation.alive && styles.deadTile, !relation.alive && styles.deadRelationCard]}
        >
          <View style={styles.relationCardGrid}>
            <View style={styles.relationMainColumn}>
              <View style={styles.relationHeader}>
                <PortraitImage subject={relation} size="thumb" />
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={[styles.heading, styles.relationName, { color: relationTextColor }]}>{relation.firstName} {relation.familyName}</Text>
                  <Text style={{ color: relationDimColor }}>{titleCase(relation.relation)} - {relation.sex} - age {relation.age}</Text>
                  {successionLabel(relation) ? <Text style={{ color: relation.alive ? C.gold : "#d0d0d0", fontWeight: "800" }}>{successionLabel(relation)}</Text> : null}
                  {spouseName ? <Text style={{ color: relationWarningColor }}>Married to {spouseName}</Text> : null}
                  {!relation.spouseId && relation.age >= 14 ? <Text style={{ color: relationWarningColor }}>Not married</Text> : null}
                  {relation.isWard ? <Text style={{ color: relationWarningColor }}>Ward - not romanceable</Text> : null}
                  {!relation.alive ? <Text style={{ color: relationWarningColor }}>Dead</Text> : null}
                  {visibleNote ? <Text style={{ color: relationDimColor }}>{visibleNote}</Text> : null}
                </View>
              </View>
              <RelationStatStrip relation={relation} />
            </View>
            <View style={styles.relationActionColumn}>
              <View style={styles.relationOrderRow}>
                <Button small label="Up" onPress={() => moveRelationWithinCategory(relation.id, -1)} disabled={!relation.alive || categoryIndex <= 0} />
                <Button small label="Down" onPress={() => moveRelationWithinCategory(relation.id, 1)} disabled={!relation.alive || categoryIndex >= categoryRelations.length - 1} />
              </View>
              {relation.allianceFormed ? (
                <View>
                  <Text style={[styles.label, styles.relationActionLabel, { color: relationDimColor }]}>Influence Target</Text>
                  <View style={styles.relationActionList}>
                    {activeStory.relations
                      .filter((target) => target.id !== relation.id && target.alive)
                      .slice(0, 8)
                      .map((target) => (
                        <Chip
                          key={target.id}
                          label={fullName(target)}
                          selected={influenceTargets[relation.id] === target.id}
                          disabled={!relation.alive}
                          onPress={() => setInfluenceTargets((current) => ({ ...current, [relation.id]: target.id }))}
                        />
                      ))}
                  </View>
                </View>
              ) : null}
              <View style={styles.relationActionList}>
                {availableRelationActions(activeStory, relation).map((action) => (
                  <Chip key={action} label={action} selected={false} disabled={activeStory.finished || !relation.alive || (relation.actionUses[action] ?? 0) >= relation.actionLimit} onPress={() => interact(relation.id, action)} />
                ))}
              </View>
            </View>
          </View>
        </Pressable>
      );
    };
    return (
      <Shell>
        <View style={styles.rowBetween}>
          <Text style={[styles.titleSmall, { color: C.text }]}>{focusedRelation ? "Character Sheet" : "Relationships"}</Text>
          <Button small label="Back" onPress={() => { setFocusedRelationId(null); setScreen("chronicle"); }} />
        </View>
        {focusedRelation ? <Button label="All Relationships" onPress={() => setFocusedRelationId(null)} /> : null}
        {activeStory.relations.length === 0 ? <Text style={[styles.subtitle, { color: C.dim }]}>No relations yet. Visit places to meet people.</Text> : null}
        {relationSections.map((section) => (
          <View key={section.title} style={styles.relationshipSection}>
            <Text style={[styles.heading, { color: C.text }]}>{section.title}</Text>
            {section.relations.length === 0 ? <Text style={[styles.subtitle, { color: C.dim }]}>No one known here yet.</Text> : null}
            {section.relations.map((relation) => renderRelationCard(relation, section.relations))}
          </View>
        ))}
        <Button label="Back" onPress={() => { setFocusedRelationId(null); setScreen("chronicle"); }} />
      </Shell>
    );
  }

  if (screen === "load") {
    const active = stories.filter((story) => !story.finished && story.player.alive);
    const activeMysteries = mysteries.filter((mystery) => !mystery.finished);
    return (
      <Shell>
        <Text style={[styles.titleSmall, { color: C.text }]}>Load Game</Text>
        {active.length === 0 && activeMysteries.length === 0 ? <Text style={[styles.subtitle, { color: C.dim }]}>No living chronicles or open cases yet.</Text> : null}
        {active.map((story) => (
          <Card key={story.id}>
            <Text style={[styles.heading, { color: C.text }]}>{story.title}</Text>
            <Text style={{ color: C.dim }}>{story.player.firstName}, {story.player.sex}, age {story.player.age}, year {story.currentYear}</Text>
            <View style={styles.row}>
              <Button small label="Open" onPress={() => { setActiveStoryId(story.id); setScreen("chronicle"); }} />
              <Button small label="Delete Save" onPress={() => removeStory(story.id)} variant="warning" />
            </View>
          </Card>
        ))}
        {activeMysteries.map((mystery) => (
          <Card key={mystery.id}>
            <Text style={[styles.heading, { color: C.text }]}>{mystery.title}</Text>
            <Text style={{ color: C.dim }}>{mystery.player.firstName} {mystery.player.familyName}, {mystery.player.sex}, age {mysteryPlayerAge(mystery.player)}, day {mystery.day}, {mystery.daytime}</Text>
            <View style={styles.row}>
              <Button small label="Open" onPress={() => { setActiveMysteryId(mystery.id); setScreen("mystery"); }} />
              <Button small label="Delete Save" onPress={() => removeMystery(mystery.id)} variant="warning" />
            </View>
          </Card>
        ))}
        <Button label="Back" onPress={() => setScreen("menu")} />
      </Shell>
    );
  }

  if (screen === "past") {
    const past = stories.filter((story) => story.finished);
    const pastMysteries = mysteries.filter((mystery) => mystery.finished);
    return (
      <Shell>
        <Text style={[styles.titleSmall, { color: C.text }]}>Past Games</Text>
        {past.length === 0 && pastMysteries.length === 0 ? <Text style={[styles.subtitle, { color: C.dim }]}>No finished chronicles or closed cases yet.</Text> : null}
        {past.map((story) => (
          <Card key={story.id}>
            <Text style={[styles.heading, { color: C.text }]}>{story.title}</Text>
            <Text style={[styles.body, { color: C.text }]}>{story.summary}</Text>
            <Button small label="Delete Report" onPress={() => removeStory(story.id)} />
          </Card>
        ))}
        {pastMysteries.map((mystery) => (
          <Card key={mystery.id}>
            <Text style={[styles.heading, { color: C.text }]}>{mystery.title}</Text>
            <Text style={[styles.body, { color: C.text }]}>{mystery.summary ?? (mystery.won ? "The case was solved." : "The case ended unsolved.")}</Text>
            <Text style={[styles.rollText, { color: mystery.won ? C.good : C.warning }]}>{mystery.won ? "Won" : "Lost"}</Text>
            <Button small label="Delete Report" onPress={() => removeMystery(mystery.id)} />
          </Card>
        ))}
        <Button label="Back" onPress={() => setScreen("menu")} />
      </Shell>
    );
  }

  if (screen === "settings") {
    return (
      <Shell>
        <Text style={[styles.titleSmall, { color: C.text }]}>Settings</Text>
        <Card>
          <Text style={[styles.label, { color: C.dim }]}>Theme</Text>
          <View style={styles.row}>
            <Button small label="Dark Story Book" onPress={() => setThemeName("dark")} />
            <Button small label="Pastel Story Book" onPress={() => setThemeName("pastel")} />
          </View>
          <Text style={[styles.body, { color: C.text }]}>Sound and language options will live here later.</Text>
        </Card>
        <Button label="Back" onPress={() => setScreen("menu")} />
      </Shell>
    );
  }

  return null;

  function createRelationFromPlace(story: Story, place: string): Relation {
    const noblePlace = ["palace halls", "palace gardens", "throne room", "counsil room", "ball room", "private chambers", "chambers"].includes(place);
    return createKnownRelation({
      firstName: pick(firstNames),
      familyName: noblePlace ? pick(familyNames) : pick([...familyNames, "No-House", "Riverborn", "Dockhand"]),
      relation: relationKindForPlace(place, story.player.birthStatus),
      age: place === "home" || place === "palace halls" ? clamp(story.player.age + pick([-20, -12, -8, -4, 0, 3, 7, 12]), 0, 80) : clamp(story.player.age + pick([-8, -4, 0, 3, 7, 12]), 12, 80),
      birthStatus: noblePlace ? pick<BirthStatus>(["Royal", "Noble", "Bastard"]) : pick<BirthStatus>(["Noble", "Bastard", "Commoner"]),
      category: noblePlace ? "palace" : "city",
      origin: pick(origins),
      trust: 35 + Math.floor(Math.random() * 25),
      romance: 0,
      resentment: 0,
      alive: true,
      note: `Met in the ${place} during year ${story.currentYear}.`
    });
  }
}

function articleFor(status: BirthStatus): string {
  return status === "Royal" ? "a" : status === "Noble" ? "a" : status === "Bastard" ? "a" : "a";
}

function encounterChance(status: BirthStatus, place: string): number {
  if (place === "private chambers" || place === "chambers" || place === "home") return 0.18;
  if (status === "Royal" && (place === "throne room" || place === "counsil room")) return 0.42;
  if (place === "tavern" || place === "market" || place === "docks") return 0.5;
  if (place === "slums" || place === "sewers") return 0.38;
  return 0.32;
}

function relationKindForPlace(place: string, status: BirthStatus): string {
  if (place === "throne room" || place === "counsil room") return "Court Contact";
  if (place === "ball room" || place === "palace gardens") return status === "Royal" ? "Suitor" : "Noble Acquaintance";
  if (place === "tavern") return "Drinking Companion";
  if (place === "slums" || place === "sewers") return "Dangerous Contact";
  if (place === "docks") return "Dockside Informant";
  if (place === "forest") return "Wanderer";
  return "Acquaintance";
}

function describePlaceVisit(story: Story, place: string, useNumber: number, relation: Relation | null): string {
  const p = story.player;
  const status = p.birthStatus.toLowerCase();
  const blood = p.bloodline;
  const outfit = `${p.clothColor.toLowerCase()} ${p.clothing.toLowerCase()}`;
  const pressure = p.birthStatus === "Bastard" && p.visibleBastardSigns
    ? "every familiar feature making silence expensive"
    : p.birthStatus === "Royal"
      ? "guards, expectation, and inheritance moving with every step"
      : p.birthStatus === "Commoner"
        ? "coin counted twice and every noble glance measured carefully"
        : "house pride wrapped around every polite word";
  const details = [
    `${p.firstName} entered the ${place} as ${articleFor(p.birthStatus)} ${status}, the ${outfit} making every glance linger a moment longer.`,
    `${p.faceTrait} and ${blood} marked ${p.firstName} before a word was spoken in the ${place}.`,
    `On visit ${useNumber} to the ${place}, ${p.firstName}'s ${status} name carried ${status === "bastard" ? "old insult and stubborn opportunity" : status === "royal" ? "command, danger, and expectation" : "weight enough to open doors and sharpen knives"}.`,
    `${p.firstName} moved through the ${place} with ${p.honor > 60 ? "a reputation still polished" : "a reputation people tested in whispers"}.`,
    `${p.firstName} crossed the ${place} with ${pressure}.`
  ];
  const response = pick(details);
  if (!relation) return response;
  return `${response} There, ${relation.firstName} ${relation.familyName}, a ${titleCase(relation.relation)}, entered the chronicle.`;
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  backgroundImage: { flex: 1 },
  backgroundTint: { flex: 1 },
  scroll: { flex: 1 },
  container: { padding: 20, gap: 14 },
  fixedBottomContent: { paddingBottom: 92 },
  menuContainer: { flexGrow: 1, justifyContent: "flex-end", paddingBottom: 34 },
  overline: { fontSize: 15, letterSpacing: 4, marginTop: 12, textTransform: "uppercase" },
  title: { fontSize: 48, lineHeight: 54, fontWeight: "300" },
  titleSmall: { fontSize: 34, lineHeight: 40, fontWeight: "300" },
  subtitle: { fontSize: 17, lineHeight: 24 },
  menuTextShadow: {
    textShadowColor: "rgba(0, 0, 0, 0.42)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 8
  },
  card: { borderWidth: 1, borderRadius: 8, padding: 16, gap: 10 },
  deadTile: { backgroundColor: "#2f3033", borderColor: "#858585", borderWidth: 2, shadowColor: "#707070", shadowOpacity: 0.18, shadowRadius: 4, elevation: 0 },
  deadRelationCard: { backgroundColor: "#303136", shadowOpacity: 0.12 },
  relationCard: { gap: 8, padding: 12 },
  relationCardGrid: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  relationMainColumn: { flex: 1, minWidth: 0, gap: 8 },
  relationActionColumn: { width: 132, gap: 8, alignItems: "stretch" },
  relationOrderRow: { flexDirection: "row", flexWrap: "wrap" },
  relationActionList: { flexDirection: "row", flexWrap: "wrap", justifyContent: "flex-start" },
  relationActionLabel: { fontSize: 10 },
  relationName: { fontSize: 19, lineHeight: 23 },
  relationCardDragging: { opacity: 0.72 },
  focusedMysteryNpcCard: { borderWidth: 2, shadowOpacity: 0.28, shadowRadius: 10, elevation: 4 },
  relationHeader: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  relationshipSection: { gap: 10 },
  field: { gap: 6 },
  label: { fontSize: 13, letterSpacing: 2, textTransform: "uppercase" },
  input: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 12, fontSize: 16 },
  notesInput: { minHeight: 150, textAlignVertical: "top" },
  button: { minHeight: 48, borderRadius: 8, paddingHorizontal: 16, alignItems: "center", justifyContent: "center", marginRight: 8, marginTop: 6 },
  buttonSmall: { minHeight: 40 },
  buttonText: { color: "#fff", fontWeight: "700" },
  chip: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, marginRight: 8, marginBottom: 8 },
  chipText: { color: "#fff", fontWeight: "600" },
  row: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 6 },
  rowBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  wrapRow: { flexDirection: "row", flexWrap: "wrap" },
  heading: { fontSize: 22, fontWeight: "700" },
  body: { fontSize: 16, lineHeight: 23, marginTop: 4 },
  clickableNpcName: { fontWeight: "800", textDecorationLine: "underline" },
  storyFrame: { borderWidth: 1, borderRadius: 8, overflow: "hidden", padding: 8, gap: 8 },
  storyPanelRow: { flexDirection: "row", minHeight: 250, gap: 8 },
  storyPlacePanel: { width: 116, minHeight: 250, borderRadius: 8, overflow: "hidden" },
  storyPlaceImage: { opacity: 0.92 },
  storyPlaceTint: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 10, backgroundColor: "rgba(10, 7, 7, 0.42)" },
  storyPlaceLabel: { color: "#e9d4b6", fontSize: 17, lineHeight: 20, fontWeight: "400" },
  storyYearNumber: { color: "#f5e3c8", fontSize: 52, lineHeight: 58, fontWeight: "300" },
  storyPlaceSmall: { color: "#d5c0a4", fontSize: 10, textTransform: "uppercase", marginTop: 8 },
  storyPlaceName: { color: "#f5e3c8", fontSize: 15, lineHeight: 20, fontWeight: "700", textAlign: "center" },
  storyTextPanel: { flex: 1, minWidth: 0, borderWidth: 1, borderRadius: 8, padding: 12, gap: 8 },
  storyPlayerHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  storyPlayerHeaderText: { flex: 1, minWidth: 0 },
  storyPlayerName: { fontSize: 20, lineHeight: 24 },
  storyBackground: { minHeight: 470 },
  storyBackgroundImage: { opacity: 0.82 },
  storyTint: { flex: 1, minHeight: 470, padding: 16, gap: 10 },
  storyMessages: { maxHeight: 160 },
  storyBubble: { borderWidth: 1, borderRadius: 8, padding: 10, marginBottom: 8 },
  storyMessageBlock: { marginBottom: 10 },
  storySpeaker: { fontSize: 12, fontWeight: "800", letterSpacing: 1.4, textTransform: "uppercase" },
  rollText: { fontSize: 12, lineHeight: 16 },
  storyChoiceStack: { gap: 6 },
  storyChoiceRow: { minHeight: 38, borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, justifyContent: "center" },
  storyChoiceText: { fontSize: 11, fontWeight: "900", letterSpacing: 1.2, textTransform: "uppercase" },
  storyChoiceMeta: { fontSize: 10, fontWeight: "700", marginTop: 2, textTransform: "uppercase" },
  storyInputPanel: { minHeight: 76, borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 9, paddingRight: 86, justifyContent: "center" },
  storyInputRow: { flexDirection: "row", alignItems: "flex-end", gap: 8 },
  storyInput: { minHeight: 40, maxHeight: 90, paddingHorizontal: 0, paddingVertical: 0, fontSize: 14, textAlignVertical: "top" },
  storySendButton: { position: "absolute", right: 8, top: 10 },
  storyCount: { position: "absolute", left: 12, bottom: 8 },
  scenePill: { borderRadius: 8, overflow: "hidden", paddingHorizontal: 10, paddingVertical: 7, fontSize: 12, fontWeight: "800", textTransform: "uppercase" },
  portrait: { width: 132, minHeight: 224, borderWidth: 1, borderRadius: 8, padding: 10, alignItems: "center", justifyContent: "space-between" },
  portraitStage: { fontSize: 11, textTransform: "uppercase" },
  portraitImageFrame: { width: 72, height: 128, borderWidth: 1, borderRadius: 8, overflow: "hidden" },
  portraitHeroFrame: { width: 114, height: 190, borderWidth: 1, borderRadius: 8, overflow: "hidden" },
  portraitImage: { width: "100%", height: "100%" },
  ravenwoodPortraitSheet: { position: "absolute" },
  portraitResidentFrame: { width: 72, height: 122, borderWidth: 1, borderRadius: 8, overflow: "hidden" },
  portraitMapFrame: { width: 40, height: 68, borderWidth: 1, borderRadius: 8, overflow: "hidden" },
  portraitThumbFrame: { width: 36, height: 62, borderWidth: 1, borderRadius: 8, overflow: "hidden" },
  portraitThumb: { width: "100%", height: "100%" },
  picturelessPortrait: { alignItems: "center", justifyContent: "center", gap: 4 },
  picturelessInitials: { fontWeight: "900", textAlign: "center" },
  picturelessMeta: { fontWeight: "700", textTransform: "uppercase", textAlign: "center" },
  portraitHairOverlayLarge: { position: "absolute", left: 6, top: -3, width: 62, height: 62 },
  portraitHairOverlayThumb: { position: "absolute", left: 3, top: -1, width: 30, height: 30 },
  deadPortraitFrame: { backgroundColor: "#242528", borderColor: "#777" },
  deadPortraitWash: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(110, 110, 110, 0.26)" },
  face: { width: 58, height: 58, borderRadius: 29, alignItems: "center", justifyContent: "center" },
  faceText: { color: "#fff", fontSize: 28, fontWeight: "800" },
  portraitName: { fontWeight: "700", fontSize: 16 },
  portraitDetail: { fontSize: 11, textAlign: "center" },
  stat: { marginTop: 4 },
  bar: { height: 8, borderRadius: 8, overflow: "hidden", marginTop: 5 },
  barFill: { height: "100%", borderRadius: 8 },
  statStrip: { flexDirection: "row", alignItems: "stretch", borderWidth: 1, borderRadius: 8, overflow: "hidden", marginTop: 12, paddingVertical: 9 },
  statStripItem: { flex: 1, minWidth: 0, alignItems: "center", justifyContent: "center", paddingHorizontal: 7, borderRightWidth: 1 },
  statStripItemLast: { borderRightWidth: 0 },
  statStripLabel: { fontSize: 8, lineHeight: 11, fontWeight: "900", letterSpacing: 0, textTransform: "uppercase" },
  statStripValue: { fontSize: 24, lineHeight: 30, fontWeight: "300", marginTop: 2 },
  statStripBar: { width: "100%", maxWidth: 48, height: 5, borderRadius: 8, overflow: "hidden", marginTop: 7 },
  statStripFill: { height: "100%", borderRadius: 8 },
  relationStatStrip: { flexDirection: "row", borderWidth: 1, borderRadius: 8, overflow: "hidden", paddingVertical: 7 },
  relationStatItem: { flex: 1, minWidth: 0, alignItems: "center", justifyContent: "center", paddingHorizontal: 6, borderRightWidth: 1 },
  relationStatLabel: { fontSize: 8, lineHeight: 11, fontWeight: "900", letterSpacing: 0, textTransform: "uppercase" },
  relationStatValue: { fontSize: 21, lineHeight: 26, fontWeight: "300", marginTop: 1 },
  relationStatBar: { width: "100%", maxWidth: 44, height: 5, borderRadius: 8, overflow: "hidden", marginTop: 5 },
  mysteryTrustPill: { minWidth: 56, minHeight: 34, borderWidth: 1, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, alignItems: "center", justifyContent: "center" },
  mysteryTrustPillLabel: { fontSize: 8, lineHeight: 10, fontWeight: "900", textTransform: "uppercase" },
  mysteryTrustPillValue: { fontSize: 18, lineHeight: 20, fontWeight: "800" },
  gameHiddenText: { color: "#b97cff", fontWeight: "800" },
  discoverableHiddenText: { color: "#8fd3ff", fontWeight: "800" },
  characterHeader: { flexDirection: "row", alignItems: "center", gap: 14 },
  characterHeaderText: { flex: 1, minWidth: 0, gap: 4 },
  fixedBottomMenu: { position: "absolute", left: 0, right: 0, bottom: 0, paddingHorizontal: 12, paddingTop: 8, paddingBottom: 14, borderTopWidth: 1, borderColor: "rgba(255,255,255,0.12)" },
  bottomMenu: { flexDirection: "row", borderWidth: 1, borderRadius: 8, overflow: "hidden", marginTop: 8 },
  bottomMenuItem: { flex: 1, minHeight: 48, alignItems: "center", justifyContent: "center", paddingHorizontal: 4, borderRightWidth: 1 },
  bottomMenuText: { fontSize: 12, fontWeight: "800", textAlign: "center" },
  mysteryHeaderProfile: { flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 10, flex: 1, minWidth: 0 },
  mysteryHeaderName: { flexShrink: 1, textAlign: "right" },
  detectiveCarousel: { gap: 14, paddingRight: 12 },
  detectiveCard: { width: 268, borderWidth: 1, borderRadius: 8, padding: 14, gap: 10, alignItems: "center" },
  detectiveName: { textAlign: "center" },
  detectiveQuirkList: { alignSelf: "stretch", gap: 8, marginTop: 4 },
  detectiveQuirkRow: { borderTopWidth: 1, paddingTop: 8 },
  detectiveQuirkText: { marginTop: 0 },
  detectiveModifierGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  detectiveAgeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  detectiveAgeCard: { width: 148, borderWidth: 1, borderRadius: 8, padding: 12, alignItems: "center", gap: 8 },
  detectiveAgeLabel: { fontSize: 18, lineHeight: 22 },
  mysteryStoryFrame: { minHeight: 0 },
  mysteryDayPanel: { alignItems: "center", justifyContent: "center", padding: 10, borderWidth: 1, borderColor: "rgba(240, 196, 92, 0.28)" },
  ravenwoodBubbleBackdrop: { overflow: "hidden" },
  ravenwoodBubbleBackdropImage: { borderRadius: 8 },
  mysterySceneHeader: { minHeight: 144, borderWidth: 1, borderRadius: 8, padding: 10, flexDirection: "row", alignItems: "center", gap: 12 },
  mysterySceneMeta: { flex: 1, minWidth: 0, justifyContent: "center" },
  mysterySceneMetaRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  mysteryScenePlaceBlock: { flex: 1, minWidth: 0 },
  mysteryScenePlaceName: { color: "#f5e3c8", fontSize: 21, lineHeight: 26, fontWeight: "800" },
  mysteryTextPanelWide: { minHeight: 190 },
  mysteryStoryMessages: { maxHeight: 230 },
  mysteryFloorBlock: { gap: 8, marginTop: 8 },
  mysteryFloorTitle: { fontSize: 15, fontWeight: "800", textTransform: "uppercase" },
  mysteryDossierGrid: { gap: 4 },
  relationshipLedgerBox: { borderWidth: 1, borderRadius: 8, padding: 10, gap: 4 },
  ledgerBox: { borderWidth: 1, borderRadius: 8, padding: 10, gap: 3, maxHeight: 420 },
  ledgerText: { fontSize: 11, lineHeight: 15, fontFamily: "monospace" },
  mysteryMapGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  mysteryRoomTile: { width: "48%", minHeight: 112, borderWidth: 1, borderRadius: 8, padding: 10, gap: 6 },
  mysteryRoomName: { fontSize: 14, fontWeight: "800" },
  mapPortraitButton: { borderRadius: 8 },
  treeViewport: { borderWidth: 1, borderRadius: 8, minHeight: 560 },
  treeCanvas: { width: FAMILY_TREE_CANVAS_WIDTH, minHeight: 540, alignItems: "center", justifyContent: "center", padding: 24 },
  treeGeneration: { width: "100%", alignItems: "center", marginVertical: 6 },
  treeGenerationRow: { width: "100%", flexDirection: "row", alignItems: "flex-start", justifyContent: "center", gap: 28 },
  treeKinGroup: { borderWidth: 1, borderRadius: 8, padding: 12, alignItems: "center", minWidth: 280, maxWidth: 760 },
  treePrimaryGroup: { minWidth: 520 },
  treeGroupLabel: { fontSize: 11, fontWeight: "800", letterSpacing: 1.3, textTransform: "uppercase", marginBottom: 4 },
  treeStem: { width: 2, height: 26, opacity: 0.72 },
  treeRow: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 12, marginVertical: 8 },
  treeLine: { fontSize: 30, textAlign: "center" },
  treeNode: { width: 206, borderWidth: 1, borderRadius: 8, padding: 12 },
  treeNodeHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 },
  treeNodeName: { fontSize: 16, fontWeight: "800" },
  treeSectionLabel: { fontSize: 12, letterSpacing: 1.5, textTransform: "uppercase", marginTop: 4 },
  spouseBranch: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 4 },
  itemRow: { borderTopWidth: 1, paddingTop: 10, gap: 8, flexDirection: "row", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" },
  itemName: { flexShrink: 1, fontWeight: "800", minWidth: 180 },
  modalShade: { flex: 1, backgroundColor: "rgba(0, 0, 0, 0.62)", alignItems: "center", justifyContent: "center", padding: 20 },
  modalCard: { width: "100%", maxWidth: 420, borderWidth: 1, borderRadius: 8, padding: 16, gap: 10 }
});
