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
import type { ImageSourcePropType, StyleProp, ViewStyle } from "react-native";
import {
  ravenwoodGuestPortraitAssets,
  ravenwoodPlayerPortraitAssets,
  ravenwoodStaffPortraitAssets
} from "./ravenwoodPortraitAssets";
import type { MysteryVisualRace, RavenwoodGuestPortraitAsset } from "./ravenwoodPortraitAssets";

type ThemeName = "dark" | "pastel";
type Screen = "menu" | "load" | "past" | "settings" | "mysteryDetectiveSelect" | "mysteryPortraitSelect" | "mystery" | "mysteryCharacter" | "mysteryRelations" | "mysteryFamilyTree" | "mysteryMap" | "mysteryJournal";
type Sex = "Female" | "Male";

type CharacterDraft = {
  firstName: string;
  familyName: string;
  sex: Sex;
  origin: string;
  hairStyle: string;
  hairColor: string;
  faceTrait?: string;
};

type StoryMessageSegment = {
  text: string;
  color?: string;
  npcId?: string;
};

type StoryMessage = {
  id: string;
  speaker: "GM" | "Ravenwood Mansion" | "Player" | "System";
  text: string;
  icon?: IconDumpKey;
  roll?: string;
  rich?: StoryMessageSegment[];
  archiveDay?: number;
  archiveDaytime?: Daytime;
};
type Daytime = "Morning" | "Breakfast" | "Midday" | "Lunch" | "Afternoon" | "Evening" | "Night" | "Midnight";

type MysteryCheckKind = "Athletics" | "History" | "Search" | "Medicine" | "Charisma" | "Persuasion" | "Deception" | "Sleight of Hand" | "Stealth" | "Composure" | "Rizz";

type MysteryDetectiveQuirk = {
  id: string;
  label: string;
  check: MysteryCheckKind;
  modifier: number;
};

type MysteryDetectiveProfile = Pick<CharacterDraft, "firstName" | "familyName" | "sex" | "origin" | "hairStyle" | "hairColor"> & {
  id: string;
  portraitLineage: string;
  visualRace: MysteryVisualRace;
  faceTrait?: string;
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
  temporaryTrust: number;
  romance: number;
  romanceRevealed: boolean;
  substancePreference: "none" | "alcohol" | "cigarettes" | "weed" | "alcohol and cigarettes" | "alcohol and weed";
  substanceState: "sober" | "tipsy" | "drunk" | "high";
  substanceTurns: number;
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

type MysteryFindableKind = "Proof" | "Snatchable";

type MysteryFindable = {
  id: string;
  kind: MysteryFindableKind;
  name: string;
  description: string;
  origin?: "Crime" | "Drama" | "Abandoned" | "House" | "Neutral";
  roomId?: string;
  holderNpcId?: string;
  availableDay: number;
  availableDaytime: Daytime;
  relatedMurderIndex?: number;
  proofText?: string;
  collected?: boolean;
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
  availableDay?: number;
  availableDaytime?: Daytime;
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
  findables: MysteryFindable[];
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

const appBackgrounds: Record<ThemeName, ImageSourcePropType[]> = {
  dark: [
    require("./assets/backgrounds/app-dark-ink.png"),
    require("./assets/backgrounds/app-dark-slate.png"),
    require("./assets/backgrounds/app-dark-burgundy.png"),
    require("./assets/backgrounds/app-dark-purple.png"),
    require("./assets/backgrounds/app-dark-red.png")
  ],
  pastel: [
    require("./assets/backgrounds/app-light-silver.png"),
    require("./assets/backgrounds/app-light-parchment.png"),
    require("./assets/backgrounds/app-light-green.png"),
    require("./assets/backgrounds/app-light-peach.png"),
    require("./assets/backgrounds/app-light-lavender.png")
  ]
};

function appBackgroundForScreen(themeName: ThemeName, screen: Screen): ImageSourcePropType {
  const backgrounds = appBackgrounds[themeName];
  const screenOrder: Screen[] = [
    "load",
    "past",
    "settings",
    "mysteryDetectiveSelect",
    "mysteryPortraitSelect",
    "mystery",
    "mysteryCharacter",
    "mysteryRelations",
    "mysteryFamilyTree",
    "mysteryMap",
    "mysteryJournal"
  ];
  const index = Math.max(0, screenOrder.indexOf(screen));
  return backgrounds[index % backgrounds.length];
}

type IconDumpKey = "magnifier" | "book" | "candle" | "shadowPortrait" | "bag" | "key" | "letter" | "document" | "money" | "death" | "cards" | "vial";
const iconAssets: Record<IconDumpKey, { source: ImageSourcePropType; width: number; height: number; scale?: number; offsetX?: number; offsetY?: number }> = {
  magnifier: { source: require("./assets/ravenwood/icons/magnifier.png"), width: 138, height: 158, scale: 0.96, offsetX: -1, offsetY: 1 },
  book: { source: require("./assets/ravenwood/icons/book.png"), width: 158, height: 168, scale: 0.96, offsetX: -1, offsetY: 2 },
  candle: { source: require("./assets/ravenwood/icons/candle.png"), width: 160, height: 202, scale: 0.98, offsetY: -1 },
  shadowPortrait: { source: require("./assets/ravenwood/icons/shadow-portrait.png"), width: 146, height: 164, scale: 0.96, offsetY: 1 },
  bag: { source: require("./assets/ravenwood/icons/bag.png"), width: 168, height: 180, scale: 0.96, offsetY: 1 },
  key: { source: require("./assets/ravenwood/icons/key.png"), width: 179, height: 176, scale: 0.96 },
  letter: { source: require("./assets/ravenwood/icons/letter.png"), width: 185, height: 174, scale: 0.96 },
  document: { source: require("./assets/ravenwood/icons/document.png"), width: 177, height: 189, scale: 0.96 },
  money: { source: require("./assets/ravenwood/icons/money.png"), width: 158, height: 177, scale: 0.96 },
  death: { source: require("./assets/ravenwood/icons/death.png"), width: 178, height: 170, scale: 0.96 },
  cards: { source: require("./assets/ravenwood/icons/cards.png"), width: 198, height: 218, scale: 0.96 },
  vial: { source: require("./assets/ravenwood/icons/vial.png"), width: 178, height: 182, scale: 0.96 }
};

type MysteryRollOutcome = {
  check: MysteryCheckKind;
  die: number;
  modifier: number;
  total: number;
  tier: "failed" | "easy" | "medium" | "hard";
};

type MysteryAiReply = {
  text: string;
  trustDelta?: number;
  romanceDelta?: number;
  revealRomance?: boolean;
  usedAi?: boolean;
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

const RAVENWOOD_MIN_NPC_AGE = 9;
const RAVENWOOD_MAX_NPC_AGE = 75;
const RAVENWOOD_MIN_STAFF_AGE = 18;
const ravenwoodPlayerSelectableAges = [12, 16, 24, 30, 50];

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
    id: "lin-ward",
    firstName: "Lin",
    familyName: "Ward",
    origin: "Western Marches",
    hairStyle: "Wavy",
    hairColor: "Black",
    quirks: [
      { id: "dog", label: "Grew up with a retired search dog", check: "Search", modifier: 3 },
      { id: "memory", label: "Has photographic memory", check: "History", modifier: 3 },
      { id: "stairs", label: "Has an old bike-fall injury", check: "Athletics", modifier: -3 }
    ]
  },
  "player-custom01-row-02": {
    id: "adrian-locke",
    firstName: "Adrian",
    familyName: "Locke",
    origin: "Northlands",
    hairStyle: "Short",
    hairColor: "Black",
    quirks: [
      { id: "clock", label: "Repairs pocket watches for fun", check: "Sleight of Hand", modifier: 3 },
      { id: "soldier", label: "Binges medical drama series", check: "Medicine", modifier: 3 },
      { id: "temper", label: "Takes everything a little too personal", check: "Charisma", modifier: -3 }
    ]
  },
  "player-custom02-row-01": {
    id: "amara-voss",
    firstName: "Amara",
    familyName: "Voss",
    origin: "Deep Cities",
    hairStyle: "Long Straight",
    hairColor: "Blonde",
    quirks: [
      { id: "airbnb", label: "Cleans airbnbs", check: "Search", modifier: 3 },
      { id: "street", label: "Speaks street", check: "Persuasion", modifier: 3 },
      { id: "dizzy", label: "The sight of blood makes her dizzy", check: "Composure", modifier: -3 }
    ]
  },
  "player-custom02-row-02": {
    id: "hana-saito",
    firstName: "Hana",
    familyName: "Saito",
    origin: "Island Courts",
    hairStyle: "Messy Bun",
    hairColor: "Black",
    quirks: [
      { id: "garden", label: "Grew up tending kitchen gardens", check: "Medicine", modifier: 3 },
      { id: "quiet", label: "Has light, quiet walk", check: "Stealth", modifier: 3 },
      { id: "partner", label: "Never had a romantic interest before", check: "Rizz", modifier: -3 }
    ]
  },
  "player-custom02-row-03": {
    id: "felix-ashford",
    firstName: "Felix",
    familyName: "Ashford",
    origin: "Western Marches",
    hairStyle: "Wavy",
    hairColor: "Blonde",
    quirks: [
      { id: "mirror", label: "Acted in a couple of series", check: "Charisma", modifier: 3 },
      { id: "ledger", label: "Flirts like a pro", check: "Rizz", modifier: 3 },
      { id: "patient", label: "Does not know where the spoons are in his own kitchen", check: "Search", modifier: -3 }
    ]
  },
  "player-custom03-row-01": {
    id: "beatrice-gray",
    firstName: "Beatrice",
    familyName: "Gray",
    origin: "Northlands",
    hairStyle: "Long Straight",
    hairColor: "Ginger",
    quirks: [
      { id: "newspaper", label: "Enjoys browing the news, has an opinion on everything", check: "History", modifier: 3 },
      { id: "nurse", label: "Her mother was a nurse", check: "Medicine", modifier: 3 },
      { id: "clumsy", label: "Acts clumsy under pressure", check: "Sleight of Hand", modifier: -3 }
    ]
  },
  "player-custom03-row-02": {
    id: "nikhil-rao",
    firstName: "Nikhil",
    familyName: "Rao",
    origin: "Southern Provinces",
    hairStyle: "Curly",
    hairColor: "Black",
    quirks: [
      { id: "politics", label: "Family is in politics, he writes his father's speaches", check: "Persuasion", modifier: 3 },
      { id: "pressure", label: "Opeartes well under pressure", check: "Composure", modifier: 3 },
      { id: "lies", label: "Finds direct lies distasteful", check: "Deception", modifier: -3 }
    ]
  },
  "player-custom03-row-03": {
    id: "zadie-marlow",
    firstName: "Zadie",
    familyName: "Marlow",
    origin: "Harbor Quarter",
    hairStyle: "Braided",
    hairColor: "Dark Red",
    quirks: [
      { id: "cards", label: "Tells fortune from tartot cards", check: "Deception", modifier: 3 },
      { id: "weed", label: "Smuggles weed into festivals: never got caught", check: "Search", modifier: 3 },
      { id: "news", label: "Does not follow the news", check: "History", modifier: -3 }
    ]
  },
  "player-custom03-row-04": {
    id: "milo-keene",
    firstName: "Milo",
    familyName: "Keene",
    origin: "Deep Cities",
    hairStyle: "Messy Bun",
    hairColor: "Brown",
    quirks: [
      { id: "maps", label: "Sketches floor plans from memory", check: "Search", modifier: 3 },
      { id: "lie", label: "Spots a lie from a mile away", check: "Charisma", modifier: 3 },
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
      { id: "boxing", label: "Takes boxing lessons", check: "Athletics", modifier: 3 },
      { id: "perfume", label: "Wears a very expensive perfume", check: "Rizz", modifier: 3 },
      { id: "step", label: "Walks in a heavy, noisy way", check: "Stealth", modifier: -3 }
    ]
  },
  "player-custom04-row-02": {
    id: "lydia-fenwick",
    firstName: "Lydia",
    familyName: "Fenwick",
    origin: "Western Marches",
    hairStyle: "Curly",
    hairColor: "Ginger",
    quirks: [
      { id: "flower", label: "Organizes flowers in her aunts flower shop", check: "Sleight of Hand", modifier: 3 },
      { id: "cat", label: "Moves like a cat", check: "Stealth", modifier: 3 },
      { id: "face", label: "Vowed to always speak the truth", check: "Deception", modifier: -3 }
    ]
  },
  "player-custom04-row-04": {
    id: "soren-park",
    firstName: "Soren",
    familyName: "Park",
    origin: "Eastern Coast",
    hairStyle: "Shaved",
    hairColor: "Black",
    quirks: [
      { id: "poligraph", label: "Trained himself to decieve even a poligarph", check: "Deception", modifier: 3 },
      { id: "mask", label: "Never lets panic take over", check: "Composure", modifier: 3 },
      { id: "cardio", label: "Thinks cardio is overrated", check: "Athletics", modifier: -3 }
    ]
  },
  "player-player05-row-02": {
    id: "julian-north",
    firstName: "Julian",
    familyName: "North",
    origin: "Northlands",
    hairStyle: "Short",
    hairColor: "Brown",
    quirks: [
      { id: "ear", label: "Made a habit of eavesdropping", check: "Stealth", modifier: 3 },
      { id: "peace", label: "Resident peacemaker at family gatherings", check: "Charisma", modifier: 3 },
      { id: "government", label: "Scientologist", check: "History", modifier: -3 }
    ]
  },
  "player-player05-row-03": {
    id: "mira-nair",
    firstName: "Mira",
    familyName: "Nair",
    origin: "Southern Provinces",
    hairStyle: "Long Straight",
    hairColor: "Black",
    quirks: [
      { id: "cards", label: "Reads people very effectively at a poker table", check: "Deception", modifier: 3 },
      { id: "little", label: "Pays attention to the little things", check: "Search", modifier: 3 },
      { id: "rude", label: "Has a rude attitude", check: "Charisma", modifier: -3 }
    ]
  },
  "player-player05-row-04": {
    id: "edwin-crow",
    firstName: "Edwin",
    familyName: "Crow",
    origin: "Western Marches",
    hairStyle: "Curly",
    hairColor: "Dark Red",
    faceTrait: "Sharp-Boned",
    quirks: [
      { id: "trust", label: "Has a very trust worthy presence", check: "Charisma", modifier: 3 },
      { id: "laptop", label: "Brought his laptop that works with satellites", check: "History", modifier: 3 },
      { id: "stuff", label: "Respects anothers property", check: "Search", modifier: -3 }
    ]
  }
};

const ravenwoodDetectiveDisplayOrder = [
  "amara-voss",
  "adrian-locke",
  "hana-saito",
  "nikhil-rao",
  "beatrice-gray",
  "felix-ashford",
  "lin-ward",
  "soren-park",
  "zadie-marlow",
  "milo-keene",
  "lydia-fenwick",
  "julian-north",
  "mira-nair",
  "edwin-crow"
];

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
  })
  .sort((a, b) => {
    const aIndex = ravenwoodDetectiveDisplayOrder.indexOf(a.id);
    const bIndex = ravenwoodDetectiveDisplayOrder.indexOf(b.id);
    return (aIndex === -1 ? Number.MAX_SAFE_INTEGER : aIndex) - (bIndex === -1 ? Number.MAX_SAFE_INTEGER : bIndex);
  });

const initialDraft: CharacterDraft = {
  firstName: "",
  familyName: "",
  sex: "Female",
  origin: "Ravenwood",
  hairStyle: "Wavy",
  hairColor: "Black",
  faceTrait: "Sharp-Boned"
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

const daytimes: Daytime[] = ["Morning", "Breakfast", "Midday", "Lunch", "Afternoon", "Evening", "Night", "Midnight"];
const ravenwoodMurderDaytimes: Daytime[] = ["Afternoon", "Evening", "Night", "Midnight"];
function mysteryTimeSortValue(day: number, daytime: Daytime): number {
  return day * daytimes.length + daytimes.indexOf(daytime);
}

function mysteryTimeFromSortValue(value: number): { day: number; daytime: Daytime } {
  const day = Math.floor(value / daytimes.length);
  return { day, daytime: daytimes[value % daytimes.length] ?? "Morning" };
}

function mysteryGeneratedMurderSchedule(count: number): { day: number; daytime: Daytime }[] {
  const firstAllowed = mysteryTimeSortValue(2, "Afternoon");
  const lastAllowed = mysteryTimeSortValue(13, "Evening");
  const candidates: number[] = [];
  for (let day = 2; day <= 13; day += 1) {
    for (const daytime of ravenwoodMurderDaytimes) {
      const value = mysteryTimeSortValue(day, daytime);
      if (value >= firstAllowed && value <= lastAllowed) candidates.push(value);
    }
  }
  const selected: number[] = [];
  const pool = [...candidates];
  while (selected.length < count && pool.length > 0) {
    const value = pick(pool);
    selected.push(value);
    pool.splice(pool.indexOf(value), 1);
  }
  return selected.sort((a, b) => a - b).map(mysteryTimeFromSortValue);
}

function mysteryTimeHasArrived(currentDay: number, currentDaytime: Daytime, availableDay: number, availableDaytime: Daytime): boolean {
  return mysteryTimeSortValue(currentDay, currentDaytime) >= mysteryTimeSortValue(availableDay, availableDaytime);
}

function mysteryAvailabilityLabel(day: number, daytime: Daytime): string {
  return `Day ${day} ${daytime}`;
}

const ravenwoodHotelPremise = {
  identity: "Ravenwood is an isolated late-nineteenth-century country mansion converted into an exclusive private hotel in 1998.",
  mood: "beautiful, comfortable, and quietly unsettling; luxury hides decay, politeness hides resentment, and elegant rooms keep uncomfortable memories.",
  daytime: "Pale sunlight, faded wallpaper, polished wood, floral fabrics, dust, excellent meals, staff moving silently, and residents trying to look respectable.",
  night: "Cold corridors, firelight, long shadows, creaking floorboards, distant footsteps, and music from the ballroom or an old radio after bedtime.",
  isolation: "Storms, damaged phone lines, blocked roads, and old locked rooms can turn the hotel into a closed circle of suspects.",
  garden: "The garden terrace has a pool and an outdoor jacuzzi, both currently out of order."
};
const ravenwoodCommonRooms = ["grand-hall", "drawing-room", "dining-room", "library", "conservatory", "billiards-room", "smoking-room", "garden-terrace", "west-gallery"];
const ravenwoodSocialRooms = ["drawing-room", "dining-room", "library", "conservatory", "billiards-room", "smoking-room", "garden-terrace", "west-gallery"];
const ravenwoodMealTimes: Daytime[] = ["Breakfast", "Lunch"];
const ravenwoodDrinkTimes: Daytime[] = ["Lunch", "Evening", "Night"];
const ravenwoodPrivateBelongings = ["wallet", "room key", "cigarette case", "lighter", "folded letter", "matchbook", "medicine tin", "notebook", "fountain pen", "silver compact", "watch"];
const ravenwoodStaffBelongings = ["service key", "room ledger note", "laundry tag", "staff pencil", "matchbook", "cigarettes", "folded schedule", "pantry chit"];
const ravenwoodAiEndpoint = "http://localhost:8787/ravenwood-chat";
const mysteryMethods = [
  "Blunt-force trauma",
  "Stabbing with a knife or sharp tool",
  "Strangulation",
  "Suffocation with bedding",
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
  "Pushed from a balcony",
  "Pushed from a window",
  "Killed in a deliberately set fire",
  "Trapped in smoke from a controlled fire",
  "Electrical appliance placed into bathwater",
  "Fatal assault followed by concealment of the body",
  "Shot in the heart by a gun"
];
const mysteryLockdownReasons = ["a snow storm has buried the road", "a landslide has blocked the lower pass", "a heat wave has shut the rail line", "a rain storm has washed out the bridge", "a hurricane warning has closed the coast road", "nearby fighting has made travel impossible", "a police cordon has sealed the valley"];
const mysteryWitnessClues = [
  "Witness: {witness} heard {victim} threaten {killer} shortly before the murder, but will only speak after trust is gained.",
  "Witness: {witness} saw {killer} near the crime scene at an unusual hour and is frightened to say it openly.",
  "Witness: {witness} noticed {killer} changing clothes after the esitimated time of the murder, but will only speak after trust is gained.",
  "Witness: {witness} overheard {killer} and {victim} arguing about something, but will only speak after trust is gained.",
  "Witness: {witness} saw {killer} pass by a service route that does not match their public alibi and is frightened to say it openly."
];
const mysteryMotiveTemplates = [
  "To prevent {victim} from exposing {killer}'s affair with {linked_character}.",
  "To stop {victim} revealing that {killer} was secretly dating {linked_character}.",
  "To keep {victim} from exposing {killer}'s hidden engagement with {linked_character}.",
  "To stop {victim} revealing that {killer} is an addict.",
  "To prevent {victim} from telling {partner} about {killer}'s second relationship with {linked_character}.",
  "To stop {victim} revealing that {killer} had stolen money from work.",
  "To prevent {victim} from exposing {killer}'s gambling debts.",
  "To keep {victim} from proving that {killer} had killed before.",
  "To stop {victim} from revealing a blackmail scheme.",
  "To gain the inheritance from {victim}'s will."
];
const mysteryMinorMotiveTemplates = [
  "To stop {victim} revealing that {killer} had been in a forbidden room.",
  "To keep {victim} from telling they stole a key.",
  "To silence {victim} after being seen hiding evidence of a previous murder.",
  "To stop {victim} revealing a dangerous family secret.",
  "To prevent {victim} from exposing a lie about where {killer} had been.",
  "To keep {victim} from telling everyone about a broken object linked to the previous murder.",
  "To prevent {victim} from blaming {killer}'s family for the trouble."
];
const mysteryFamilyStatuses = ["Divorced", "Married", "Widowed", "Single", "In a relationship", "Engaged", "Secretly dating", "Secretly engaged", "In an open relationship", "On a break from a relationship", "Unsure", "Open to explore"];
const mysteryEducations = ["No formal education", "Some elementary school", "Completed elementary school", "Some secondary school", "Secondary school diploma", "Home-schooled through secondary level", "General education diploma", "Basic literacy training", "Customer service training", "Office administration training", "First aid training", "Food hygiene training", "Security guard training", "Basic bookkeeping training", "Legal secretary training", "Medical secretary training", "Receptionist training", "Executive assistant training", "Travel agent training", "Tour guide training", "Drama school training", "Police academy training", "Primary teacher training", "Trade apprenticeship"];
const mysteryInterests = ["Loves football", "Loves watching football", "Loves basketball", "Loves tennis", "Loves running", "Loves swimming", "Loves hiking", "Loves cooking", "Loves baking", "Loves gardening", "Loves reading mysteries", "Loves old films", "Loves opera", "Loves cards", "Loves antiques", "Loves photography", "Loves local history", "Loves cocktail recipes", "Loves chess", "Loves scandal columns"];
const mysterySecrets = [
  "Is deeply in debt.",
  "Has unpaid gambling debts.",
  "Has been borrowing money from {linked_character}.",
  "Is hiding a recent bankruptcy.",
  "Has been stealing small amounts of money from the hotel.",
  "Destroyed a letter in their room.",
  "Has been bribing {linked_character}.",
  "Is terrified that their private relationship will be discovered with {linked_character}.",
  "Is hiding a forged document.",
  "Has a criminal charge from years ago under another name."
];
const mysteryChildSecrets = [
  "Broke a valuable object in the manor and hid the pieces.",
  "Stole sweets from the kitchen and lied about it.",
  "Sneaked into a locked hallway and saw {linked_character} and {linked_character} arguing.",
  "Found a dropped key and has not told an adult.",
  "Read part of a private letter without understanding all of it.",
  "Is scared of {linked_character} but will not say why.",
  "Saw {linked_character} leaving a room late at night.",
  "Hid under a table during an argument and heard the name {linked_character}.",
  "Took a small trinket from {linked_character}'s room.",
  "Invented a false story to avoid being punished."
];
const mysteryTeenSecrets = [
  "Lied about where they were after dinner.",
  "Sneaked into a service corridor and saw {linked_character} sneak around.",
  "Has been reading a private letter belonging to {linked_character}.",
  "Took a small amount of money from the hotel and plans to put it back.",
  "Knows {linked_character} and {linked_character} argued in private but is afraid to say so.",
  "Is hiding a broken object from their guardian.",
  "Promised not to reveal a family argument between {linked_character} and {linked_character}.",
  "Found a suspicious item and hid it out of fear.",
  "Has been secretly listening at doors and heard {linked_character} argue with {linked_character}.",
  "Saw {linked_character} change clothes after a late-night incident."
];
const mysteryQuirks = [
  "Can hold their breath for two minutes.",
  "Has almost no sense of taste.",
  "Has a very weak sense of smell.",
  "Has an unusually strong sense of smell.",
  "Has a severe almond allergy.",
  "Always orders whiskey on the rocks.",
  "Is addicted to weed.",
  "Is addicted to cocaine.",
  "Is addicted to alcohol.",
  "Cannot sleep without an open window.",
  "Keeps a strict breakfast ritual.",
  "Collects coins.",
  "Has a fear of water.",
  "Is sensitive to smoke.",
  "Has a weak heart.",
  "Exessively using Xanax.",
  "Notices small changes in room arrangements.",
  "Counts their own steps.",
  "Writes names in the margin of newspapers.",
  "Never removes one glove in public.",
  "Keeps a dried flower pressed in a book.",
  "Refuses to sit with their back to a door.",
  "Remembers every room by its smell.",
  "Carries a tiny bottle of smelling salts.",
  "Will not touch silver cutlery.",
  "Has a habit of tapping glass before drinking.",
  "Keeps receipts folded into perfect squares.",
  "Checks window latches twice.",
  "Speaks to portraits when nervous.",
  "Never eats anything red.",
  "Always knows the exact time.",
  "Keeps a lucky button in their pocket."
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
  "Has a very weak sense of smell.",
  "Counts staircase steps under their breath.",
  "Keeps a dried flower pressed in a book.",
  "Refuses to sit with their back to a door.",
  "Checks window latches twice.",
  "Always knows the exact time.",
  "Keeps a lucky button in their pocket."
];
function mysteryUniqueQuirkFor(age: number, usedQuirks: Set<string>): string {
  const preferred = age < 14 ? mysteryChildQuirks : mysteryQuirks;
  const allQuirks = Array.from(new Set([...preferred, ...mysteryQuirks, ...mysteryChildQuirks]));
  const available = allQuirks.filter((quirk) => !usedQuirks.has(quirk));
  const quirk = pick(available.length > 0 ? available : allQuirks);
  usedQuirks.add(quirk);
  return quirk;
}
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
  { minAge: 21, occupation: "Bookbinder", educations: ["Trade apprenticeship", "Secondary school diploma"] },
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
  { minAge: 55, occupation: "Retired", educations: ["Secondary school diploma", "General education diploma", "Trade apprenticeship", "Office administration training"] }
];
const staffStations = ["kitchen", "staff-corridor", "servants-hall", "laundry", "pantry", "garden-terrace", "back-stairs"];
const ravenwoodMaleNames = ["Theodore", "Asher", "Cedric", "Soraaro", "Adrian", "Alaric", "Ambrose", "Arthur", "Bastian", "Benedict", "Blaise", "Caspian", "Dorian", "Edgar", "Edmund", "Elias", "Felix", "Florian", "Gabriel", "Gideon", "Hugo", "Jasper", "Julian", "Laurent", "Leander", "Leon", "Lucian", "Magnus", "Marcel", "Marius", "Oliver", "Percival", "Raphael", "Remy", "Rowan", "Sebastian", "Silas", "Soren", "Tristan", "Victor", "Vincent", "Xavier", "Elio", "Mael", "Noel", "Rafael", "Thierry", "Alejandro", "Alonso", "Cruz", "Diego", "Esteban", "Javier", "Leandro", "Lorenzo", "Mateo", "Santiago", "Dimitri", "Ilya", "Nikolai", "Stefan", "Akira", "Daichi", "Haru", "Hiro", "Itsuki", "Kaoru", "Kenji", "Ren", "Riku", "Sora", "Taejin", "Jun", "Minho", "Seojun", "Yichen", "Jian", "Lian", "Ming", "Renji", "Toma", "Alden", "Arden", "August", "Claude", "Corvin", "Elian", "Emil", "Evander", "Hadrian", "Hector", "Isidore", "Matthias", "Nicolas", "Octavian", "Orion", "Roman", "Sylvain", "Valentin", "Aurel", "Cassiel", "Lucien", "NicolĂˇs", "Aleksi", "Emilian", "Kasimir", "Lev", "Mikhail", "Emiliaric", "Laurenvin", "Sorenan", "Jasperric", "Hiroien", "Soraair", "Ilyaas", "Alaricien", "Rafaelien", "Yichenvren", "Kenjiar", "Junen", "Valesian", "Asheran", "Emilia", "Javierian", "Matthiasas", "Alaricrel", "Felixric", "Thierren", "Itsukiric", "Oliveris", "Silasis", "Mariusor", "Aurelar", "Rikuric", "Mikhaiiel", "Gabrievar", "Sylvairiel", "Isideo", "Sebastiaian", "Marcelvon", "Abel", "Abraham", "Achilles", "Adam", "Adelard", "Adrianus", "Aeneas", "Aidan", "Alban", "Albert", "Albin", "Albrecht", "Alessio", "Alfonso", "Alfred", "Alistair", "Alonzo", "Amadeo", "Ansel", "Anselm", "Anton", "Antonio", "Archer", "Armand", "Armin", "Arnold", "Arsen", "Arturo", "Auberon", "Augustin", "Aurelio", "Baptiste", "Barnaby", "Barrett", "Bartholomew", "Beau", "Bellamy", "Berenger", "Bernard", "Bertrand", "Blaine", "Boris", "Bowen", "Bram", "Brendan", "Briar", "Broderick", "Byron", "Caelan", "Caesar", "Caius", "Callum", "Calvin", "Cassian", "Cato", "Cillian", "Cyril", "Damian", "Dante", "Darius", "Dashiell", "Declan", "Desmond", "Dominic", "Donovan", "Drake", "Eamon", "Easton", "Edric", "Edwin", "Elric", "Emmanuel", "Enzo", "Eric", "Ernest", "Eryk", "Ethan", "Eugene", "Fabian", "Fabio", "Ferdinand", "Finn", "Finnian", "Francis", "Frederick", "Gareth", "Gaston", "Gael", "Geoffrey", "George", "Gerard", "Godric", "Grayson", "Gregor", "Griffin", "Hamish", "Harold", "Harlan", "Harvey", "Henrik", "Ignatius", "Isaac", "Ivan", "Jace", "James", "Jerome", "Joel", "Jonah", "Jonathan", "Jordan", "Kai", "Kieran", "Killian", "Kristian", "Lachlan", "Lars", "Lawrence", "Lazar", "Lennox", "Liam", "Linus", "Lionel", "Lorcan", "Louis", "Luca", "Lukas", "Luther", "Malachi", "Malcolm", "Manuel", "Marco", "Marcus", "Maxim", "Maximilian", "Micah", "Milan", "Miles", "Milo", "Morgan", "Nathaniel", "Neil", "Nero", "Neville", "Oscar", "Osric", "Owen", "Pascal", "Patrick", "Philip", "Pierce", "Quentin", "Quill", "Raoul", "Raymond", "Reece", "Reid", "Rhys", "Roderick", "Roland", "Ronan", "Rory", "Ruben", "Rufus", "Rupert", "Samson", "Samuel", "Saul", "Scott", "Shae", "Sheridan", "Simon", "Stellan", "Sullivan", "Tobias", "Ulric", "Ulysses", "Vaughn", "Viggo", "Walter", "Warren", "Wilfred", "William", "Wolfgang", "Wyatt", "Yannick", "Yorick", "Zachary", "Zane", "Zephyr", "Aldric", "Cassien", "Darien", "Elarion", "Lucarien", "Valeric", "Soravian", "Raphaelor", "Mikhailen", "Dorianis", "Cassianor", "Alarien", "Renjior", "Sylveric", "Leandros", "Evandriel", "Hadrien", "Lucanor", "Aurelios", "Theodren", "Kaelian", "Renvar", "Tavian", "Asterion", "Corvian", "Elianor", "Magnor", "Valerian", "Julorien", "Bastior", "Emilien"];
const ravenwoodFemaleNames = ["Adeline", "Aurelia", "Beatrice", "Belladonna", "Camille", "Cassandra", "Celeste", "Celine", "Clara", "Cordelia", "Dahlia", "Delphine", "Eleanor", "Elise", "Elodie", "Emmeline", "Estelle", "Evangeline", "Flora", "Genevieve", "Giselle", "Helena", "Isadora", "Ivy", "Josephine", "Juliette", "Lenore", "Lilian", "Lorelei", "Lucille", "Madeleine", "Margot", "Marielle", "Mireille", "Nadine", "Noelle", "Odette", "Ophelia", "Rosalie", "Sabine", "Selene", "Seraphine", "Sylvie", "Theodora", "Valentina", "Vesper", "Victoria", "Vivienne", "Willow", "Amara", "AnaĂŻs", "Aveline", "Cressida", "Elara", "Fleur", "Isabeau", "Lavinia", "Melisande", "Ondine", "Alba", "Amalia", "Catalina", "Elena", "Esmeralda", "InĂ©s", "Isabella", "Lucia", "Marisol", "Paloma", "Anastasia", "Danica", "Irina", "Katya", "Milena", "Nadia", "Oksana", "Svetlana", "Tatiana", "Zoya", "Aiko", "Akari", "Emi", "Hana", "Haruka", "Kaede", "Mei", "Miyu", "Reina", "Yuna", "Chaewon", "Haeun", "Jisoo", "Nari", "Sora", "Xia", "Yue", "Lian", "Meilin", "Rin", "InĂ©syne", "Jisooa", "Sabineina", "Josephinora", "Reinaalia", "Isada", "Willowyne", "Irinaia", "Valentinis", "Isadorira", "Katyais", "Seraphi", "Aikois", "Marieuna", "Seleneuna", "Palomarea", "Elenaenne", "Helenaa", "InĂ©selle", "Naria", "Chaewira", "Xiaea", "Sabineora", "Evangelineora", "Meiis", "Rinea", "Hanaette", "Kaedeenne", "Harukaina", "Danicaia", "Emiora", "Giselleline", "Briaris", "Akariyne", "AnaĂŻsina", "Emieria", "Irinavenne", "Loreleiia", "Reinaina", "Aikoira", "Abigail", "Adelaide", "Adelina", "Adriana", "Agatha", "Agnes", "Alessandra", "Alessia", "Alexandra", "Alice", "Alicia", "Alina", "Althea", "Amanda", "Amber", "Amelia", "Amelie", "Anastasie", "Angelique", "Annabelle", "Annalise", "Annika", "Antonia", "Arabella", "Ariadne", "Ariella", "Astrid", "Athena", "Audrey", "Autumn", "Avelina", "Azalea", "Bianca", "Blair", "Blythe", "Briony", "Calista", "Calliope", "Camellia", "Carina", "Caroline", "Catriona", "Cecelia", "Cecilia", "Cerise", "Charlotte", "Chiara", "Chloe", "Clarissa", "Clementine", "Colette", "Cosette", "Cynthia", "Daphne", "Delia", "Diana", "Dominique", "Edith", "Eileen", "Eleanora", "Eliana", "Elina", "Elisa", "Eliska", "Elliana", "Eloisa", "Elowen", "Elsa", "Emilia", "Emilie", "Enya", "Erika", "Esme", "Eulalia", "Eulalie", "Euphemia", "Evelyn", "Faith", "Felicia", "Felicity", "Fern", "Fiorella", "Florence", "Francesca", "Freya", "Gabriella", "Gemma", "Georgiana", "Gwendolyn", "Gwyneth", "Hazel", "Heidi", "Honora", "Imogen", "Iona", "Iris", "Isabelle", "Isolde", "Jacinta", "Jade", "Jessamine", "Joanna", "Jocelyn", "June", "Karina", "Katarina", "Laurel", "Leona", "Leontine", "Letitia", "Liora", "Lisette", "Loretta", "Louisa", "Louise", "Lucinda", "Lydia", "Lyra", "Mabel", "Maeve", "Magnolia", "Marceline", "Marina", "Matilda", "Meredith", "Minerva", "Mirabel", "Miranda", "Monica", "Morgana", "Nerissa", "Nina", "Oriana", "Ottilie", "Pandora", "Penelope", "Petra", "Philippa", "Phoebe", "Primrose", "Regina", "Renata", "Rosalind", "Rosemary", "Roxanne", "Ruby", "Sabrina", "Samantha", "Scarlett", "Serena", "Simone", "Sofia", "Sophie", "Stella", "Susanna", "Tabitha", "Thalia", "Theresa", "Tiffany", "Ursula", "Vanessa", "Vera", "Veronica", "Violet", "Virginia", "Willa", "Winifred", "Winter", "Yvette", "Zara", "Zinnia", "Altheia", "Araminta", "Belinda", "Bernadette", "Capucine", "Carlotta", "Celestine", "Clarimond", "Corinne", "Desiree", "Dominiquea", "Dorothea", "Eleanore", "Elisabetta", "Ernestine", "Euphrasie", "Florentine", "Geraldine", "Henrietta", "Hestia", "Isaline", "Jessamyn", "Leonie", "Lilou", "Liselotte", "Maelle", "Magdalene", "Maribelle", "Marigold", "Melina", "Mirabelle", "Noemi", "Ottavia", "Prisca", "Romilly", "Solene", "Tatienne", "Valencia", "Verena", "Yolande", "ZĂ©lie"];
const ravenwoodSurnames = ["Ash", "Black", "Briar", "Crow", "Dusk", "Elder", "Ember", "Ever", "Fair", "Fallow", "Fern", "Frost", "Glen", "Grey", "Hallow", "Hawke", "Hazel", "Hollow", "Iron", "Ivory", "Lark", "Marlowe", "Mist", "Moon", "Night", "Oak", "Raven", "Rose", "Rowan", "Sable", "Shadow", "Silver", "Snow", "Star", "Stone", "Storm", "Thorn", "Vale", "Vane", "Winter", "Wren", "Wilde", "Wood", "Bell", "Blake", "Byron", "Carrow", "Dacre", "Darcy", "Devereux", "Fairfax", "Graves", "Hale", "Harrow", "Hart", "Huxley", "Locke", "March", "Morrow", "Poe", "Quill", "Reeve", "Sinclair", "Sterling", "Thorne", "Voss", "Whitlock", "Wycliffe", "Arden", "Beaumont", "Bellefleur", "Clairmont", "Delacroix", "Desmarais", "Duval", "Fontaine", "Laurent", "Lenoir", "Moreau", "Rochefort", "Valmont", "Villiers", "AlarcĂłn", "Delgado", "Montoya", "Navarro", "Salazar", "Serrano", "ValdĂ©s", "Vega", "Volkov", "Morozov", "Orlov", "Petrov", "Romanov", "Sokolov", "Vasiliev", "Dragomir", "Takeda", "Kuroda", "Mori", "Akiyama", "Hayashi", "Ishikawa", "Han", "Seo", "Kang", "Jin", "Lin", "Shen", "Wei", "Zhao", "Crowbyron", "La Zhaofield", "Von Crowhurst", "La Salazarvane", "La Duvalclair", "Della Mistmere", "La Thornewick", "St. Lockebridge", "Del Fernember", "Du Thornridge", "Bellbridge", "St. Zhaowood", "Von Irondell", "St. Fallowclair", "Delgadoquill", "Villiersstone", "Du Wycliffehart", "Le Wood", "Von Seostorm", "Hayashihayashi", "Du Seomont", "Blakefield", "Le Fontainemoor", "De Fernwell", "Larkmist", "Le Halerose", "De Jinsokolov", "Le Snowfield", "Shadowwinter", "Van Fairfaxthorne", "MoreaualarcĂłn", "La Stonestar", "Della Morozovstone", "Von Vasilievwood", "Ravenwinter", "Van Elderhurst", "Vasilievshade", "Du Ravenshade", "Du Darcy", "Evercliff", "Von Duvalmont", "Le Jinhurst", "Del Starsterling", "De Hallow", "De Thornerose", "La Ravenarden", "De Ardenbrook", "Della Fallowwood", "La Fallowclair", "La Fontainecourt", "La Beaumontbridge", "Silverwinter", "Glenhart", "St. Hazelzhao", "De Huxleyrose", "St. Clairmontromanov", "Devereuxhurst", "Roseshade", "Del Vasilievgrave", "Van Romanovwick", "Du Fairthorne","Ashcroft", "Ashbourne", "Ashfield", "Ashmere", "Ashford", "Ashwell", "Blackthorn", "Blackwood", "Blackwell", "Blackridge", "Blackmoor", "Blackstone", "Briarwood", "Briarfield", "Briarwell", "Crowhurst", "Crowley", "Crowmere", "Crowfield", "Crowstone", "Duskridge", "Duskmere", "Duskwood", "Elderwood", "Eldermere", "Elderbrook", "Elderfield", "Emberstone", "Emberwood", "Emberfield", "Everbrook", "Everfield", "Evermere", "Fairbrook", "Fairmont", "Fairfield", "Fallowmere", "Fallowbrook", "Fernbrook", "Fernfield", "Fernwick", "Frostmere", "Frostfield", "Frostwick", "Glenbrook", "Glenmere", "Greybrook", "Greyfield", "Greywick", "Greyhaven", "Greymoor", "Hallowmere", "Hallowbrook", "Hawkridge", "Hawkstone", "Hazelbrook", "Hazelfield", "Hazelwick", "Hollowbrook", "Hollowmere", "Ironbrook", "Ironfield", "Ivorybrook", "Ivoryfield", "Larkfield", "Larkwood", "Mistbrook", "Mistfield", "Mistmere", "Moonbrook", "Moonridge", "Nightbrook", "Nightfield", "Oakridge", "Oakmere", "Oakfield", "Ravenhurst", "Ravenwood", "Ravenmere", "Rosebrook", "Rosefield", "Rowanbrook", "Sablewood", "Sablemere", "Shadowbrook", "Shadowmere", "Silverbrook", "Silvermere", "Snowbrook", "Snowmere", "Starbrook", "Starfield", "Stonebrook", "Stonefield", "Stormbrook", "Stormfield", "Thornbrook", "Thornfield", "Thornmere", "Valebrook", "Valefield", "Winterbrook", "Wintermere", "Wrenfield", "Wildemere", "Woodcroft", "Woodmere"];

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

function mysteryRoomsForMethod(method: string, rooms: MysteryRoom[], playerRoomId: string): MysteryRoom[] {
  const lower = method.toLowerCase();
  const candidates = rooms.filter((room) => room.id !== playerRoomId && (room.kind !== "guest" || room.accessible));
  const byIds = (ids: string[]) => candidates.filter((room) => ids.includes(room.id));
  if (lower.includes("bathwater") || lower.includes("bath")) return candidates.filter((room) => room.kind === "guest");
  if (lower.includes("pool") || lower.includes("pond")) return byIds(["garden-terrace"]);
  if (lower.includes("food") || lower.includes("allergen")) return byIds(["dining-room", "kitchen", "pantry"]);
  if (lower.includes("drink") || lower.includes("poison")) return byIds(["dining-room", "smoking-room", "billiards-room", "drawing-room", "pantry"]);
  if (lower.includes("medication") || lower.includes("injection")) return byIds(["guest-room-1", "guest-room-2", "guest-room-3", "guest-room-4", "guest-room-5", "guest-room-6", "guest-room-7", "guest-room-8", "guest-room-9", "guest-room-10", "servants-hall"]);
  if (lower.includes("staircase")) return byIds(["back-stairs", "grand-hall"]);
  if (lower.includes("balcony") || lower.includes("window")) return byIds(["west-gallery", "garden-terrace", "guest-room-1", "guest-room-2", "guest-room-3", "guest-room-4", "guest-room-5", "guest-room-6", "guest-room-7", "guest-room-8", "guest-room-9", "guest-room-10"]);
  if (lower.includes("carbon monoxide") || lower.includes("gas")) return byIds(["staff-corridor", "back-stairs", "servants-hall", "laundry", "kitchen"]);
  if (lower.includes("electrocution") || lower.includes("electrical")) return byIds(["bathroom", "laundry", "staff-corridor", "guest-room-1", "guest-room-2", "guest-room-3", "guest-room-4", "guest-room-5", "guest-room-6", "guest-room-7", "guest-room-8", "guest-room-9", "guest-room-10"]);
  if (lower.includes("fire") || lower.includes("smoke")) return byIds(["library", "smoking-room", "west-gallery", "staff-corridor", "back-stairs"]);
  return candidates;
}

function mysteryMethodClues(method: string): string[] {
  const kind = mysteryMethodKind(method);
  if (kind === "drink") return [
    "A glass near {victim}'s seat carries bitter smell.",
    "A glass near {victim}'s body carries a hair strand that matches {killer}'s.",
    "A bar receipt shows {killer} ordered the same rare bottle later found beside {victim}."
  ];
  if (kind === "food") return [
    "A serving plate from {victim}'s setting contains a residue that was not found on the other plates.",
    "A kitchen order slip shows {killer} requested a private dish for {victim}.",
    "A discarded paper packet with poison residue was hidden behind the pantry flour tins."
  ];
  if (kind === "allergen") return [
    "The dessert served to {victim} contains an allergen that was not listed on the kitchen card.",
    "A torn menu note about {victim}'s allergy can be found in {killer}'s trash.",
    "The pantry jar holding the allergen was currently opened."
  ];
  if (kind === "drug") return [
    "A pill bottle with missing tablets was hidden in {killer}'s sock drawer.",
    "Powder residue was found in a folded paper inside {killer}'s coat pocket.",
    "The medicine cabinet log was altered beside the line for the dose used on {victim}."
  ];
  if (kind === "strangulation" || kind === "smother") return [
    "Fibers matching {killer}'s scarf were found near {victim}'s throat and collar.",
    "A torn strip of bedding hidden in a laundry basket in {killer}'s room matches marks on {victim}.",
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
    "The oil can in the service cupboard has a fresh smear of soot."
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
    "A blood trace was wiped from the edge of a table near the attack.",
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
    "A forged document in {killer}'s handwriting was hidden inside a locked writing case in {killer}'s room.",
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
    "A fresh footprint can be fund in crime scene that matches the shoe type that {killer} wears.",
    "A dropped personal item belonging to {killer} was found on the route away from the scene.",
    "A bross that belong to {killer} was found under the nearest door.",
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

function mysteryFindableAvailability(findable: MysteryFindable, day: number, daytime: Daytime): boolean {
  return !findable.collected && mysteryTimeHasArrived(day, daytime, findable.availableDay, findable.availableDaytime);
}

function mysteryInventoryIconFor(item: string): IconDumpKey | undefined {
  const lower = item.toLowerCase();
  if (/\b(vial|vials|medicine vial|medicine vials|drug container|drug containers|empty drug|ampoule|ampoules)\b/.test(lower)) return "vial";
  if (/\b(card|cards|deck)\b/.test(lower)) return "cards";
  if (/\bkey\b/.test(lower)) return "key";
  if (/\b(letter|letters)\b/.test(lower)) return "letter";
  if (/\b(money|coin|coins|gold|cash|bill|bills|fund|funds)\b/.test(lower)) return "money";
  if (/\b(document|documents|paper|papers|ledger|slip|slips|will|id card|receipt|permit|contract|deed|certificate|notebook|note)\b/.test(lower)) return "document";
  return undefined;
}

function mysteryPreciseMotiveProof(motive: string, killer: MysteryNpc, victim: MysteryNpc): { name: string; locationNote: string } {
  const lower = motive.toLowerCase();
  if (lower.includes("police") || lower.includes("earlier killing") || lower.includes("previous murder") || lower.includes("had killed")) {
    return {
      name: `Unsent statement by ${fullName(victim)} accusing ${fullName(killer)} of an earlier murder`,
      locationNote: `hidden inside ${fullName(victim)}'s writing case`
    };
  }
  if (lower.includes("forged") || lower.includes("document")) {
    return {
      name: `Forged ID card with ${fullName(killer)}'s photo on it`,
      locationNote: `under the bed in ${fullName(killer)}'s room`
    };
  }
  if (lower.includes("debt") || lower.includes("gambling") || lower.includes("money")) {
    return {
      name: `Debt ledger page listing ${fullName(killer)} beside ${fullName(victim)}'s deadline`,
      locationNote: `inside the locked writing case in ${fullName(killer)}'s room`
    };
  }
  if (lower.includes("inheritance") || lower.includes("will")) {
    return {
      name: `Altered inheritance letter naming ${fullName(killer)} and ${fullName(victim)}`,
      locationNote: `folded into the lining of ${fullName(killer)}'s travel bag`
    };
  }
  if (lower.includes("relationship") || lower.includes("dating") || lower.includes("engagement") || lower.includes("affair")) {
    return {
      name: `Private letter proving ${fullName(victim)} knew about ${fullName(killer)}'s hidden relationship`,
      locationNote: `inside a book on ${fullName(killer)}'s bedside table`
    };
  }
  if (lower.includes("blackmail")) {
    return {
      name: `Blackmail note naming ${fullName(killer)} with ${fullName(victim)}'s deadline`,
      locationNote: `behind a loose drawer in ${fullName(victim)}'s room`
    };
  }
  if (lower.includes("stolen") || lower.includes("theft") || lower.includes("brib")) {
    return {
      name: `Marked cash envelope tied to ${fullName(killer)}'s theft`,
      locationNote: `behind folded linen in ${fullName(killer)}'s room`
    };
  }
  return {
    name: `Torn note explaining why ${fullName(victim)} threatened ${fullName(killer)}`,
    locationNote: `under the writing blotter in ${fullName(killer)}'s room`
  };
}

function mysteryPreciseMethodProof(method: string, killer: MysteryNpc, victim: MysteryNpc, roomName: string): string {
  const kind = mysteryMethodKind(method);
  if (kind === "drink") return `Poisoned glass from ${fullName(victim)}'s place setting with ${fullName(killer)}'s fingerprint on the stem`;
  if (kind === "food") return `Serving plate from ${fullName(victim)}'s setting with residue from ${fullName(killer)}'s private packet`;
  if (kind === "allergen") return `Kitchen allergy card altered in ${fullName(killer)}'s handwriting`;
  if (kind === "drug") return `Medicine vial with missing dose and ${fullName(killer)}'s initials scratched into the label`;
  if (kind === "strangulation" || kind === "smother") return `Torn fabric strip matching ${fullName(killer)}'s scarf and marks on ${fullName(victim)}`;
  if (kind === "blade") return `Bloodied letter opener from ${roomName} wrapped in ${fullName(killer)}'s handkerchief`;
  if (kind === "fire") return `Matchbook from ${fullName(killer)}'s room found at the first burn point`;
  if (kind === "gas") return `Gas valve wrench with fresh marks matching ${fullName(killer)}'s service access`;
  if (kind === "water") return `Damp towel from ${fullName(killer)}'s room hidden after ${fullName(victim)} drowned`;
  if (kind === "electric") return `Screwdriver with copper residue from the tampered wire near ${fullName(victim)}`;
  if (kind === "fall") return `Cuff link belonging to ${fullName(killer)} found on the nearest door`;
  if (kind === "vehicle") return `Garage key with fresh oil from the cut brake line`;
  if (kind === "concealment") return `Dusty sheet used to drag ${fullName(victim)} from ${roomName}`;
  return `Heavy room ornament with wiped blood trace and fibers from ${fullName(killer)}'s cuff`;
}

function mysteryDramaFindableForNpc(npc: MysteryNpc, rooms: MysteryRoom[]): MysteryFindable {
  const room = rooms.find((candidate) => candidate.id === npc.roomId) ?? rooms.find((candidate) => candidate.id === npc.stationRoomId) ?? rooms[0];
  const socialRoomId = ravenwoodSocialRooms[stableHash(`${npc.id}-drama-room`) % ravenwoodSocialRooms.length];
  const lowerSecret = npc.secret.toLowerCase();
  const lowerStatus = npc.familyStatus.toLowerCase();
  const lowerOccupation = npc.occupation.toLowerCase();
  const lowerQuirk = npc.quirk.toLowerCase();
  const held = stableHash(`${npc.id}-drama-held`) % 100 < 72;
  let name = `Private letter addressed to ${fullName(npc)}`;
  let description = `A private letter that makes ${fullName(npc)} look suspicious for personal reasons, not because it proves murder.`;
  let roomId = held ? undefined : room?.id;
  let holderNpcId = held ? npc.id : undefined;

  if (lowerSecret.includes("forged") || lowerSecret.includes("document") || lowerSecret.includes("will")) {
    name = `Suspicious document draft tied to ${fullName(npc)}`;
    description = `A document draft that points to ${fullName(npc)}'s private trouble, but does not match any murder proof.`;
  } else if (lowerSecret.includes("debt") || lowerSecret.includes("gambling") || lowerSecret.includes("money") || lowerOccupation.includes("bank") || lowerOccupation.includes("account")) {
    name = `Betting slip with ${fullName(npc)}'s initials`;
    description = `A betting slip and small money note that makes ${fullName(npc)} look desperate, but only explains unrelated drama.`;
  } else if (lowerSecret.includes("relationship") || lowerSecret.includes("dating") || lowerStatus.includes("dating") || lowerStatus.includes("engaged") || lowerStatus.includes("relationship")) {
    name = `Love letter hidden by ${fullName(npc)}`;
    description = `A love letter that exposes ${fullName(npc)}'s private relationship trouble without proving a killing.`;
  } else if (lowerSecret.includes("medicine") || lowerQuirk.includes("allergy") || lowerOccupation.includes("doctor") || lowerOccupation.includes("nurse")) {
    name = `Empty drug vial from ${fullName(npc)}'s bag`;
    description = `An empty drug container linked to ${fullName(npc)}'s private habits or work, but not to the murder method.`;
  } else if (lowerOccupation.includes("journalist") || lowerOccupation.includes("author") || lowerOccupation.includes("archivist") || lowerOccupation.includes("clerk")) {
    name = `Notebook page with ${fullName(npc)}'s private notes`;
    description = `A notebook page full of names and times that can distract the investigation without matching the murder proof.`;
  } else if (lowerQuirk.includes("cigarette") || npc.substancePreference.includes("cigarettes")) {
    name = `Cigarette case engraved for ${fullName(npc)}`;
    description = `A cigarette case that places ${fullName(npc)} in social rooms often, but does not prove a crime.`;
    roomId = held ? undefined : socialRoomId;
  } else if (lowerOccupation.includes("card") || npc.interests.some((interest) => interest.toLowerCase().includes("chess"))) {
    name = `Marked deck of cards near ${fullName(npc)}`;
    description = `A marked deck connected to ${fullName(npc)}'s private games and wagers, unrelated to the murder proof.`;
    roomId = held ? undefined : "smoking-room";
  }

  return {
    id: uid(),
    kind: "Snatchable",
    origin: "Drama",
    name,
    description,
    roomId,
    holderNpcId,
    availableDay: 1,
    availableDaytime: (["Morning", "Midday", "Afternoon"] as Daytime[])[stableHash(`${npc.id}-drama-time`) % 3]
  };
}

function mysteryNpcInitials(npc: MysteryNpc): string {
  return `${npc.firstName.charAt(0)}.${npc.familyName.charAt(0)}.`;
}

function mysteryNeutralRoomId(rooms: MysteryRoom[], seed: string, preferred: string[] = ravenwoodCommonRooms): string {
  const candidates = preferred
    .map((roomId) => rooms.find((room) => room.id === roomId))
    .filter((room): room is MysteryRoom => Boolean(room));
  const pool = candidates.length > 0 ? candidates : rooms.filter((room) => room.accessible);
  return (pool[stableHash(seed) % pool.length] ?? rooms[0]).id;
}

function mysteryNeutralFindable(name: string, description: string, rooms: MysteryRoom[], seed: string, preferredRooms?: string[], holderNpcId?: string): MysteryFindable {
  return {
    id: uid(),
    kind: "Snatchable",
    origin: "Neutral",
    name,
    description,
    roomId: holderNpcId ? undefined : mysteryNeutralRoomId(rooms, seed, preferredRooms),
    holderNpcId,
    availableDay: 1,
    availableDaytime: (["Morning", "Breakfast", "Midday", "Afternoon"] as Daytime[])[stableHash(`${seed}-time`) % 4]
  };
}

function mysteryNeutralHouseFindablesForScenario(npcs: MysteryNpc[], rooms: MysteryRoom[], relationships: MysteryNpcRelationship[]): MysteryFindable[] {
  const findables: MysteryFindable[] = [];
  const add = (name: string, description: string, seed: string, preferredRooms?: string[], holderNpcId?: string) => {
    if (!findables.some((item) => item.name === name)) findables.push(mysteryNeutralFindable(name, description, rooms, seed, preferredRooms, holderNpcId));
  };
  const adults = npcs.filter((npc) => npc.age >= 18);
  const children = npcs.filter((npc) => npc.age < 13);
  const smokers = npcs.filter((npc) => npc.substancePreference.includes("cigarettes"));
  const drinkers = npcs.filter((npc) => npc.substancePreference.includes("alcohol"));
  const cardPlayers = npcs.filter((npc) => npc.interests.some((interest) => interest.toLowerCase().includes("cards") || interest.toLowerCase().includes("chess")));
  const romanceResidents = npcs.filter((npc) => /dating|engaged|relationship|married|open to explore/i.test(npc.familyStatus));
  const divorcedResidents = npcs.filter((npc) => /divorced|on a break/i.test(npc.familyStatus));
  const memorialGuests = npcs.filter((npc) => /memorial|funeral/i.test(npc.reasonOfStay));
  const weddingGuests = npcs.filter((npc) => /wedding|engagement/i.test(npc.reasonOfStay));
  const inheritanceGuests = npcs.filter((npc) => /inheritance|lawyer/i.test(npc.reasonOfStay) || /will|inheritance/i.test(npc.secret));
  const travelers = npcs.filter((npc) => npc.role === "Guest");
  const medicalResidents = npcs.filter((npc) => /doctor|nurse|medical|first aid/i.test(npc.occupation) || /allergy|medicine|illness/i.test(`${npc.quirk} ${npc.secret} ${npc.reasonOfStay}`));
  const writers = npcs.filter((npc) => /author|journalist|archivist|clerk|poet|secretary|office/i.test(npc.occupation));
  const staff = npcs.filter((npc) => npc.role === "Staff");
  const military = npcs.filter((npc) => /military|police|security/i.test(npc.occupation));
  const students = npcs.filter((npc) => npc.age >= 16 && /student|university|school/i.test(`${npc.occupation} ${npc.education}`));
  const firstAdult = adults[0];

  add("lantern", "A working lantern that can make night searches easier or help reassure nervous residents.", "neutral-lantern", ["grand-hall", "back-stairs", "staff-corridor"]);
  add("gloves", "A pair of plain gloves useful for handling dusty or suspicious objects without making a scene.", "neutral-gloves", ["laundry", "staff-corridor", "servants-hall"]);
  add("hotel stationery and envelopes", "Ravenwood stationery with clean envelopes, useful for notes, lures, or comparing handwriting.", "neutral-stationery", ["library", "grand-hall", "drawing-room"]);
  add("fountain pen", "A good fountain pen from a writing desk, useful for notes or testing ink against documents.", "neutral-fountain-pen", ["library", "drawing-room"]);
  add("silver-plated teaspoon", "A silver-plated teaspoon from hotel service, useful for stirring, testing residue, or distracting staff.", "neutral-teaspoon", ["dining-room", "kitchen", "drawing-room"]);
  add("sewing kit from the hotel", "A hotel sewing kit with thread, needles, and spare buttons.", "neutral-sewing-kit", ["laundry", "servants-hall"]);
  add("comb", "A small comb left near a mirror, useful for personal grooming or comparing hair.", "neutral-comb", ["west-gallery", "drawing-room"]);
  add("folded newspaper", "A folded newspaper from the outside world, useful for dates, rumors, and conversation bait.", "neutral-newspaper", ["grand-hall", "smoking-room", "library"]);
  add("cheap plastic lighter", "A cheap plastic lighter, useful for candles, cigarettes, or testing who reacts too quickly.", "neutral-lighter", ["smoking-room", "garden-terrace"]);
  add("polaroid photo machine", "A Polaroid camera that can make instant records of rooms, objects, or reluctant residents.", "neutral-polaroid", ["library", "drawing-room"]);
  add("cassette tape without a label", "An unlabeled cassette tape that could hold music, dictation, or something a resident forgot.", "neutral-cassette", ["library", "billiards-room"]);
  add("spare camera battery", "A spare camera battery useful for testing cameras or trading with residents who take photographs.", "neutral-camera-battery", ["library", "west-gallery"]);
  add("disposable camera", "A disposable camera with a few shots left.", "neutral-disposable-camera", ["garden-terrace", "west-gallery"]);
  add("telephone calling card", "A telephone calling card, useless for outside lines now but valuable to someone who expected to call away.", "neutral-calling-card", ["grand-hall", "staff-corridor"]);
  add("shoe-polishing cloth", "A shoe-polishing cloth with dark polish marks.", "neutral-shoe-cloth", ["servants-hall", "laundry"]);

  if (firstAdult) add(`reading glasses in a leather case marked ${mysteryNpcInitials(firstAdult)}`, `Reading glasses in a leather case marked with ${fullName(firstAdult)}'s initials.`, `${firstAdult.id}-glasses`, ["library", "drawing-room"], stableHash(`${firstAdult.id}-glasses-held`) % 100 < 45 ? firstAdult.id : undefined);
  if (firstAdult) add(`handkerchief embroidered ${mysteryNpcInitials(firstAdult)}`, `A handkerchief embroidered with ${fullName(firstAdult)}'s initials.`, `${firstAdult.id}-handkerchief`, ["dining-room", "west-gallery"], stableHash(`${firstAdult.id}-handkerchief-held`) % 100 < 45 ? firstAdult.id : undefined);
  if (firstAdult) add(`broken pocket watch belonging to ${fullName(firstAdult)}`, `A broken pocket watch linked to ${fullName(firstAdult)}, stopped at an unhelpful but suggestive time.`, `${firstAdult.id}-watch`, ["library", "billiards-room"]);
  if (firstAdult) add(`loose coat button from ${fullName(firstAdult)}`, `A loose coat button that appears to match ${fullName(firstAdult)}'s clothes.`, `${firstAdult.id}-button`, ["grand-hall", "back-stairs"]);
  if (firstAdult) add(`engraved cufflink with ${mysteryNpcInitials(firstAdult)}`, `An engraved cufflink with ${fullName(firstAdult)}'s initials.`, `${firstAdult.id}-cufflink`, ["dining-room", "billiards-room"]);
  if (firstAdult) add(`list of telephone numbers in ${fullName(firstAdult)}'s handwriting`, `A list of telephone numbers written in ${fullName(firstAdult)}'s hand.`, `${firstAdult.id}-phone-list`, ["library", "grand-hall"]);

  for (const npc of smokers.slice(0, 3)) {
    add(`cigarettes belonging to ${fullName(npc)}`, `${fullName(npc)}'s cigarettes, useful as a favor or a way to start a conversation.`, `${npc.id}-cigarettes`, ["smoking-room", "garden-terrace"], stableHash(`${npc.id}-cigarettes-held`) % 100 < 55 ? npc.id : undefined);
    add(`cigarette case engraved for ${fullName(npc)}`, `A cigarette case connected to ${fullName(npc)}.`, `${npc.id}-cigarette-case`, ["smoking-room"], stableHash(`${npc.id}-case-held`) % 100 < 60 ? npc.id : undefined);
  }
  for (const npc of children.slice(0, 2)) {
    add(`child's toy belonging to ${fullName(npc)}`, `A small toy belonging to ${fullName(npc)}, useful for calming or questioning younger residents.`, `${npc.id}-toy`, ["grand-hall", "garden-terrace"], stableHash(`${npc.id}-toy-held`) % 100 < 40 ? npc.id : undefined);
    add(`child's drawing of the mansion by ${fullName(npc)}`, `A child's drawing of Ravenwood by ${fullName(npc)}, with rooms exaggerated in strange ways.`, `${npc.id}-drawing`, ["library", "grand-hall"]);
  }
  for (const npc of medicalResidents.slice(0, 3)) {
    add(`small bottle of aspirin belonging to ${fullName(npc)}`, `A small bottle of aspirin connected to ${fullName(npc)}.`, `${npc.id}-aspirin`, ["drawing-room", "servants-hall"], stableHash(`${npc.id}-aspirin-held`) % 100 < 50 ? npc.id : undefined);
    add(`prescription bottle belonging to ${fullName(npc)}`, `A prescription bottle belonging to ${fullName(npc)}.`, `${npc.id}-prescription`, ["guest-room-1", "guest-room-2", "servants-hall"], stableHash(`${npc.id}-prescription-held`) % 100 < 65 ? npc.id : undefined);
  }
  for (const npc of romanceResidents.slice(0, 4)) {
    add(`tiny bottle of perfume belonging to ${fullName(npc)}`, `A tiny bottle of perfume associated with ${fullName(npc)}.`, `${npc.id}-perfume`, ["drawing-room", "west-gallery"], stableHash(`${npc.id}-perfume-held`) % 100 < 45 ? npc.id : undefined);
    add(`locket containing an unfamiliar photograph carried by ${fullName(npc)}`, `A locket connected to ${fullName(npc)} with an unfamiliar photograph inside.`, `${npc.id}-locket`, ["library", "garden-terrace"], stableHash(`${npc.id}-locket-held`) % 100 < 55 ? npc.id : undefined);
    add(`love letter signed only ${mysteryNpcInitials(npc)}`, `A love letter signed only with the initials ${mysteryNpcInitials(npc)}, matching ${fullName(npc)}.`, `${npc.id}-love-letter`, ["library", "drawing-room"]);
    add(`cheap engagement ring tied to ${fullName(npc)}`, `A cheap engagement ring that may embarrass ${fullName(npc)} more than incriminate them.`, `${npc.id}-ring`, ["west-gallery", "garden-terrace"], stableHash(`${npc.id}-ring-held`) % 100 < 45 ? npc.id : undefined);
  }
  for (const npc of divorcedResidents.slice(0, 2)) add(`divorce papers hidden in an envelope for ${fullName(npc)}`, `Divorce papers in an envelope connected to ${fullName(npc)}.`, `${npc.id}-divorce`, ["library", "guest-room-1", "guest-room-2"]);
  for (const npc of writers.slice(0, 3)) add(`notebook filled with ${fullName(npc)}'s obsessive observations`, `A notebook filled with obsessive observations by ${fullName(npc)}.`, `${npc.id}-obsession-notebook`, ["library", "smoking-room"], stableHash(`${npc.id}-notebook-held`) % 100 < 50 ? npc.id : undefined);
  for (const npc of travelers.slice(0, 3)) {
    add(`shopping receipt from ${fullName(npc)}'s luggage`, `A shopping receipt from ${fullName(npc)}'s luggage.`, `${npc.id}-receipt`, ["grand-hall", "guest-room-1", "guest-room-2"]);
    add(`business card with ${fullName(npc)}'s handwritten room number`, `A business card with a handwritten room number connected to ${fullName(npc)}.`, `${npc.id}-business-card`, ["grand-hall", "dining-room"]);
  }
  for (const npc of memorialGuests.slice(0, 2)) add(`funeral programme for ${fullName(npc)}'s visit`, `A funeral programme that fits ${fullName(npc)}'s reason for staying at Ravenwood.`, `${npc.id}-funeral`, ["library", "drawing-room"]);
  for (const npc of weddingGuests.slice(0, 2)) add(`old wedding invitation addressed to ${fullName(npc)}`, `An old wedding invitation addressed to ${fullName(npc)}.`, `${npc.id}-wedding-invitation`, ["drawing-room", "grand-hall"]);
  for (const npc of inheritanceGuests.slice(0, 2)) add(`pawnshop receipt connected to ${fullName(npc)}`, `A pawnshop receipt that may affect money or inheritance questions around ${fullName(npc)}.`, `${npc.id}-pawnshop`, ["library", "grand-hall"]);
  for (const npc of drinkers.slice(0, 2)) add(`sobriety token belonging to ${fullName(npc)}`, `A sobriety token belonging to ${fullName(npc)}.`, `${npc.id}-sobriety-token`, ["smoking-room", "garden-terrace"], stableHash(`${npc.id}-sobriety-held`) % 100 < 45 ? npc.id : undefined);
  for (const npc of military.slice(0, 2)) add(`military medal belonging to ${fullName(npc)}`, `A military medal connected to ${fullName(npc)}.`, `${npc.id}-medal`, ["library", "guest-room-1"], stableHash(`${npc.id}-medal-held`) % 100 < 50 ? npc.id : undefined);
  for (const npc of staff.slice(0, 2)) add(`employee badge from another hotel belonging to ${fullName(npc)}`, `An employee badge from another hotel belonging to ${fullName(npc)}, suggesting previous hotel work before Ravenwood.`, `${npc.id}-other-hotel-badge`, ["servants-hall", "staff-corridor"], npc.id);
  for (const npc of students.slice(0, 2)) add(`university identification card for ${fullName(npc)}`, `A university identification card for ${fullName(npc)}.`, `${npc.id}-student-id`, ["library", "grand-hall"], stableHash(`${npc.id}-id-held`) % 100 < 45 ? npc.id : undefined);
  for (const npc of travelers.slice(0, 2)) add(`plane ticket booked under ${npc.familyName}'s false surname`, `A plane ticket booked under a false surname that resembles ${fullName(npc)}'s family name.`, `${npc.id}-plane-ticket`, ["grand-hall", "library"]);
  for (const npc of adults.slice(0, 2)) add(`membership card for a private club issued to ${fullName(npc)}`, `A membership card for a private club issued to ${fullName(npc)}.`, `${npc.id}-club-card`, ["billiards-room", "smoking-room"], stableHash(`${npc.id}-club-held`) % 100 < 40 ? npc.id : undefined);
  if (relationships.length > 0) {
    const linked = relationships
      .map((relationship) => {
        const from = npcs.find((npc) => npc.id === relationship.fromId);
        const to = npcs.find((npc) => npc.id === relationship.toId);
        return from && to ? { from, to, relationship } : null;
      })
      .filter((item): item is { from: MysteryNpc; to: MysteryNpc; relationship: MysteryNpcRelationship } => Boolean(item));
    for (const item of linked.slice(0, 3)) {
      add(`photograph of ${fullName(item.from)} and ${fullName(item.to)} together years earlier`, `A photograph of ${fullName(item.from)} and ${fullName(item.to)} together years earlier.`, `${item.relationship.id}-old-photo`, ["library", "drawing-room"]);
    }
    for (const item of linked.filter((entry) => entry.relationship.kind === "Family" && (entry.from.age < 18 || entry.to.age < 18)).slice(0, 2)) {
      const child = item.from.age < item.to.age ? item.from : item.to;
      add(`adoption document connected to ${fullName(child)}`, `An adoption document connected to ${fullName(child)} and their family situation at Ravenwood.`, `${item.relationship.id}-adoption`, ["library", "grand-hall"]);
    }
  }
  for (const npc of npcs.filter((candidate) => /media|story|scandal|journalist|local history/i.test(`${candidate.reasonOfStay} ${candidate.occupation} ${candidate.interests.join(" ")}`)).slice(0, 2)) {
    add(`press clipping about ${fullName(npc)}`, `A press clipping about ${fullName(npc)}.`, `${npc.id}-press-clipping`, ["library", "grand-hall"]);
  }
  for (const npc of adults.filter((candidate) => candidate.sex === "Female" && candidate.age <= 50 && /dating|engaged|relationship|married/i.test(candidate.familyStatus)).slice(0, 1)) {
    add(`used pregnancy test hidden in ${fullName(npc)}'s bag`, `A used pregnancy test hidden in ${fullName(npc)}'s bag.`, `${npc.id}-pregnancy-test`, ["guest-room-1", "guest-room-2"], npc.id);
  }
  for (const npc of adults.slice(0, 2)) {
    add(`birthday card containing money for ${fullName(npc)}`, `A birthday card containing money addressed to ${fullName(npc)}.`, `${npc.id}-birthday-card`, ["drawing-room", "grand-hall"]);
    add(`diary key belonging to ${fullName(npc)}`, `A tiny diary key belonging to ${fullName(npc)}.`, `${npc.id}-diary-key`, ["library", "west-gallery"], stableHash(`${npc.id}-diary-key-held`) % 100 < 40 ? npc.id : undefined);
    add(`lock of hair tied with ribbon connected to ${fullName(npc)}`, `A lock of hair tied with ribbon connected to ${fullName(npc)}.`, `${npc.id}-hair-lock`, ["guest-room-1", "guest-room-2", "library"]);
    add(`foreign currency in ${fullName(npc)}'s pocket`, `Foreign currency connected to ${fullName(npc)}'s travel or private plans.`, `${npc.id}-currency`, ["grand-hall", "dining-room"], stableHash(`${npc.id}-currency-held`) % 100 < 45 ? npc.id : undefined);
    add(`photograph of ${fullName(npc)} with one person scratched out`, `A photograph of ${fullName(npc)} with one person scratched out.`, `${npc.id}-scratched-photo`, ["library", "drawing-room"]);
  }
  add("lipstick-stained coffee cup", "A lipstick-stained coffee cup, useful for asking who was drinking here.", "neutral-lipstick-cup", ["drawing-room", "dining-room"]);
  add("crumpled sweet wrapper", "A crumpled sweet wrapper from hotel sweets.", "neutral-sweet-wrapper", ["grand-hall", "garden-terrace"]);
  add("paperback romance novel", "A paperback romance novel with a cracked spine.", "neutral-romance-novel", ["library", "drawing-room"]);

  const targetCount = clamp(8 + Math.floor(npcs.length / 4), 10, 18);
  return findables
    .sort((left, right) => stableHash(`${left.name}-neutral-order`) - stableHash(`${right.name}-neutral-order`))
    .slice(0, targetCount);
}

function mysteryFindablesForScenario(murders: MysteryMurder[], npcs: MysteryNpc[], rooms: MysteryRoom[], relationships: MysteryNpcRelationship[] = []): MysteryFindable[] {
  const roomName = (roomId: string) => rooms.find((room) => room.id === roomId)?.name ?? titleCase(roomId.replace(/-/g, " "));
  const findables: MysteryFindable[] = [];
  const frontDeskStaff = npcs.find((npc) => npc.role === "Staff" && ["Butler", "Housekeeper", "Head waiter", "Waiter", "Night porter"].includes(npc.occupation)) ?? npcs.find((npc) => npc.role === "Staff");
  findables.push({
    id: uid(),
    kind: "Snatchable",
    origin: "House",
    name: "master room key",
    description: `Opens every guest-room door in the mansion; can be stolen from the front desk${frontDeskStaff ? ` or from ${fullName(frontDeskStaff)}` : ""}.`,
    roomId: "grand-hall",
    holderNpcId: frontDeskStaff?.id,
    availableDay: 1,
    availableDaytime: "Morning"
  });

  const guestKeyRooms = new Set<string>();
  for (const npc of npcs.filter((candidate) => candidate.role === "Guest")) {
    if (guestKeyRooms.has(npc.roomId)) continue;
    guestKeyRooms.add(npc.roomId);
    const occupants = npcs.filter((candidate) => candidate.role === "Guest" && candidate.roomId === npc.roomId);
    const occupantNames = occupants.map(fullName).join(", ");
    findables.push({
      id: uid(),
      kind: "Snatchable",
      origin: "House",
      name: `${roomName(npc.roomId).toLowerCase()} key`,
      description: `Opens ${roomName(npc.roomId)}; can be snatched from ${occupantNames} or from staff assigned to clean or serve that room.`,
      holderNpcId: npc.id,
      availableDay: 1,
      availableDaytime: "Morning"
    });
  }

  murders.forEach((murder, index) => {
    const killer = npcs.find((npc) => npc.id === murder.killerId);
    const victim = npcs.find((npc) => npc.id === murder.victimId);
    if (!killer || !victim) return;
    const motiveProof = mysteryPreciseMotiveProof(murder.motive, killer, victim);
    const motiveText = `${motiveProof.name}; can be found ${motiveProof.locationNote}.`;
    const methodName = mysteryPreciseMethodProof(murder.method, killer, victim, roomName(murder.roomId));
    const methodText = `${methodName}; can be found in ${roomName(murder.roomId)} after ${fullName(victim)} is found.`;
    findables.push(
      {
        id: uid(),
        kind: "Proof",
        origin: "Crime",
        name: motiveProof.name,
        description: motiveText,
        roomId: killer.roomId,
        holderNpcId: killer.id,
        availableDay: 1,
        availableDaytime: "Morning",
        relatedMurderIndex: index,
        proofText: motiveText
      },
      {
        id: uid(),
        kind: "Proof",
        origin: "Crime",
        name: methodName,
        description: methodText,
        roomId: murder.roomId,
        availableDay: murder.day,
        availableDaytime: murder.daytime,
        relatedMurderIndex: index,
        proofText: methodText
      }
    );
  });
  const dramaCandidates = npcs
    .filter((npc) => npc.alive !== false && npc.age >= 16)
    .sort((a, b) => stableHash(`${a.id}-drama-order`) - stableHash(`${b.id}-drama-order`))
    .slice(0, clamp(Math.floor(npcs.length / 3), 4, 8));
  findables.push(...dramaCandidates.map((npc) => mysteryDramaFindableForNpc(npc, rooms)));
  findables.push(...mysteryNeutralHouseFindablesForScenario(npcs, rooms, relationships));
  if (roll(0.6)) {
    const commonCardRoom = rooms.find((room) => room.id === "smoking-room") ?? rooms.find((room) => ravenwoodCommonRooms.includes(room.id));
    if (commonCardRoom) {
      findables.push({
        id: uid(),
        kind: "Snatchable",
        origin: "House",
        name: "deck of cards",
        description: `A worn deck of cards left on a table in ${commonCardRoom.name}; can be picked up from the room once the house is sealed.`,
        roomId: commonCardRoom.id,
        availableDay: 1,
        availableDaytime: "Morning"
      });
    }
  }
  return findables;
}

function mysteryProofsFor(method: string, motive: string, killer: MysteryNpc, victim: MysteryNpc, npcs: MysteryNpc[], relationships: MysteryNpcRelationship[], availableDay: number, availableDaytime: Daytime): string[] {
  const witnessPool = npcs.filter((npc) => npc.id !== killer.id && npc.id !== victim.id && npc.alive !== false);
  const witness = pick(witnessPool.length > 0 ? witnessPool : [killer]);
  if (witness.id !== killer.id) {
    addMysteryNpcRelationship(
      relationships,
      witness,
      killer,
      "Witness",
      `${fullName(witness)} may connect ${fullName(killer)} to ${fullName(victim)}'s death if trusted enough.`,
      { hidden: true, trustImpact: 5, motiveRisk: 11, availableDay, availableDaytime }
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

function mysteryEarlierMurderCoverupMotive(killer: MysteryNpc, victim: MysteryNpc, earlierVictimName: string, earlierMotive: string): string {
  const wasRelationshipCoverup = earlierMotive.toLowerCase().includes("relationship") || earlierMotive.toLowerCase().includes("dating") || earlierMotive.toLowerCase().includes("affair") || earlierMotive.toLowerCase().includes("engagement");
  return wasRelationshipCoverup
    ? `To silence ${fullName(victim)} after they found out that ${fullName(killer)} had killed ${earlierVictimName} to keep a relationship secret and threatened to tell the police`
    : `To silence ${fullName(victim)} after they found out that ${fullName(killer)} had killed ${earlierVictimName} and threatened to tell the police`;
}

function mysteryMotiveFor(killer: MysteryNpc, victim: MysteryNpc, npcs: MysteryNpc[], relationships: MysteryNpcRelationship[], availableDay: number, availableDaytime: Daytime, previousMurders: MysteryMurder[] = []): string {
  const earlierMurder = previousMurders
    .filter((murder) => murder.killerId === killer.id)
    .sort((left, right) => mysteryTimeSortValue(right.day, right.daytime) - mysteryTimeSortValue(left.day, left.daytime))[0];
  const directRelationship = mysteryPairRelationship(relationships, killer, victim);
  if (earlierMurder && (directRelationship || roll(0.85))) {
    const earlierVictim = npcs.find((npc) => npc.id === earlierMurder.victimId);
    const earlierVictimName = earlierVictim ? fullName(earlierVictim) : "the previous victim";
    const wasRelationshipCoverup = earlierMurder.motive.toLowerCase().includes("relationship") || earlierMurder.motive.toLowerCase().includes("dating") || earlierMurder.motive.toLowerCase().includes("affair") || earlierMurder.motive.toLowerCase().includes("engagement");
    killer.secret = `Killed ${earlierVictimName} and is hiding evidence of the earlier murder.`;
    victim.secret = `Found out that ${fullName(killer)} killed ${earlierVictimName} and planned to tell the police.`;
    addMysteryNpcRelationship(
      relationships,
      victim,
      killer,
      "Witness",
      `${fullName(victim)} found out that ${fullName(killer)} killed ${earlierVictimName}${wasRelationshipCoverup ? " to keep a relationship secret" : ""} and planned to give them up to the police.`,
      { hidden: true, trustImpact: -14, motiveRisk: 16, availableDay, availableDaytime }
    );
    return mysteryEarlierMurderCoverupMotive(killer, victim, earlierVictimName, earlierMurder.motive);
  }
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
      `${fullName(victim)} knew that ${fullName(killer)} was hiding evidence of a previous murder.`,
      { hidden: true, trustImpact: -10, motiveRisk: 13, availableDay, availableDaytime }
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
    killer.secret = "Is hiding a forged second identity card that is linked to a number of crimes.";
    victim.secret = "Had noticed a forged signature in private papers.";
    addMysteryNpcRelationship(
      relationships,
      victim,
      killer,
      "Witness",
      `${fullName(victim)} had seen evidence that ${fullName(killer)} forged a document.`,
      { hidden: true, trustImpact: -10, motiveRisk: 14, availableDay, availableDaytime }
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
      { hidden: true, trustImpact: -9, motiveRisk: 13, availableDay, availableDaytime }
    );
    return `To stop ${fullName(victim)} revealing that ${fullName(killer)} had stolen money.`;
  }

  if (scenario === "relationship") {
    const partnerCandidates = npcs.filter((npc) =>
      npc.id !== killer.id &&
      npc.id !== victim.id &&
      npc.age >= 18 &&
      mysteryAllowsLargeAgeGapRomance(killer, npc)
    );
    if (partnerCandidates.length === 0) {
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
    const partner = pick(partnerCandidates);
    ensureSharedRavenwoodHistory(killer, partner);
    ensureSharedRavenwoodHistory(victim, killer);
    killer.familyStatus = "Secretly dating";
    partner.familyStatus = "Secretly dating";
    killer.secret = `Is secretly involved with ${fullName(partner)}.`;
    victim.secret = `Knew about ${fullName(killer)}'s private relationship with ${fullName(partner)}.`;
    addMysteryNpcRelationship(
      relationships,
      killer,
      partner,
      "Romance",
      `${fullName(killer)} and ${fullName(partner)} are romantically involved but keeping it private.`,
      { hidden: true, trustImpact: 6, motiveRisk: 8, skipGuards: true }
    );
    addMysteryNpcRelationship(
      relationships,
      victim,
      killer,
      "Witness",
      `${fullName(victim)} knew about ${fullName(killer)}'s private relationship with ${fullName(partner)}.`,
      { hidden: true, trustImpact: -9, motiveRisk: 13, availableDay, availableDaytime }
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

function repairMysteryMurderTimelineAndMotives(murders: MysteryMurder[], npcs: MysteryNpc[], relationships: MysteryNpcRelationship[]): string[] {
  const sanityLines: string[] = [];
  murders.sort((a, b) => mysteryTimeSortValue(a.day, a.daytime) - mysteryTimeSortValue(b.day, b.daytime));
  for (let index = 0; index < murders.length; index += 1) {
    const murder = murders[index];
    const killer = npcs.find((npc) => npc.id === murder.killerId);
    const victim = npcs.find((npc) => npc.id === murder.victimId);
    if (!killer || !victim) continue;
    const futureVictim = murders
      .slice(index + 1)
      .map((futureMurder) => npcs.find((npc) => npc.id === futureMurder.victimId))
      .find((futureNpc) => futureNpc && murder.motive.includes(fullName(futureNpc)));
    if (!futureVictim) continue;
    const earlierMurder = murders
      .slice(0, index)
      .filter((candidate) => candidate.killerId === murder.killerId)
      .sort((left, right) => mysteryTimeSortValue(right.day, right.daytime) - mysteryTimeSortValue(left.day, left.daytime))[0];
    const earlierVictim = earlierMurder ? npcs.find((npc) => npc.id === earlierMurder.victimId) : undefined;
    if (earlierMurder && earlierVictim) {
      murder.motive = mysteryEarlierMurderCoverupMotive(killer, victim, fullName(earlierVictim), earlierMurder.motive);
      addMysteryNpcRelationship(
        relationships,
        victim,
        killer,
        "Witness",
        `${fullName(victim)} found out that ${fullName(killer)} killed ${fullName(earlierVictim)} and planned to tell the police.`,
        { hidden: true, trustImpact: -14, motiveRisk: 16, availableDay: murder.day, availableDaytime: murder.daytime }
      );
      sanityLines.push(`Scenario repair: ${fullName(victim)}'s motive no longer references future victim ${fullName(futureVictim)}; it now references earlier victim ${fullName(earlierVictim)}.`);
    } else {
      murder.motive = `To silence ${fullName(victim)} after they discovered a dangerous secret about ${fullName(killer)} and threatened to tell the police`;
      sanityLines.push(`Scenario repair: ${fullName(victim)}'s motive no longer references future victim ${fullName(futureVictim)}.`);
    }
  }
  return sanityLines;
}

function uniqueRavenwoodFirstName(
  sex: Sex,
  familyName: string,
  usedNames: Set<string>,
  usedFirstNames: Set<string>,
  preferred?: string
): string {
  const bank = sex === "Male" ? ravenwoodMaleNames : ravenwoodFemaleNames;

  if (preferred && bank.includes(preferred)) {
    const preferredFirstNameKey = preferred.toLowerCase();
    const preferredFullNameKey = `${preferred} ${familyName}`.toLowerCase();

    if (
      !usedFirstNames.has(preferredFirstNameKey) &&
      !usedNames.has(preferredFullNameKey)
    ) {
      usedFirstNames.add(preferredFirstNameKey);
      usedNames.add(preferredFullNameKey);
      return preferred;
    }
  }

  const availableNames = shuffled(bank).filter((name) => {
    const firstNameKey = name.toLowerCase();
    const fullNameKey = `${name} ${familyName}`.toLowerCase();

    return (
      !usedFirstNames.has(firstNameKey) &&
      !usedNames.has(fullNameKey)
    );
  });

  if (availableNames.length > 0) {
    const selectedName = availableNames[0];

    usedFirstNames.add(selectedName.toLowerCase());
    usedNames.add(`${selectedName} ${familyName}`.toLowerCase());

    return selectedName;
  }

  const fallbackBaseName = pick(bank);
  let suffix = 2;
  let fallback = `${fallbackBaseName} ${suffix}`;

  while (
    usedFirstNames.has(fallback.toLowerCase()) ||
    usedNames.has(`${fallback} ${familyName}`.toLowerCase())
  ) {
    suffix += 1;
    fallback = `${fallbackBaseName} ${suffix}`;
  }

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

function mysterySubstancePreferenceFor(age: number, role: MysteryNpc["role"]): MysteryNpc["substancePreference"] {
  if (age < 16) return "none";
  if (role === "Staff") return pick(["none", "none", "cigarettes", "alcohol", "alcohol and cigarettes"]);
  return pick(["none", "alcohol", "alcohol", "cigarettes", "weed", "alcohol and cigarettes", "alcohol and weed"]);
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
  if (age < 18) return role === "Guest" ? pick(["Some secondary school", "Home-schooled through secondary level", "Drama school training"]) : pick(["Some secondary school", "Food hygiene training", "No formal education", "Completed compulsory schooling"]);
  if (role === "Staff") return pick(["No formal education", "Completed compulsory schooling", "Food hygiene training", "Customer service training", "First aid training", "Security guard training", "Trade apprenticeship"]);
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
        education: pick(["Some secondary school", "Food hygiene training", "No formal education", "Completed compulsory schooling"]),
        occupation: pick(["Kitchen helper", "Laundry helper", "Page"])
      };
  }
  if (role === "Staff") {
    const occupation = pick(mysteryStaffOccupations);
    const educationByStaffJob: Record<string, string[]> = {
      Butler: ["Customer service training", "Office administration training", "Completed compulsory schooling"],
      Cleaner: ["No formal education", "Food hygiene training", "Completed compulsory schooling"],
      Cook: ["Food hygiene training", "Trade apprenticeship", "Completed compulsory schooling"],
      Gardener: ["Trade apprenticeship", "Completed compulsory schooling"],
      "Head waiter": ["Customer service training", "Food hygiene training", "Completed compulsory schooling"],
      Housekeeper: ["Customer service training", "Office administration training", "Completed compulsory schooling"],
      "Kitchen porter": ["Food hygiene training", "No formal education", "Completed compulsory schooling"],
      "Laundry worker": ["No formal education", "Completed compulsory schooling", "Basic literacy training"],
      "Night porter": ["Security guard training", "Customer service training", "Completed compulsory schooling"],
      Nurse: ["First aid training", "Medical secretary training", "Completed compulsory schooling"],
      "Security guard": ["Security guard training", "First aid training", "Completed compulsory schooling"],
      Waiter: ["Customer service training", "Food hygiene training", "Completed compulsory schooling"],
      Chauffeur: ["First aid training", "Security guard training", "Completed compulsory schooling"],
      "Estate cleaner": ["No formal education", "Food hygiene training", "Completed compulsory schooling"]
    };
    return { occupation, education: pick(educationByStaffJob[occupation] ?? ["Trade apprenticeship", "Completed compulsory schooling"]) };
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

function mysteryTitleCaseRelation(relation: string): string {
  return relation.split(" ").map(titleCase).join(" ");
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function mysteryIsStaffGuestPair(a: MysteryNpc, b: MysteryNpc): boolean {
  return a.role !== b.role;
}

function mysteryAllowsStaffGuestBloodFamily(a: MysteryNpc, b: MysteryNpc): boolean {
  return !mysteryIsStaffGuestPair(a, b) || roll(0.04);
}

function mysteryAllowsLargeAgeGapRomance(a: MysteryNpc, b: MysteryNpc): boolean {
  const crossesFifty = (a.age >= 50 && b.age < 50) || (b.age >= 50 && a.age < 50);
  return !crossesFifty || roll(0.08);
}

function mysteryIsRomanticRelationship(kind: MysteryNpcRelationshipKind): boolean {
  return kind === "Marriage" || kind === "Romance" || kind === "Affair";
}

function mysteryIsBloodFamilyDetail(detail: string): boolean {
  return /\b(parent|mother|father|sibling|sister|brother|cousin|aunt|uncle|niece|nephew|son|daughter)\b/i.test(detail);
}

function mysteryHasSpouseRelationship(relationships: MysteryNpcRelationship[], npc: MysteryNpc): boolean {
  return relationships.some((relationship) =>
    relationship.kind === "Marriage" &&
    (relationship.fromId === npc.id || relationship.toId === npc.id)
  );
}

function addMysteryNpcRelationship(
  relationships: MysteryNpcRelationship[],
  from: MysteryNpc,
  to: MysteryNpc,
  kind: MysteryNpcRelationshipKind,
  detail: string,
  options: Partial<Pick<MysteryNpcRelationship, "hidden" | "trustImpact" | "motiveRisk" | "availableDay" | "availableDaytime">> & { skipGuards?: boolean } = {}
) {
  if (from.id === to.id) return false;
  if (!options.skipGuards && kind === "Family" && mysteryIsBloodFamilyDetail(detail) && !mysteryAllowsStaffGuestBloodFamily(from, to)) return false;
  if (!options.skipGuards && mysteryIsRomanticRelationship(kind) && !mysteryAllowsLargeAgeGapRomance(from, to)) return false;
  if (kind === "Marriage" && relationships.some((relationship) =>
    relationship.kind === "Marriage" &&
    (relationship.fromId === from.id || relationship.toId === from.id || relationship.fromId === to.id || relationship.toId === to.id)
  )) return false;
  const duplicate = relationships.some((relationship) =>
    relationship.kind === kind &&
    ((relationship.fromId === from.id && relationship.toId === to.id) || (relationship.fromId === to.id && relationship.toId === from.id)) &&
    relationship.detail === detail
  );
  if (duplicate) return false;
  if (kind === "Marriage") {
    from.familyStatus = "Married";
    to.familyStatus = "Married";
  }
  if (kind === "Romance" || kind === "Affair") {
    from.familyStatus = "Secretly dating";
    to.familyStatus = "Secretly dating";
  }
  relationships.push({
    id: uid(),
    fromId: from.id,
    toId: to.id,
    kind,
    detail,
    hidden: options.hidden ?? false,
    trustImpact: options.trustImpact ?? 0,
    motiveRisk: options.motiveRisk ?? 0,
    availableDay: options.availableDay,
    availableDaytime: options.availableDaytime
  });
  return true;
}

function mysteryRelationshipsWithSingleSpouses(relationships: MysteryNpcRelationship[]): MysteryNpcRelationship[] {
  const marriedNpcIds = new Set<string>();
  return relationships.filter((relationship) => {
    if (relationship.kind !== "Marriage") return true;
    if (marriedNpcIds.has(relationship.fromId) || marriedNpcIds.has(relationship.toId)) return false;
    marriedNpcIds.add(relationship.fromId);
    marriedNpcIds.add(relationship.toId);
    return true;
  });
}

function mysteryDisplayFamilyStatus(npc: MysteryNpc, mystery: MysteryGame): string {
  const validRelationships = mysteryRelationshipsWithSingleSpouses(mystery.npcRelationships ?? []);
  const hasPrivateRomance = validRelationships.some((relationship) =>
    (relationship.kind === "Romance" || relationship.kind === "Affair") &&
    (relationship.fromId === npc.id || relationship.toId === npc.id)
  );
  if (hasPrivateRomance) return "Secretly dating";
  const hasHotelMarriage = validRelationships.some((relationship) =>
    relationship.kind === "Marriage" &&
    (relationship.fromId === npc.id || relationship.toId === npc.id)
  );
  if (hasHotelMarriage) return "Married";
  const outsideHotelStatuses = new Set([
    "Married",
    "In a relationship",
    "Engaged",
    "Secretly dating",
    "Secretly engaged",
    "In an open relationship",
    "On a break from a relationship"
  ]);
  return outsideHotelStatuses.has(npc.familyStatus) ? `${npc.familyStatus} (outside of hotel)` : npc.familyStatus;
}

function mysteryRelationshipLinesFor(npc: MysteryNpc, npcs: MysteryNpc[], relationships: MysteryNpcRelationship[], currentDay?: number, currentDaytime?: Daytime): string[] {
  return mysteryRelationshipsWithSingleSpouses(relationships)
    .filter((relationship) => relationship.fromId === npc.id || relationship.toId === npc.id)
    .map((relationship) => {
      const otherId = relationship.fromId === npc.id ? relationship.toId : relationship.fromId;
      const other = npcs.find((candidate) => candidate.id === otherId);
      const availableFrom = relationship.availableDay && relationship.availableDaytime
        ? `, available from ${mysteryAvailabilityLabel(relationship.availableDay, relationship.availableDaytime)}${
          currentDay && currentDaytime && !mysteryTimeHasArrived(currentDay, currentDaytime, relationship.availableDay, relationship.availableDaytime)
            ? ", not yet knowable in real play"
            : ""
        }`
        : "";
      const visibility = relationship.hidden ? `hidden, testing visible${availableFrom}` : `known${availableFrom}`;
      const detail = other && relationship.kind === "Family"
        ? mysteryFamilyRelationshipSentence(npc, other, relationship)
        : relationship.detail;
      return `${relationship.kind} with ${other ? fullName(other) : "Unknown"} (${visibility}): ${detail}`;
    });
}

function mysterySexedRole(npc: MysteryNpc, female: string, male: string): string {
  return npc.sex === "Female" ? female : male;
}

function mysteryChildRole(npc: MysteryNpc): string {
  return mysterySexedRole(npc, "daughter", "son");
}

function mysteryParentRole(npc: MysteryNpc): string {
  return mysterySexedRole(npc, "mother", "father");
}

function mysterySiblingRole(npc: MysteryNpc): string {
  return mysterySexedRole(npc, "sister", "brother");
}

function mysteryGuardianRoleFromDetail(detail: string, child: MysteryNpc, guardian: MysteryNpc): string | null {
  const normalized = detail.toLowerCase();
  const childName = fullName(child).toLowerCase();
  const guardianName = fullName(guardian).toLowerCase();
  const match = normalized.match(new RegExp(`${escapeRegExp(childName)} is staying with (mother|father|aunt|uncle|older sister|older brother) ${escapeRegExp(guardianName)}`));
  return match?.[1] ?? null;
}

function mysteryFamilyRolePhrase(subject: MysteryNpc, other: MysteryNpc, relationship: MysteryNpcRelationship): string | null {
  const detail = relationship.detail.toLowerCase();
  const subjectName = fullName(subject).toLowerCase();
  const otherName = fullName(other).toLowerCase();
  if (detail.includes("siblings")) return `${mysterySiblingRole(subject)} of`;
  if (detail.includes("cousins")) return "cousin of";
  if (detail.includes(`${subjectName} is parent to ${otherName}`)) return `${mysteryParentRole(subject)} of ${mysteryChildRole(other)}`;
  if (detail.includes(`${otherName} is parent to ${subjectName}`)) return `${mysteryChildRole(subject)} of ${mysteryParentRole(other)}`;
  const subjectAsChildGuardian = mysteryGuardianRoleFromDetail(relationship.detail, subject, other);
  if (subjectAsChildGuardian) {
    if (subjectAsChildGuardian === "mother" || subjectAsChildGuardian === "father") return `${mysteryChildRole(subject)} of ${subjectAsChildGuardian}`;
    if (subjectAsChildGuardian === "aunt" || subjectAsChildGuardian === "uncle") return `${mysterySexedRole(subject, "niece", "nephew")} of ${subjectAsChildGuardian}`;
    if (subjectAsChildGuardian === "older sister" || subjectAsChildGuardian === "older brother") return `${mysterySiblingRole(subject)} of ${subjectAsChildGuardian.replace("older ", "")}`;
  }
  const otherAsChildGuardian = mysteryGuardianRoleFromDetail(relationship.detail, other, subject);
  if (otherAsChildGuardian) {
    if (otherAsChildGuardian === "mother" || otherAsChildGuardian === "father") return `${otherAsChildGuardian} of ${mysteryChildRole(other)}`;
    if (otherAsChildGuardian === "aunt" || otherAsChildGuardian === "uncle") return `${otherAsChildGuardian} of ${mysterySexedRole(other, "niece", "nephew")}`;
    if (otherAsChildGuardian === "older sister" || otherAsChildGuardian === "older brother") return `${mysterySiblingRole(subject)} of ${mysterySiblingRole(other)}`;
  }
  return null;
}

function mysteryFamilyRelationshipSentence(subject: MysteryNpc, other: MysteryNpc, relationship: MysteryNpcRelationship): string {
  const rolePhrase = mysteryFamilyRolePhrase(subject, other, relationship);
  return rolePhrase
    ? `${fullName(subject)} is ${rolePhrase} ${fullName(other)}.`
    : relationship.detail;
}

function refreshMysteryFamilyNotes(npcs: MysteryNpc[], relationships: MysteryNpcRelationship[]) {
  for (const npc of npcs) npc.familyRelationNote = undefined;
  for (const relationship of relationships) {
    if (relationship.kind !== "Family" && relationship.kind !== "Marriage") continue;
    const from = npcs.find((npc) => npc.id === relationship.fromId);
    const to = npcs.find((npc) => npc.id === relationship.toId);
    if (!from || !to) continue;
    if (relationship.kind === "Marriage") {
      addMysteryFamilyNote(from, `Spouse of ${fullName(to)}`);
      addMysteryFamilyNote(to, `Spouse of ${fullName(from)}`);
      continue;
    }
    const fromRole = mysteryFamilyRolePhrase(from, to, relationship);
    const toRole = mysteryFamilyRolePhrase(to, from, relationship);
    if (fromRole) addMysteryFamilyNote(from, `${mysteryTitleCaseRelation(fromRole)} ${fullName(to)}`);
    if (toRole) addMysteryFamilyNote(to, `${mysteryTitleCaseRelation(toRole)} ${fullName(from)}`);
  }
}

function normalizeMysteryNpcRelationships(npcs: MysteryNpc[], relationships: MysteryNpcRelationship[]): MysteryNpcRelationship[] {
  const ids = new Set(npcs.map((npc) => npc.id));
  const byId = new Map(npcs.map((npc) => [npc.id, npc]));
  const seenExact = new Set<string>();
  const marriedNpcIds = new Set<string>();
  let cousinLinks = 0;
  let staffGuestBloodLinks = 0;
  let largeAgeGapRomances = 0;
  const normalized: MysteryNpcRelationship[] = [];
  for (const relationship of relationships) {
    const from = byId.get(relationship.fromId);
    const to = byId.get(relationship.toId);
    if (!from || !to || !ids.has(from.id) || !ids.has(to.id) || from.id === to.id) continue;
    const exactKey = [relationship.kind, [from.id, to.id].sort().join(":"), relationship.detail].join("|");
    if (seenExact.has(exactKey)) continue;
    if (relationship.kind === "Marriage") {
      if (marriedNpcIds.has(from.id) || marriedNpcIds.has(to.id)) continue;
      marriedNpcIds.add(from.id);
      marriedNpcIds.add(to.id);
    }
    if (relationship.kind === "Family" && relationship.detail.toLowerCase().includes("cousin")) {
      if (cousinLinks >= 3) continue;
      cousinLinks += 1;
    }
    if (relationship.kind === "Family" && mysteryIsBloodFamilyDetail(relationship.detail) && mysteryIsStaffGuestPair(from, to)) {
      if (staffGuestBloodLinks >= 1 || !mysteryAllowsStaffGuestBloodFamily(from, to)) continue;
      staffGuestBloodLinks += 1;
    }
    if (mysteryIsRomanticRelationship(relationship.kind) && !mysteryAllowsLargeAgeGapRomance(from, to)) {
      if (largeAgeGapRomances >= 1) continue;
      largeAgeGapRomances += 1;
    }
    seenExact.add(exactKey);
    normalized.push(relationship);
  }
  for (const relationship of normalized) {
    const from = byId.get(relationship.fromId);
    const to = byId.get(relationship.toId);
    if (!from || !to) continue;
    if (relationship.kind === "Marriage") {
      from.familyStatus = "Married";
      to.familyStatus = "Married";
    }
    if (relationship.kind === "Romance" || relationship.kind === "Affair") {
      from.familyStatus = "Secretly dating";
      to.familyStatus = "Secretly dating";
    }
  }
  refreshMysteryFamilyNotes(npcs, normalized);
  return normalized;
}

function mysterySharedHistoryContext(a: MysteryNpc, b: MysteryNpc): "staff" | "guest" | "mixed" {
  if (a.role === "Staff" && b.role === "Staff") return "staff";
  if (a.role === "Guest" && b.role === "Guest") return "guest";
  return "mixed";
}

function mysteryRomanceHistoryDetail(from: MysteryNpc, to: MysteryNpc): string {
  const context = mysterySharedHistoryContext(from, to);
  if (context === "staff") {
    return pick([
      `${fullName(from)} and ${fullName(to)} became romantically involved during late staff shifts and disagree about whether to make it public now.`,
      `${fullName(from)} has been meeting ${fullName(to)} in private after service, which could ruin more than one position.`,
      `${fullName(from)} still wants answers from ${fullName(to)} after a promise made during a quiet shift at Ravenwood.`
    ]);
  }
  if (context === "mixed") {
    return pick([
      `${fullName(from)} and ${fullName(to)} became romantically involved through repeated private service at Ravenwood and disagree about whether to make it public now.`,
      `${fullName(from)} has been meeting ${fullName(to)} away from the public rooms, which could ruin more than one reputation.`,
      `${fullName(from)} still wants answers from ${fullName(to)} after a promise made during a private Ravenwood conversation.`
    ]);
  }
  return pick([
    `${fullName(from)} and ${fullName(to)} became romantically involved during an earlier Ravenwood stay and disagree about whether to make it public now.`,
    `${fullName(from)} has been meeting ${fullName(to)} in private again after a previous stay, which could ruin more than one reputation.`,
    `${fullName(from)} still wants answers from ${fullName(to)} after a promise made during an earlier visit.`
  ]);
}

function mysteryFriendshipDetail(from: MysteryNpc, to: MysteryNpc): string {
  const context = mysterySharedHistoryContext(from, to);
  if (context === "staff") {
    return pick([
      `${fullName(from)} and ${fullName(to)} built a good friendship while working at Ravenwood and still trust each other more than most people in the house.`,
      `${fullName(from)} quietly looks out for ${fullName(to)} because their staff friendship has survived several difficult shifts.`,
      `${fullName(from)} and ${fullName(to)} often defend each other when staff gossip begins.`
    ]);
  }
  if (context === "mixed") {
    return pick([
      `${fullName(from)} and ${fullName(to)} became friendly through repeated Ravenwood visits and still trust each other more than most people in the house.`,
      `${fullName(from)} quietly looks out for ${fullName(to)} because their friendship crosses the staff-guest divide.`,
      `${fullName(from)} and ${fullName(to)} often defend each other when gossip begins in the house.`
    ]);
  }
  return pick([
    `${fullName(from)} and ${fullName(to)} share an old friendship and still trust each other more than most people at Ravenwood.`,
    `${fullName(from)} and ${fullName(to)} became close during an earlier Ravenwood stay and have remained loyal friends.`,
    `${fullName(from)} quietly looks out for ${fullName(to)} because their friendship has survived several difficult years.`,
    `${fullName(from)} and ${fullName(to)} often defend each other when gossip begins in the house.`
  ]);
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
    if (kind === "Family" && !mysteryAllowsStaffGuestBloodFamily(from, to)) return false;
    if (mysteryIsRomanticRelationship(kind) && !mysteryAllowsLargeAgeGapRomance(from, to)) return false;
    const key = pairKey(from, to);
    if (usedPairs.has(key) && roll(0.72)) return false;
    const added = addMysteryNpcRelationship(relationships, from, to, kind, detail, { hidden, trustImpact, motiveRisk, skipGuards: true });
    if (added) usedPairs.add(key);
    return added;
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
    } else if (roll(0.14)) {
      ensureSharedRavenwoodHistory(from, to);
      const romanceDetail = mysteryRomanceHistoryDetail(from, to);
      addRandom(from, to, pick<MysteryNpcRelationshipKind>(["Romance", "Affair"]), romanceDetail, true, rand(-10, 12), rand(5, 14));
    } else {
      const kind = pick<MysteryNpcRelationshipKind>(["Friendship", "Rivalry", "Debt", "Blackmail", "Suspicion"]);
      const detail = kind === "Friendship"
        ? mysteryFriendshipDetail(from, to)
        : pick([
          `${fullName(from)} owes ${fullName(to)} a favor and resents the reminder.`,
          `${fullName(from)} believes ${fullName(to)} lied about why they came to Ravenwood.`,
          `${fullName(from)} and ${fullName(to)} were seen arguing before the house was sealed.`,
          `${fullName(from)} knows an embarrassing secret about ${fullName(to)}.`,
          `${fullName(from)} considers ${fullName(to)} useful, but not trustworthy.`,
          `${fullName(from)} and ${fullName(to)} share an old friendship that has gone sour.`
        ]);
      if (detail.includes("old friendship")) ensureSharedRavenwoodHistory(from, to);
      addRandom(from, to, kind, detail, roll(0.5), kind === "Friendship" ? rand(6, 14) : rand(-14, 10), kind === "Friendship" ? rand(0, 4) : rand(2, 12));
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

function buildMysterySanityLedger(mystery: Pick<MysteryGame, "id" | "title" | "player" | "day" | "daytime" | "rooms" | "npcs" | "npcRelationships" | "murders" | "findables" | "currentRoomId" | "playerRoomId" | "inventory">): string[] {
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
      const availability = relationship.availableDay && relationship.availableDaytime ? `; available=${mysteryAvailabilityLabel(relationship.availableDay, relationship.availableDaytime)}` : "";
      return `- ${relationship.kind}: ${from ? fullName(from) : "Unknown"} <-> ${to ? fullName(to) : "Unknown"}; hidden=${relationship.hidden}; motiveRisk=${relationship.motiveRisk}${availability}; ${relationship.detail}`;
    })
    : ["- None recorded."]));
  lines.push("Murder blueprint:");
  lines.push(...mystery.murders.map((murder, index) => {
    const victim = mystery.npcs.find((npc) => npc.id === murder.victimId);
    const killer = mystery.npcs.find((npc) => npc.id === murder.killerId);
    return `- Murder ${index + 1}: victim ${victim ? fullName(victim) : "Unknown"}, killer ${killer ? fullName(killer) : "Unknown"}, Day ${murder.day} ${murder.daytime}, ${roomName(murder.roomId)}, ${murder.method}. Motive: ${cleanSentenceEnd(murder.motive)}. Proof: ${(murder.proofs?.length ? murder.proofs : [murder.proof]).join(" | ")}.`;
  }));
  lines.push("Generated findables:");
  lines.push(...(mystery.findables.length > 0
    ? mystery.findables.map((findable) => {
      const room = findable.roomId ? roomName(findable.roomId) : "not room-bound";
      const holder = findable.holderNpcId ? mystery.npcs.find((npc) => npc.id === findable.holderNpcId) : undefined;
      return `- ${findable.kind}: ${findable.name}; ${findable.description}; room=${room}; holder=${holder ? fullName(holder) : "none"}; available=${mysteryAvailabilityLabel(findable.availableDay, findable.availableDaytime)}.`;
    })
    : ["- No generated findables."]));
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
  blockedFamilyNames = new Set<string>(),
  usedQuirks = new Set<string>()
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
    quirk: input.quirk ?? mysteryUniqueQuirkFor(normalizedAge, usedQuirks),
    roomId: input.roomId,
    stationRoomId: input.stationRoomId,
    trust: input.trust ?? rand(4, 18),
    temporaryTrust: input.temporaryTrust ?? 0,
    romance: input.romance ?? 0,
    romanceRevealed: input.romanceRevealed ?? false,
    substancePreference: input.substancePreference ?? mysterySubstancePreferenceFor(normalizedAge, input.role),
    substanceState: input.substanceState ?? "sober",
    substanceTurns: input.substanceTurns ?? 0,
    familyRelationNote: input.familyRelationNote,
    ravenwoodPortraitKey: input.ravenwoodPortraitKey,
    portraitLineage: input.portraitLineage,
    visualRace: input.visualRace,
    alive: input.alive ?? true,
    isChild
  };
}

function createMysteryGameFromDraft(
  draft: CharacterDraft,
  detectiveProfile?: MysteryDetectiveProfile,
  detectiveAge = 30
): MysteryGame {
  const playerInput = detectiveProfile ?? draft;
  const playerAge = detectiveProfile ? detectiveAge : 30;
  const usedNames = new Set<string>();
  const usedFirstNames = new Set<string>();
  const usedPortraitKeys = new Set<string>();
  const usedQuirks = new Set<string>();

  const playerFamilyName = detectiveProfile
    ? detectiveProfile.familyName.trim()
    : ravenwoodFamilyName(playerInput.familyName.trim());

  const playerFirstName = detectiveProfile
    ? detectiveProfile.firstName.trim()
    : uniqueRavenwoodFirstName(
        playerInput.sex,
        playerFamilyName,
        usedNames,
        usedFirstNames,
        playerInput.firstName.trim()
      );

  usedFirstNames.add(playerFirstName.toLowerCase());
  usedNames.add(`${playerFirstName} ${playerFamilyName}`.toLowerCase());

  const blockedFamilyNames = new Set<string>([
    playerFamilyName.toLowerCase()
  ]);
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
  let generatedCousinLinks = 0;
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
        generatedCousinLinks < 3 ? "Cousin" : "",
        relatedAdult.age >= 36 ? "Adult child" : "",
        relatedAdult.age <= 58 ? "Parent" : "",
        !mysteryHasSpouseRelationship(npcRelationships, relatedAdult) ? "Spouse" : ""
      ].filter(Boolean)
      : [];
    const familyLink = relatedAdult && possibleFamilyLinks.length > 0 ? pick(possibleFamilyLinks) : null;
    const relatedAge = relatedAdult?.age ?? rand(18, RAVENWOOD_MAX_NPC_AGE);
    const sex = nextResidentSex();
    const age = familyLink === "Spouse"
      ? (() => {
        const proposedAge = clamp(relatedAge + rand(-9, 9), 18, RAVENWOOD_MAX_NPC_AGE);
        if (relatedAge >= 50 && proposedAge < 50 && !roll(0.08)) return rand(50, Math.max(50, Math.min(RAVENWOOD_MAX_NPC_AGE, relatedAge + 9)));
        if (relatedAge < 50 && proposedAge >= 50 && !roll(0.08)) return rand(18, 49);
        return proposedAge;
      })()
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
      reasonOfStay: relatedAdult ? relatedAdult.reasonOfStay : undefined,
      currentStay: relatedAdult ? relatedAdult.currentStay : undefined,
      plannedStay: relatedAdult ? relatedAdult.plannedStay : undefined,
      previousStay: relatedAdult ? relatedAdult.previousStay : undefined,
      ravenwoodPortraitKey: portrait?.key,
      portraitLineage: portrait?.lineage,
      visualRace: portrait?.visualRace,
      roomId: room.id,
      stationRoomId: pick(["drawing-room", "library", "dining-room", "conservatory", "billiards-room", "smoking-room", "west-gallery"])
    }, usedNames, usedFirstNames, blockedFamilyNames, usedQuirks);
    if (relatedAdult && familyLink === "Spouse") {
      const added = addMysteryNpcRelationship(npcRelationships, relatedAdult, npc, "Marriage", `${fullName(relatedAdult)} and ${fullName(npc)} arrived as spouses.`, { trustImpact: 10, motiveRisk: 3, skipGuards: true });
      if (added) {
        relatedAdult.familyStatus = "Married";
        addMysteryFamilyNote(relatedAdult, `Spouse of ${fullName(npc)}`);
        addMysteryFamilyNote(npc, `Spouse of ${fullName(relatedAdult)}`);
      }
    } else if (relatedAdult && familyLink === "Sibling") {
      const added = addMysteryNpcRelationship(npcRelationships, relatedAdult, npc, "Family", `${fullName(relatedAdult)} and ${fullName(npc)} are siblings.`, { trustImpact: 8, motiveRisk: 2 });
      if (added) {
        addMysteryFamilyNote(relatedAdult, `${mysteryTitleCaseRelation(mysterySiblingRole(relatedAdult))} of ${fullName(npc)}`);
        addMysteryFamilyNote(npc, `${mysteryTitleCaseRelation(mysterySiblingRole(npc))} of ${fullName(relatedAdult)}`);
      }
    } else if (relatedAdult && familyLink === "Cousin") {
      const added = addMysteryNpcRelationship(npcRelationships, relatedAdult, npc, "Family", `${fullName(relatedAdult)} and ${fullName(npc)} are cousins.`, { trustImpact: 5, motiveRisk: 2 });
      if (added) {
        generatedCousinLinks += 1;
        addMysteryFamilyNote(relatedAdult, `Cousin of ${fullName(npc)}`);
        addMysteryFamilyNote(npc, `Cousin of ${fullName(relatedAdult)}`);
      }
    } else if (relatedAdult && familyLink === "Adult child") {
      const added = addMysteryNpcRelationship(npcRelationships, relatedAdult, npc, "Family", `${fullName(relatedAdult)} is parent to ${fullName(npc)}.`, { trustImpact: 9, motiveRisk: 3 });
      if (added) {
        addMysteryFamilyNote(relatedAdult, `${mysteryTitleCaseRelation(mysteryParentRole(relatedAdult))} of ${mysteryChildRole(npc)} ${fullName(npc)}`);
        addMysteryFamilyNote(npc, `${mysteryTitleCaseRelation(mysteryChildRole(npc))} of ${mysteryParentRole(relatedAdult)} ${fullName(relatedAdult)}`);
      }
    } else if (relatedAdult && familyLink === "Parent") {
      const added = addMysteryNpcRelationship(npcRelationships, relatedAdult, npc, "Family", `${fullName(npc)} is parent to ${fullName(relatedAdult)}.`, { trustImpact: 9, motiveRisk: 3 });
      if (added) {
        addMysteryFamilyNote(relatedAdult, `${mysteryTitleCaseRelation(mysteryChildRole(relatedAdult))} of ${mysteryParentRole(npc)} ${fullName(npc)}`);
        addMysteryFamilyNote(npc, `${mysteryTitleCaseRelation(mysteryParentRole(npc))} of ${mysteryChildRole(relatedAdult)} ${fullName(relatedAdult)}`);
      }
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
      reasonOfStay: guardian.reasonOfStay,
      currentStay: guardian.currentStay,
      plannedStay: guardian.plannedStay,
      previousStay: guardian.previousStay,
      roomId: childRoom.id,
      stationRoomId: guardian.stationRoomId
    }, usedNames, usedFirstNames, blockedFamilyNames, usedQuirks);
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
    const childRelationshipAdded = addMysteryNpcRelationship(npcRelationships, guardian, child, "Family", `${fullName(child)} is staying with ${guardianRelation.reasonRole} ${fullName(guardian)}.`, { trustImpact: 12, motiveRisk: 2 });
    if (childRelationshipAdded) {
      addMysteryFamilyNote(guardian, `${titleCase(guardianRelation.guardianRelation)} ${fullName(child)}`);
      addMysteryFamilyNote(child, `${titleCase(guardianRelation.childRelation)} ${fullName(guardian)}`);
    }
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
    }, usedNames, usedFirstNames, blockedFamilyNames, usedQuirks);
    npcs.push(npc);
    rooms.find((room) => room.id === stationRoomId)?.occupantIds.push(npc.id);
  }
  buildMysteryNpcRelationshipPool(npcs, npcRelationships);
  npcRelationships.splice(0, npcRelationships.length, ...normalizeMysteryNpcRelationships(npcs, npcRelationships));
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
  const murderSchedule = mysteryGeneratedMurderSchedule(murderCount);
  for (let index = 0; index < murderSchedule.length; index += 1) {
    const livingNpcs = npcs.filter((npc) => !deadNpcIds.has(npc.id));
    const repeatKillerIds = previousKillerIds.filter((id) => !deadNpcIds.has(id));
    const killer = repeatKillerIds.length > 0 && roll(index === 1 ? 0.78 : 0.68)
      ? npcs.find((npc) => npc.id === pick(repeatKillerIds)) ?? pick(livingNpcs)
      : pick(livingNpcs);
    const victimPool = livingNpcs.filter((npc) => npc.id !== killer.id && !previousKillerIds.includes(npc.id));
    const fallbackVictimPool = livingNpcs.filter((npc) => npc.id !== killer.id);
    const victim = pick(victimPool.length > 0 ? victimPool : fallbackVictimPool);
    const { day: murderDay, daytime } = murderSchedule[index];
    const method = pick(mysteryMethods);
    const methodRooms = mysteryRoomsForMethod(method, rooms, playerRoom.id);
    const room = pick(methodRooms.length > 0 ? methodRooms : rooms.filter((candidate) => candidate.id !== playerRoom.id && (candidate.kind !== "guest" || candidate.accessible)));
    const motive = mysteryMotiveFor(killer, victim, npcs, npcRelationships, murderDay, daytime, murders);
    murders.push({
      victimId: victim.id,
      killerId: killer.id,
      day: murderDay,
      daytime,
      roomId: room.id,
      method,
      motive,
      proof: "",
      proofs: [],
      discovered: false
    });
    deadNpcIds.add(victim.id);
    previousKillerIds.push(killer.id);
  }
  const scenarioSanityLines = repairMysteryMurderTimelineAndMotives(murders, npcs, npcRelationships);
  for (const murder of murders) {
    const killer = npcs.find((npc) => npc.id === murder.killerId);
    const victim = npcs.find((npc) => npc.id === murder.victimId);
    if (!killer || !victim) continue;
    const proofs = mysteryProofsFor(murder.method, murder.motive, killer, victim, npcs, npcRelationships, murder.day, murder.daytime);
    murder.proofs = proofs;
    murder.proof = proofs[0] ?? `Proof linking ${fullName(killer)} to ${fullName(victim)}'s death`;
  }
  const findables = mysteryFindablesForScenario(murders, npcs, rooms, npcRelationships);
  for (const [index, murder] of murders.entries()) {
    const exactProofs = findables
      .filter((findable) => findable.kind === "Proof" && findable.relatedMurderIndex === index && findable.proofText)
      .map((findable) => findable.proofText as string);
    if (exactProofs.length > 0) {
      murder.proofs = exactProofs;
      murder.proof = exactProofs[0];
    }
  }
  npcRelationships.splice(0, npcRelationships.length, ...normalizeMysteryNpcRelationships(npcs, npcRelationships));
  const lockdownReason = pick(mysteryLockdownReasons);
  const mysteryId = uid();
  const inventory = [`key to ${playerRoom.name}`, "travel bag", "notebook", "pencil"];
  if (playerFirstName === "Mira") inventory.push("deck of cards");
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
      faceTrait: playerInput.faceTrait ?? initialDraft.faceTrait,
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
findables,
currentRoomId: "grand-hall",
playerRoomId: playerRoom.id,
messages: [
  {
    id: uid(),
    speaker: "System",
    text: "Ravenwood prototype: investigate freely. Text advances time; risky actions use d12 rolls.",
  },
  {
    id: uid(),
    speaker: "GM",
    text: `${playerFirstName} ${playerFamilyName} receives a brass key for ${playerRoom.name} in the Great Hall. ${
      openingServant
        ? `${openingServant.firstName} ${openingServant.familyName} - a ${openingServant.occupation.toLowerCase()} - explains that ${lockdownReason}; no one is leaving Ravenwood Manor for the foreseeable future. They also let you know that WIFI is down, and phone service is not working.`
        : `The host explains that ${lockdownReason}; no one is leaving Ravenwood Manor for the foreseeable future.`
    }`,
  },
],
journal: [],
journalNotes: "",
sanityLedger: [],
discoveredProof: [],
inventory,
finished: false,
won: false,
  };
  return {
    ...mystery,
    sanityLedger: [...buildMysterySanityLedger(mystery), ...scenarioSanityLines].slice(-600)
  };
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("menu");
  const [themeName, setThemeName] = useState<ThemeName>("dark");
  const [draft, setDraft] = useState<CharacterDraft>(initialDraft);
  const [mysteries, setMysteries] = useState<MysteryGame[]>([]);
  const [activeMysteryId, setActiveMysteryId] = useState<string | null>(null);
  const [selectedMysteryDetectiveId, setSelectedMysteryDetectiveId] = useState(ravenwoodDetectiveProfiles[0].id);
  const [selectedMysteryDetectiveAge, setSelectedMysteryDetectiveAge] = useState(24);
  const [focusedMysteryNpcId, setFocusedMysteryNpcId] = useState<string | null>(null);
  const [selectedMysteryTreeNpcId, setSelectedMysteryTreeNpcId] = useState<string | null>(null);
  const [draggingMysteryItem, setDraggingMysteryItem] = useState<string | null>(null);
  const [draggingMysteryNpcId, setDraggingMysteryNpcId] = useState<string | null>(null);
  const [mysteryInput, setMysteryInput] = useState("");
  const [mysteryAiThinking, setMysteryAiThinking] = useState(false);
  const [expandedMysteryArchiveDays, setExpandedMysteryArchiveDays] = useState<Record<number, boolean>>({});
  const [mysteryTreeViewport, setMysteryTreeViewport] = useState({ width: 0, height: 0 });
  const mysteryRelationsScrollRef = useRef<ScrollView | null>(null);
  const mysteryRelationsScrollYRef = useRef(0);
  const restoreMysteryRelationsScrollRef = useRef(false);
  const mysteryTreeHorizontalRef = useRef<ScrollView | null>(null);
  const mysteryTreeVerticalRef = useRef<ScrollView | null>(null);
  const mysteryTreeSelectedCenterRef = useRef<{ x: number; y: number; canvasWidth: number; canvasHeight: number } | null>(null);
  const mysteryTreePressRef = useRef<{ npcId: string; time: number } | null>(null);
  const mysteryTreeSinglePressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const detectiveCarouselRef = useRef<ScrollView | null>(null);
  const detectiveCarouselOffsetRef = useRef(0);
  const C = themes[themeName];
  const activeMystery = useMemo(() => mysteries.find((mystery) => mystery.id === activeMysteryId) ?? null, [activeMysteryId, mysteries]);
  const selectedMysteryDetective = useMemo(
    () => ravenwoodDetectiveProfiles.find((profile) => profile.id === selectedMysteryDetectiveId) ?? ravenwoodDetectiveProfiles[0],
    [selectedMysteryDetectiveId]
  );

  useEffect(() => {
    if (screen !== "mysteryFamilyTree" || !activeMystery || mysteryTreeViewport.width <= 0 || mysteryTreeViewport.height <= 0) return;
    const selected = mysteryTreeSelectedCenterRef.current;
    if (!selected) return;
    const x = clamp(selected.x - mysteryTreeViewport.width / 2, 0, Math.max(0, selected.canvasWidth - mysteryTreeViewport.width));
    const y = clamp(selected.y - mysteryTreeViewport.height / 2, 0, Math.max(0, selected.canvasHeight - mysteryTreeViewport.height));
    const timer = setTimeout(() => {
      mysteryTreeHorizontalRef.current?.scrollTo({ x, y: 0, animated: false });
      mysteryTreeVerticalRef.current?.scrollTo({ x: 0, y, animated: false });
    }, 80);
    return () => clearTimeout(timer);
  }, [screen, activeMystery?.id, selectedMysteryTreeNpcId, mysteryTreeViewport.width, mysteryTreeViewport.height]);

  useEffect(() => {
    if (screen !== "mysteryRelations" || !restoreMysteryRelationsScrollRef.current) return;
    const y = mysteryRelationsScrollYRef.current;
    const timer = setTimeout(() => {
      mysteryRelationsScrollRef.current?.scrollTo({ x: 0, y, animated: false });
      restoreMysteryRelationsScrollRef.current = false;
    }, 80);
    return () => clearTimeout(timer);
  }, [screen, activeMystery?.id]);

  useEffect(() => {
    return () => {
      if (mysteryTreeSinglePressTimerRef.current) clearTimeout(mysteryTreeSinglePressTimerRef.current);
    };
  }, []);

  function chooseMysteryDetective(profileId: string) {
    const scrollX = detectiveCarouselOffsetRef.current;
    setSelectedMysteryDetectiveId(profileId);
    setSelectedMysteryDetectiveAge(24);
    requestAnimationFrame(() => {
      detectiveCarouselRef.current?.scrollTo({ x: scrollX, y: 0, animated: false });
    });
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

  function effectiveMysteryTrust(npc: MysteryNpc): number {
    return clamp(npc.trust + (npc.temporaryTrust ?? 0), 0, 100);
  }

  function readableMysterySecret(secret: string): string {
    return secret
      .replace(/secretly changed room keys before arrival/gi, "requested a room change at arrival")
      .replace(/secretly changed room keys/gi, "requested a room change")
      .replace(/changed room keys before arrival/gi, "requested a room change at arrival");
  }

  function currentMysteryNpcRoomId(mystery: Pick<MysteryGame, "id" | "day" | "daytime">, npc: MysteryNpc): string {
    if (!npc.alive) return npc.role === "Guest" ? npc.roomId : npc.stationRoomId;
    if (ravenwoodMealTimes.includes(mystery.daytime) && npc.age >= 13) return "dining-room";
    if (npc.substanceState === "drunk" && ravenwoodDrinkTimes.includes(mystery.daytime)) return pickByHash(ravenwoodSocialRooms, `${mystery.id}-${mystery.day}-${mystery.daytime}-${npc.id}-drunk`);
    if (npc.substanceState === "high" || npc.substancePreference.includes("cigarettes") || npc.substancePreference.includes("weed")) {
      const smokeRoll = stableHash(`${mystery.id}-${mystery.day}-${mystery.daytime}-${npc.id}-smoke`) % 100;
      if (smokeRoll < 38 && (mystery.daytime === "Afternoon" || mystery.daytime === "Evening" || mystery.daytime === "Night")) return "smoking-room";
    }
    if (npc.role === "Staff" && !ravenwoodDrinkTimes.includes(mystery.daytime)) return npc.stationRoomId;
    const driftChance = npc.role === "Guest" ? 62 : 22;
    const driftRoll = stableHash(`${mystery.id}-${mystery.day}-${mystery.daytime}-${npc.id}-room`) % 100;
    if (driftRoll < driftChance) return pickByHash(ravenwoodSocialRooms, `${mystery.id}-${mystery.day}-${mystery.daytime}-${npc.id}-social-room`);
    return npc.role === "Guest" ? npc.roomId : npc.stationRoomId;
  }

  function mysteryPeopleInRoom(mystery: MysteryGame, roomId: string) {
    const mealTime = mystery.daytime === "Breakfast" || mystery.daytime === "Lunch";
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
      if (!npc.alive) return false;
      if (mealTime && stableHash(`${mystery.id}-${mystery.day}-${mystery.daytime}-${npc.id}`) % 100 >= (npc.role === "Guest" ? 82 : 35)) {
        return currentMysteryNpcRoomId(mystery, npc) === roomId;
      }
      return currentMysteryNpcRoomId(mystery, npc) === roomId;
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

  function mysteryRollOutcome(text: string, mystery: MysteryGame): MysteryRollOutcome | undefined {
    const check = mysteryCheckKindForText(text);
    if (!check) return undefined;
    const die = rand(1, 12);
    const quirkModifier = mysteryQuirkModifierFor(mystery.player.detectiveQuirks, check);
    const result = die + quirkModifier;
    const tier = result >= 10 ? "hard" : result >= 6 ? "medium" : result >= 3 ? "easy" : "failed";
    return { check, die, modifier: quirkModifier, total: result, tier };
  }

  function mysteryRollText(rollResult?: MysteryRollOutcome): string | undefined {
    if (!rollResult) return undefined;
    const quirkText = rollResult.modifier === 0 ? "" : " with detective trait";
    return `Roll: ${rollResult.check} d12 ${rollResult.die}${quirkText} = ${rollResult.total} (${rollResult.tier})`;
  }

  function mysteryRollMeets(rollResult: MysteryRollOutcome | undefined, tier: MysteryRollOutcome["tier"]): boolean {
    if (!rollResult) return false;
    const needed = tier === "hard" ? 10 : tier === "medium" ? 6 : tier === "easy" ? 3 : 2;
    return rollResult.total >= needed;
  }

  function mysteryRollBotched(rollResult: MysteryRollOutcome | undefined): boolean {
    return Boolean(rollResult && rollResult.total <= 1);
  }

  function mysteryRoll(_text: string, _mystery: MysteryGame): string | undefined {
    const rollResult = mysteryRollOutcome(_text, _mystery);
    return mysteryRollText(rollResult);
  }

  function pickByHash<T>(items: readonly T[], seed: string): T {
    return items[stableHash(seed) % items.length];
  }

  function mysterySubstanceLine(npc: MysteryNpc): string | null {
    if (npc.substanceState === "drunk") return `${fullName(npc)} is drunk; their voice runs warmer, louder, and less guarded than usual.`;
    if (npc.substanceState === "tipsy") return `${fullName(npc)} is tipsy enough for their manners to loosen.`;
    if (npc.substanceState === "high") return `${fullName(npc)} seems high; their attention drifts and their trust is temporarily unstable.`;
    if (npc.substancePreference.includes("cigarettes")) return `${fullName(npc)} smells faintly of cigarette smoke.`;
    return null;
  }

  function refreshMysteryNpcStates(mystery: MysteryGame, npcs: MysteryNpc[], nextTime: { day: number; daytime: Daytime }): MysteryNpc[] {
    return npcs.map((npc) => {
      if (!npc.alive || npc.age < 16) return npc;
      let substanceState = npc.substanceTurns > 1 ? npc.substanceState : "sober";
      let substanceTurns = Math.max(0, npc.substanceTurns - 1);
      let temporaryTrust = substanceTurns > 0 ? npc.temporaryTrust : 0;
      const seed = `${mystery.id}-${nextTime.day}-${nextTime.daytime}-${npc.id}-substance`;
      const rollValue = stableHash(seed) % 100;
      if (ravenwoodDrinkTimes.includes(nextTime.daytime) && npc.substancePreference.includes("alcohol") && rollValue < 30) {
        substanceState = rollValue < 10 ? "drunk" : "tipsy";
        substanceTurns = substanceState === "drunk" ? 3 : 2;
        temporaryTrust = substanceState === "drunk" ? rand(-7, 8) : rand(-3, 5);
      } else if ((nextTime.daytime === "Afternoon" || nextTime.daytime === "Evening" || nextTime.daytime === "Night") && npc.substancePreference.includes("weed") && rollValue >= 30 && rollValue < 48) {
        substanceState = "high";
        substanceTurns = 3;
        temporaryTrust = rand(-6, 9);
      }
      return { ...npc, substanceState, substanceTurns, temporaryTrust };
    });
  }

  function resolveMysteryAbandonedItemPickups(mystery: MysteryGame, npcs: MysteryNpc[], findables: MysteryFindable[], nextTime: { day: number; daytime: Daytime }): { findables: MysteryFindable[]; ledgerLines: string[] } {
    const ledgerLines: string[] = [];
    const timeMystery = { ...mystery, day: nextTime.day, daytime: nextTime.daytime };
    const updated = findables.map((findable) => {
      if (findable.kind !== "Snatchable" || findable.origin !== "Abandoned" || findable.holderNpcId || !findable.roomId || findable.collected) return findable;
      if (!mysteryFindableAvailability(findable, nextTime.day, nextTime.daytime)) return findable;
      const passers = npcs.filter((npc) => npc.alive && currentMysteryNpcRoomId(timeMystery, npc) === findable.roomId);
      const picker = passers.find((npc) => stableHash(`${mystery.id}-${nextTime.day}-${nextTime.daytime}-${findable.id}-${npc.id}-pickup`) % 100 < 58);
      if (!picker) return findable;
      ledgerLines.push(`${fullName(picker)} picked up abandoned item "${findable.name}" in ${mysteryRoomName(mystery, findable.roomId)} on Day ${nextTime.day} ${nextTime.daytime}.`);
      return {
        ...findable,
        holderNpcId: picker.id,
        description: `${findable.description} ${fullName(picker)} later picked it up in ${mysteryRoomName(mystery, findable.roomId)}.`
      };
    });
    return { findables: updated, ledgerLines };
  }

  function mysteryTrustLabel(npc: MysteryNpc): string {
    const trust = effectiveMysteryTrust(npc);
    if (trust >= 74) return "trusts you";
    if (trust >= 52) return "leans toward you";
    if (trust >= 32) return "is cautious";
    if (trust >= 16) return "is guarded";
    return "does not trust you";
  }

  function mysteryToneForText(text: string): "kind" | "rude" | "threat" | "flirt" | "accuse" | "neutral" {
    const lower = text.toLowerCase();
    if (lower.match(/\b(threat|threaten|blackmail|force|intimidate|scare|corner)\b/)) return "threat";
    if (lower.match(/\b(accuse|murderer|killer|liar|guilty)\b/)) return "accuse";
    if (lower.match(/\b(flirt|beautiful|handsome|dance|romantic|kiss|seduce|darling|dear)\b/)) return "flirt";
    if (lower.match(/\b(stupid|idiot|shut up|coward|pathetic|worthless|trash)\b/)) return "rude";
    if (lower.match(/\b(please|kindly|sorry|thank|comfort|gentle|calm|help|understand)\b/)) return "kind";
    return "neutral";
  }

  function mysteryToneTrustDelta(text: string, rollResult: MysteryRollOutcome | undefined, npc: MysteryNpc): number {
    const tone = mysteryToneForText(text);
    const tierDelta = rollResult?.tier === "hard" ? 5 : rollResult?.tier === "medium" ? 3 : rollResult?.tier === "easy" ? 1 : -2;
    const alteredModifier = npc.substanceState === "drunk" || npc.substanceState === "high" ? rand(-2, 3) : 0;
    if (tone === "kind") return Math.max(1, tierDelta + alteredModifier);
    if (tone === "flirt") return npc.age >= 18 ? clamp(tierDelta + alteredModifier, -4, 6) : -6;
    if (tone === "threat") return rollResult?.tier === "hard" ? -2 : -8;
    if (tone === "accuse") return rollResult?.tier === "hard" ? -3 : -9;
    if (tone === "rude") return -7;
    return rollResult && rollResult.tier !== "failed" ? 1 + alteredModifier : alteredModifier;
  }

  function applyMysteryTrustDelta(npcs: MysteryNpc[], ids: string[], delta: number): MysteryNpc[] {
    const idSet = new Set(ids);
    return npcs.map((npc) => idSet.has(npc.id) ? { ...npc, trust: clamp(npc.trust + delta, 0, 100) } : npc);
  }

  function mysteryTargetNpc(text: string, mystery: MysteryGame, roomId: string): MysteryNpc | undefined {
    const lower = text.toLowerCase();
    const named = mystery.npcs.find((npc) => lower.includes(npc.firstName.toLowerCase()) || lower.includes(fullName(npc).toLowerCase()));
    if (named) return named;
    const roomPeople = mysteryPeopleInRoom(mystery, roomId).filter((person) => person.id !== mystery.player.id) as MysteryNpc[];
    return roomPeople[0];
  }

  function mysteryNpcRelationshipContext(npc: MysteryNpc, mystery: MysteryGame): string | null {
    const relationship = mystery.npcRelationships.find((item) => {
      if (item.fromId !== npc.id && item.toId !== npc.id) return false;
      if (item.availableDay && item.availableDaytime && !mysteryTimeHasArrived(mystery.day, mystery.daytime, item.availableDay, item.availableDaytime)) return false;
      return true;
    });
    if (!relationship) return null;
    const otherId = relationship.fromId === npc.id ? relationship.toId : relationship.fromId;
    return `${relationship.kind.toLowerCase()} with ${mysteryNpcName(mystery, otherId)}`;
  }

  function mysteryCrimeContextForNpc(npc: MysteryNpc, mystery: MysteryGame): string {
    const killed = mystery.murders.find((murder) => murder.victimId === npc.id);
    if (killed?.discovered) return "the victim whose silence now weighs on the house";
    const killer = mystery.murders.find((murder) => murder.killerId === npc.id);
    if (killer) return "protecting a dangerous secret";
    const relation = mystery.murders.find((murder) => murder.victimId !== npc.id && murder.killerId !== npc.id && mystery.npcRelationships.some((item) => (item.fromId === npc.id && item.toId === murder.victimId) || (item.toId === npc.id && item.fromId === murder.victimId) || (item.fromId === npc.id && item.toId === murder.killerId) || (item.toId === npc.id && item.fromId === murder.killerId)));
    if (relation) return "connected to someone at the heart of the case";
    return "watching the scandal from the edge of the circle";
  }

  function mysteryCarriedItems(npc: MysteryNpc): string[] {
    const base = npc.role === "Staff" ? ravenwoodStaffBelongings : ravenwoodPrivateBelongings;
    const items = [
      npc.role === "Staff" ? `${npc.stationRoomId.replace(/-/g, " ")} service key` : `${npc.roomId.replace(/-/g, " ")} room key`,
      pickByHash(base, `${npc.id}-carried-a`),
      pickByHash(base, `${npc.id}-carried-b`),
      `${npc.occupation.toLowerCase()} note`
    ];
    return Array.from(new Set(items));
  }

  function mysteryTheftDifficulty(text: string, npc: MysteryNpc, roomPeople: MysteryNpc[], mystery: MysteryGame): { tier: MysteryRollOutcome["tier"]; item: string; reason: string; findableId?: string } {
    const lower = text.toLowerCase();
    const snatchables = (mystery.findables ?? []).filter((findable) =>
      findable.kind === "Snatchable" &&
      findable.holderNpcId === npc.id &&
      mysteryFindableAvailability(findable, mystery.day, mystery.daytime)
    );
    const carried = snatchables.length > 0 ? snatchables.map((findable) => findable.name) : mysteryCarriedItems(npc);
    const requested = carried.find((item) => lower.includes(item.toLowerCase())) ?? carried.find((item) => item.includes("key") && lower.includes("key")) ?? carried[0];
    const findable = snatchables.find((candidate) => candidate.name === requested);
    const witnessCount = roomPeople.filter((person) => person.id !== npc.id).length;
    const targetAlert = npc.substanceState === "drunk" || npc.substanceState === "high" ? -1 : effectiveMysteryTrust(npc) < 18 ? 1 : 0;
    const roomPressure = mystery.daytime === "Night" || mystery.daytime === "Midnight" ? -1 : witnessCount >= 3 ? 1 : 0;
    const itemPressure = requested.includes("key") || requested.includes("ledger") || requested.includes("letter") ? 1 : 0;
    const difficultyScore = targetAlert + roomPressure + itemPressure;
    const tier = difficultyScore >= 2 ? "hard" : difficultyScore >= 1 ? "medium" : "easy";
    const reason = witnessCount > 0
      ? `${witnessCount} resident${witnessCount === 1 ? "" : "s"} could notice`
      : npc.substanceState === "drunk" || npc.substanceState === "high"
        ? `${fullName(npc)} is less steady than usual`
        : "the room gives you a narrow opening";
    return { tier, item: requested, reason, findableId: findable?.id };
  }

  function mysteryReactiveRoomLine(mystery: MysteryGame, roomId: string): string {
    const room = mystery.rooms.find((candidate) => candidate.id === roomId);
    const roomName = mysteryRoomName(mystery, roomId);
    const people = mysteryPeopleInRoom(mystery, roomId).filter((person) => person.id !== mystery.player.id) as MysteryNpc[];
    const nearby = people.length > 0
      ? `${fullName(people[0])} is nearby, ${mysteryTrustLabel(people[0])}${people[0].substanceState !== "sober" ? ` and visibly ${people[0].substanceState}` : ""}.`
      : "No resident is openly present, though the house never feels unwatched.";
    const timeMood = mystery.daytime === "Night" || mystery.daytime === "Midnight"
      ? ravenwoodHotelPremise.night
      : ravenwoodHotelPremise.daytime;
    return `The ${roomName} keeps Ravenwood's manners intact: ${room ? mysteryRoomMood(room) : ravenwoodHotelPremise.mood}. ${nearby} ${timeMood}`;
  }

  function mysterySubstanceBehavior(npc: MysteryNpc): string | null {
    if (npc.substanceState === "drunk") return "Their voice is warmer, louder, and less guarded than usual.";
    if (npc.substanceState === "tipsy") return "Their manners have loosened a little.";
    if (npc.substanceState === "high") return "Their attention drifts between the room and the conversation.";
    if (npc.substancePreference.includes("cigarettes")) return "They smell faintly of cigarette smoke.";
    return null;
  }

  function mysteryFoodAnswer(text: string, mystery: MysteryGame, npc: MysteryNpc, trust: number): string | null {
    const lower = text.toLowerCase();
    if (!lower.match(/\b(food|meal|breakfast|lunch|dinner|tea|kitchen|cook|chef|eat|tasty|good here|served)\b/)) return null;
    const currentMeal = mystery.daytime === "Breakfast" || mystery.daytime === "Lunch" ? mystery.daytime.toLowerCase() : mystery.daytime === "Evening" ? "dinner" : "meals";
    const foodMurder = mystery.murders.find((murder) => murder.discovered && murder.method.toLowerCase().includes("food"));
    if (foodMurder && trust >= 45) {
      return `The food is usually excellent. That is why ${mysteryNpcName(mystery, foodMurder.victimId)} being poisoned through it feels so obscene. I would not touch anything left unattended.`;
    }
    if (npc.role === "Staff") {
      return trust >= 45
        ? `Yes. The kitchen is one of the few parts of Ravenwood that still runs beautifully. ${titleCase(currentMeal)} is usually rich, careful, and far better than the mood in the dining room.`
        : `Yes, the food is good. The kitchen takes pride in that, even when the guests make everything else difficult.`;
    }
    if (npc.substanceState === "drunk") {
      return `Too good, honestly. The sort of food that makes people linger over wine and say things they should have swallowed.`;
    }
    if (npc.substanceState === "high") {
      return `Yes. The puddings especially. Everything tastes a little unreal in this place, but the kitchen knows what it is doing.`;
    }
    if (trust >= 60) {
      return `It is very good. Breakfast is generous, lunch is polished, and dinner tries hard to pretend this house is normal.`;
    }
    if (trust >= 28) {
      return `Good, yes. A little old-fashioned, but good. Ravenwood may be strange, but it does not starve its guests.`;
    }
    return `Yes. Good enough.`;
  }

  function mysteryReferencedInventoryItem(text: string, mystery: MysteryGame): string | undefined {
    const lower = text.toLowerCase();
    return [...mystery.inventory]
      .sort((a, b) => b.length - a.length)
      .find((item) => lower.includes(item.toLowerCase()) || lower.includes(titleCase(item).toLowerCase()));
  }

  function mysteryInventoryItemNpcReaction(item: string, npc: MysteryNpc): string | null {
    const lower = item.toLowerCase();
    const npcName = fullName(npc).toLowerCase();
    const npcInitials = mysteryNpcInitials(npc).toLowerCase();
    if (lower.includes(npcName) || lower.includes(npcInitials)) {
      return "That is mine, or near enough to mine that I want to know where you found it.";
    }
    if ((lower.includes("cigarette") || lower.includes("lighter")) && npc.substancePreference.includes("cigarettes")) {
      return "A cigarette is a small mercy in this house. I might answer better with one in my hand.";
    }
    if ((lower.includes("vial") || lower.includes("aspirin") || lower.includes("prescription")) && /doctor|nurse|medical|first aid/i.test(npc.occupation)) {
      return "Let me see that. Medicine tells a story when people lie about everything else.";
    }
    if ((lower.includes("toy") || lower.includes("drawing")) && npc.age < 13) {
      return "I know that. Children notice where things are dropped when adults are busy pretending.";
    }
    if ((lower.includes("cards") || lower.includes("deck")) && npc.interests.some((interest) => /cards|chess/i.test(interest))) {
      return "Cards make people careless. Put those on a table and someone will show you what they want.";
    }
    if ((lower.includes("letter") || lower.includes("stationery") || lower.includes("envelope") || lower.includes("document")) && npc.trust >= 35) {
      return "Paper is never neutral here. Handwriting, folds, who had access: that is where I would start.";
    }
    if ((lower.includes("perfume") || lower.includes("locket") || lower.includes("ring")) && /dating|engaged|relationship|married/i.test(npc.familyStatus)) {
      return "Careful. Objects like that can ruin a life before they solve a murder.";
    }
    return null;
  }

  function mysteryResidentReply(text: string, mystery: MysteryGame, npc: MysteryNpc, rollResult?: MysteryRollOutcome): { message: StoryMessage; trustDelta: number; romanceDelta: number } {
    const trust = effectiveMysteryTrust(npc);
    const tone = mysteryToneForText(text);
    const relationship = mysteryNpcRelationshipContext(npc, mystery);
    const proofMention = mystery.discoveredProof.find((proof) => proof.toLowerCase().includes(npc.firstName.toLowerCase()) || proof.toLowerCase().includes(npc.familyName.toLowerCase()));
    const discoveredMurder = mystery.murders.find((murder) => murder.discovered);
    const directToCrime = /\b(murder|death|dead|body|killer|motive|alibi|where were|proof|evidence|victim)\b/i.test(text);
    const referencedItem = mysteryReferencedInventoryItem(text, mystery);
    const itemReaction = referencedItem ? mysteryInventoryItemNpcReaction(referencedItem, npc) : null;
    const trustDelta = mysteryToneTrustDelta(text, rollResult, npc);
    const romanceDelta = tone === "flirt" && npc.age >= 18 && rollResult && rollResult.tier !== "failed" ? (rollResult.tier === "hard" ? 6 : rollResult.tier === "medium" ? 3 : 1) : 0;
    const substance = mysterySubstanceBehavior(npc);
    let answer = "";
    const foodAnswer = mysteryFoodAnswer(text, mystery, npc, trust);
    if (itemReaction) {
      answer = itemReaction;
    } else if (foodAnswer) {
      answer = foodAnswer;
    } else if (tone === "threat") {
      answer = trust > 55 && rollResult?.tier === "hard"
        ? "You are frighteningly direct. I will answer because I believe you mean to finish this."
        : "Do not mistake this hotel for an empty house. People hear things through these walls.";
    } else if (tone === "flirt") {
      answer = npc.age < 18
        ? "That is not appropriate. Ask about the case if you must."
        : trust > 45 || rollResult?.tier === "hard"
          ? "You choose a dangerous hour to be charming. Still, I am listening."
          : "Charm is cheap at Ravenwood. Trust costs more.";
    } else if (tone === "kind") {
      answer = "That is the first decent tone I have heard in this house all day. Ask, then.";
    } else if (tone === "rude" || tone === "accuse") {
      answer = rollResult?.tier === "hard" && directToCrime
        ? "Insult me if you must, but I can see you have noticed something real."
        : "If you want honesty, try not to throw stones in a room full of glass.";
    } else if (directToCrime && proofMention) {
      answer = `You have already found ${proofMention}. I saw enough to know it was not left there by accident.`;
    } else if (directToCrime && trust >= 60) {
      answer = relationship
        ? `I will say this once: my ${relationship} matters here, and someone is using that fact as cover.`
        : "The night of it, the staff moved too quietly and the guests spoke too loudly. That is usually where guilt hides.";
    } else if (directToCrime && trust >= 32) {
      answer = discoveredMurder
        ? `${mysteryNpcName(mystery, discoveredMurder.victimId)} had enemies, but Ravenwood teaches enemies to smile at breakfast.`
        : "No one has died in public yet, and that is exactly what makes everyone so careful.";
    } else if (directToCrime) {
      answer = "I do not discuss death with strangers over polished wood and hotel tea.";
    } else if (relationship && trust >= 42) {
      answer = `Ravenwood makes every private tie feel like evidence. Mine is ${relationship}, and I hate that you can use that.`;
    } else {
      answer = `${ravenwoodHotelPremise.identity} People come here to be private. Privacy curdles quickly when the roads close.`;
    }
    const behavior = substance ? `${substance} ` : "";
    const crimeContext = trust >= 50 || rollResult?.tier === "hard" ? ` ${fullName(npc)} seems ${mysteryCrimeContextForNpc(npc, mystery)}.` : "";
    const line = `${behavior}${fullName(npc)} ${mysteryTrustLabel(npc)}. "${answer}"${crimeContext}`;
    return {
      trustDelta,
      romanceDelta,
      message: {
        id: uid(),
        speaker: "GM",
        text: line,
        rich: [
          { text: behavior },
          { text: fullName(npc), npcId: npc.id, color: mysteryDialogueColor(npc, mystery) },
          { text: ` ${mysteryTrustLabel(npc)}. ` },
          { text: `"${answer}"`, color: mysteryDialogueColor(npc, mystery) },
          { text: crimeContext }
        ]
      }
    };
  }

  function stampMysteryMessages(
    messages: StoryMessage[],
    day: number,
    daytime: Daytime
  ): StoryMessage[] {
    return messages.map((message) => ({
      ...message,
      archiveDay: message.archiveDay ?? day,
      archiveDaytime: message.archiveDaytime ?? daytime
    }));
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
      "grand-hall": "polished floors, cold brass, and too many corners make the hall feel formal and unsafe",
      "drawing-room": "the cold chairs and and the ligering smell of cigar darkes the room",
      "dining-room": "silverware waits beside cooling coffee, and the room smells faintly of toast and jam",
      library: "dust, leather, and locked cabinets press close around the reading lamps",
      conservatory: "wet leaves tap the glass while the wind makes the plants whisper",
      "billiards-room": "poor lightning flickers while the billiard balls weem magestic",
      "smoking-room": "the air is stale with ash, brandy, and decisions made in private",
      "west-gallery": "portraits stare down from the walls as juding you from above"
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
      || /["â€śâ€ť]/.test(text);
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

  function mysteryAiPacket(text: string, mystery: MysteryGame, rollResult?: MysteryRollOutcome) {
    const target = mysteryTargetNpc(text, mystery, mystery.currentRoomId);
    const nearby = mysteryPeopleInRoom(mystery, mystery.currentRoomId).filter((person) => person.id !== mystery.player.id) as MysteryNpc[];
    const targetRelationships = target
      ? mystery.npcRelationships
        .filter((relationship) => relationship.fromId === target.id || relationship.toId === target.id)
        .map((relationship) => {
          const otherId = relationship.fromId === target.id ? relationship.toId : relationship.fromId;
          return {
            kind: relationship.kind,
            detail: relationship.detail,
            hidden: relationship.hidden,
            otherResident: mysteryNpcName(mystery, otherId),
            trustImpact: relationship.trustImpact,
            motiveRisk: relationship.motiveRisk
          };
        })
      : [];
    return {
      playerAction: text,
      setting: ravenwoodHotelPremise,
      time: { day: mystery.day, daytime: mystery.daytime },
      room: {
        id: mystery.currentRoomId,
        name: mysteryRoomName(mystery, mystery.currentRoomId),
        mood: mysteryRoomMood(mystery.rooms.find((room) => room.id === mystery.currentRoomId) ?? { id: mystery.currentRoomId, name: mystery.currentRoomId, floor: 1, kind: "public", accessible: true, occupantIds: [] })
      },
      detective: {
        name: fullName(mystery.player),
        age: mysteryPlayerAge(mystery.player),
        sex: mystery.player.sex,
        origin: mystery.player.origin,
        visibleStyle: [mystery.player.faceTrait, mystery.player.hairStyle, mystery.player.hairColor].filter(Boolean).join(", "),
        quirks: mystery.player.detectiveQuirks ?? []
      },
      roll: rollResult ?? null,
      targetResident: target ? {
        id: target.id,
        name: fullName(target),
        firstName: target.firstName,
        sex: target.sex,
        age: target.age,
        role: target.role,
        trustWithPlayer: effectiveMysteryTrust(target),
        baseTrust: target.trust,
        temporaryTrust: target.temporaryTrust,
        romance: target.romanceRevealed ? target.romance : "hidden",
        substanceState: target.substanceState,
        substancePreference: target.substancePreference,
        occupation: target.occupation,
        education: target.education,
        interests: target.interests,
        reasonOfStay: target.reasonOfStay,
        secret: target.secret,
        quirk: target.quirk,
        currentLocation: mysteryRoomName(mystery, currentMysteryNpcRoomId(mystery, target)),
        carriedItems: mysteryCarriedItems(target),
        relationships: targetRelationships
      } : null,
      nearbyResidents: nearby.slice(0, 8).map((npc) => ({
        id: npc.id,
        name: fullName(npc),
        role: npc.role,
        trustWithPlayer: effectiveMysteryTrust(npc),
        substanceState: npc.substanceState,
        currentLocation: mysteryRoomName(mystery, currentMysteryNpcRoomId(mystery, npc))
      })),
      knownCaseState: {
        discoveredProof: mystery.discoveredProof,
        inventory: mystery.inventory,
        discoveredMurders: mystery.murders
          .filter((murder) => murder.discovered)
          .map((murder) => ({
            victim: mysteryNpcName(mystery, murder.victimId),
            room: mysteryRoomName(mystery, murder.roomId),
            method: murder.method,
            motive: murder.motive
          }))
      },
      hiddenTruthForConsistency: {
        murders: mystery.murders.map((murder) => ({
          victim: mysteryNpcName(mystery, murder.victimId),
          killer: mysteryNpcName(mystery, murder.killerId),
          room: mysteryRoomName(mystery, murder.roomId),
          method: murder.method,
          motive: murder.motive,
          proof: murder.proof,
          proofs: murder.proofs,
          discovered: murder.discovered
        }))
      },
      recentConversation: mystery.messages.slice(-4).map((message) => ({ speaker: message.speaker, text: message.text }))
    };
  }

  async function requestMysteryAiReply(text: string, mystery: MysteryGame, rollResult?: MysteryRollOutcome): Promise<MysteryAiReply | null> {
    if (typeof fetch !== "function") return null;
    const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
    const timeout = controller ? setTimeout(() => controller.abort(), 2500) : null;
    try {
      const response = await fetch(ravenwoodAiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mysteryAiPacket(text, mystery, rollResult)),
        signal: controller?.signal
      });
      if (!response.ok) return null;
      const data = await response.json();
      if (!data || typeof data.text !== "string" || data.text.trim().length < 2) return null;
      return {
        text: data.text.trim().slice(0, 900),
        trustDelta: typeof data.trustDelta === "number" ? clamp(Math.round(data.trustDelta), -10, 10) : undefined,
        romanceDelta: typeof data.romanceDelta === "number" ? clamp(Math.round(data.romanceDelta), -8, 8) : undefined,
        revealRomance: Boolean(data.revealRomance),
        usedAi: true
      };
    } catch (_error) {
      return null;
    } finally {
      if (timeout) clearTimeout(timeout);
    }
  }

  async function submitMysteryInput() {
    if (!activeMystery || activeMystery.finished) return;
    const text = mysteryInput.trim().slice(0, 500);
    if (!text) return;
    const turnMystery = activeMystery;
    const turnRollResult = mysteryRollOutcome(text, turnMystery);
    setMysteryInput("");
    setMysteryAiThinking(true);
    const aiReply = await requestMysteryAiReply(text, turnMystery, turnRollResult);
    setMysteryAiThinking(false);
    patchMystery((mystery) => {
      const nextTime = nextMysteryTime(mystery.day, mystery.daytime);
      const lower = text.toLowerCase();
      const rollResult = turnRollResult;
      const rollText = mysteryRollText(rollResult);
      const movementRoom = detectMysteryRoomIntent(text, mystery);
      let currentRoom = movementRoom?.id ?? mystery.currentRoomId;
      const messages: StoryMessage[] = [
        { id: uid(), speaker: "Player", text }
      ];
      let journal = [...mystery.journal];
      let npcs = refreshMysteryNpcStates(mystery, mystery.npcs, nextTime);
      let murders = mystery.murders;
      let inventory = [...mystery.inventory];
      let findables = [...(mystery.findables ?? [])];
      const namedSuspect = npcs.find((npc) => lower.includes(npc.firstName.toLowerCase()) || lower.includes(fullName(npc).toLowerCase()));
      const suspectMurders = namedSuspect ? murders.filter((murder) => murder.killerId === namedSuspect.id) : [];
      const suspectProofs = suspectMurders.flatMap((murder) => murder.proofs?.length ? murder.proofs : [murder.proof]);
      let discoveredProof = [...mystery.discoveredProof];
      let finished = false;
      let won = false;
      let summary = mystery.summary;
      let lossPending = mystery.lossPending;
      const workingMystery = () => ({ ...mystery, currentRoomId: currentRoom, npcs, murders, findables, discoveredProof });
      const ledgerLines = [
        `Turn: Day ${mystery.day} ${mystery.daytime}, ${mysteryRoomName(mystery, mystery.currentRoomId)}. Player wrote: "${text}". Next clock: Day ${nextTime.day} ${nextTime.daytime}.`
      ];
      const abandonedPickups = resolveMysteryAbandonedItemPickups(mystery, npcs, findables, nextTime);
      findables = abandonedPickups.findables;
      ledgerLines.push(...abandonedPickups.ledgerLines);
      if (movementRoom && movementRoom.id !== mystery.currentRoomId) {
        messages.push(mysteryRoomDescription(workingMystery(), currentRoom));
        ledgerLines.push(`Typed movement: ${mystery.player.firstName} moved from ${mysteryRoomName(mystery, mystery.currentRoomId)} to ${movementRoom.name}.`);
      }

      let bodyDiscoveryHappened = false;
      const dueMurders = murders.filter((murder) => !murder.discovered && (murder.day < nextTime.day || (murder.day === nextTime.day && daytimes.indexOf(murder.daytime) <= daytimes.indexOf(nextTime.daytime))));
      if (dueMurders.length > 0) {
        const dueVictimIds = new Set(dueMurders.map((murder) => murder.victimId));
        npcs = npcs.map((npc) => dueVictimIds.has(npc.id) ? { ...npc, alive: false } : npc);
        const discoveredMurder = dueMurders.find((murder) => murder.roomId === currentRoom);
        if (discoveredMurder) {
          bodyDiscoveryHappened = true;
          murders = murders.map((candidate) => candidate === discoveredMurder ? { ...candidate, discovered: true } : candidate);
          messages.push({
            id: uid(),
            speaker: "GM",
            icon: "death",
            text: `Dead body found! ${mysteryNpcName(mystery, discoveredMurder.victimId)} is found dead in the ${mysteryRoomName(mystery, discoveredMurder.roomId)}. The method appears to be ${discoveredMurder.method}.`
          });
          ledgerLines.push(`Murder discovered by room entry: victim ${mysteryNpcName(mystery, discoveredMurder.victimId)}; killer ${mysteryNpcName(mystery, discoveredMurder.killerId)}; room ${mysteryRoomName(mystery, discoveredMurder.roomId)}; method ${discoveredMurder.method}. Victim marked dead.`);
        } else {
          ledgerLines.push(`Undiscovered murder time passed: ${dueMurders.map((murder) => mysteryNpcName(mystery, murder.victimId)).join(", ")} marked dead offscreen until the murder room is entered.`);
        }
      }

      if (bodyDiscoveryHappened) {
        ledgerLines.push("Action paused for the body discovery pop-up.");
      } else if (lower.match(/\b(steal|snatch|pickpocket|lift|palm|take .*from|slip .*pocket|borrow .*without)\b/)) {
        const roomPeople = mysteryPeopleInRoom(workingMystery(), currentRoom).filter((person) => person.id !== mystery.player.id) as MysteryNpc[];
        const target = mysteryTargetNpc(text, workingMystery(), currentRoom);
        if (!target || !roomPeople.some((person) => person.id === target.id)) {
          const line = `You prepare the move, but no clear target is close enough in the ${mysteryRoomName(mystery, currentRoom)}. Ravenwood offers shadow, not opportunity.`;
          messages.push({ id: uid(), speaker: "GM", text: line, roll: rollText, rich: mysteryNpcSegments(line, workingMystery()) });
          ledgerLines.push(`Theft attempt had no reachable target in ${mysteryRoomName(mystery, currentRoom)}.${rollText ? ` ${rollText}.` : ""}`);
        } else {
          const difficulty = mysteryTheftDifficulty(text, target, roomPeople, workingMystery());
          if (mysteryRollBotched(rollResult)) {
            const witnesses = roomPeople.map((person) => person.id);
            npcs = applyMysteryTrustDelta(npcs, witnesses, -12);
            const witnessNames = roomPeople.slice(0, 3).map(fullName).join(", ");
            messages.push({ id: uid(), speaker: "GM", text: `Caught. Your hand is seen near ${fullName(target)}'s belongings before you can recover. Trust drops with everyone present${witnessNames ? `: ${witnessNames}` : ""}.`, roll: rollText });
            ledgerLines.push(`Botched theft: target ${fullName(target)}; trust -12 for present residents.${rollText ? ` ${rollText}.` : ""}`);
          } else if (mysteryRollMeets(rollResult, difficulty.tier)) {
            const item = `${difficulty.item} (${fullName(target)})`;
            inventory = inventory.includes(item) ? inventory : [...inventory, item];
            if (difficulty.findableId) {
              findables = findables.map((findable) => findable.id === difficulty.findableId ? { ...findable, collected: true } : findable);
            }
            npcs = applyMysteryTrustDelta(npcs, [target.id], target.substanceState === "drunk" || target.substanceState === "high" ? -1 : -4);
            messages.push({ id: uid(), speaker: "GM", text: `Sleight of Hand succeeds against ${difficulty.tier} difficulty: ${difficulty.reason}. You take ${difficulty.item} from ${fullName(target)} without an open scene.`, roll: rollText });
            ledgerLines.push(`Successful theft: ${item}; difficulty ${difficulty.tier}; target trust adjusted.${rollText ? ` ${rollText}.` : ""}`);
          } else {
            const noticed = rollResult ? rollResult.total <= 2 : true;
            if (noticed) npcs = applyMysteryTrustDelta(npcs, [target.id], -6);
            messages.push({ id: uid(), speaker: "GM", text: `The theft does not land. ${difficulty.item} stays with ${fullName(target)}; ${difficulty.reason}. ${noticed ? `${fullName(target)} notices enough to pull away.` : "You withdraw before anyone can prove what you meant."}`, roll: rollText });
            ledgerLines.push(`Failed theft: target ${fullName(target)}; difficulty ${difficulty.tier}; noticed ${noticed}.${rollText ? ` ${rollText}.` : ""}`);
          }
        }
      } else if (lower.includes("search") || lower.includes("investigate") || lower.includes("proof") || lower.includes("evidence") || lower.includes("cards") || lower.includes("deck") || lower.match(/\b(pick up|take|grab)\b/)) {
        const roomFindables = findables.filter((findable) =>
          (findable.kind === "Proof" || (findable.kind === "Snatchable" && !findable.holderNpcId)) &&
          findable.roomId === currentRoom &&
          mysteryFindableAvailability(findable, mystery.day, mystery.daytime) &&
          (findable.kind !== "Proof" || !discoveredProof.includes(findable.proofText ?? findable.description))
        );
        const foundFindable = roomFindables.find((findable) => lower.includes(findable.name.toLowerCase())) ??
          roomFindables.find((findable) => mysteryInventoryIconFor(findable.name) && lower.includes(mysteryInventoryIconFor(findable.name)!)) ??
          roomFindables[0];
        const matchingMurder = foundFindable?.relatedMurderIndex !== undefined ? murders[foundFindable.relatedMurderIndex] : undefined;
        const foundProof = foundFindable?.proofText ?? foundFindable?.description;
        const roomPeople = mysteryPeopleInRoom(workingMystery(), currentRoom).filter((person) => person.id !== mystery.player.id) as MysteryNpc[];
        const searchDifficulty: MysteryRollOutcome["tier"] = matchingMurder?.method.toLowerCase().includes("poison") || roomPeople.length > 2 ? "medium" : mystery.daytime === "Night" || mystery.daytime === "Midnight" ? "hard" : "easy";
        if (foundFindable && foundProof && mysteryRollMeets(rollResult, searchDifficulty)) {
          if (foundFindable.kind === "Proof") discoveredProof.push(foundProof);
          inventory = inventory.includes(foundFindable.name) ? inventory : [...inventory, foundFindable.name];
          findables = findables.map((findable) => findable.id === foundFindable.id ? { ...findable, collected: true } : findable);
          const killerHint = matchingMurder ? ` It points toward ${mysteryNpcName(mystery, matchingMurder.killerId)} if you can connect it cleanly.` : "";
          const findLabel = foundFindable.kind === "Proof" ? "You find proof" : "You find an item";
          messages.push({ id: uid(), speaker: "GM", text: `${findLabel}: ${foundFindable.name}. ${foundFindable.description}${killerHint}`, roll: rollText });
          ledgerLines.push(`${foundFindable.kind} discovered in ${mysteryRoomName(mystery, currentRoom)}: ${foundProof}. Difficulty ${searchDifficulty}.`);
        } else {
          const failReason = matchingMurder && foundProof ? `The clue is here, but this needs a ${searchDifficulty} success and the house keeps it hidden for now.` : "No fresh proof is ready to reveal here.";
          messages.push({ id: uid(), speaker: "GM", text: `${mysteryReactiveRoomLine(workingMystery(), currentRoom)} ${failReason}`, roll: rollText, rich: mysteryNpcSegments(mysteryReactiveRoomLine(workingMystery(), currentRoom), workingMystery()) });
          ledgerLines.push(`Search/investigation found no new proof in ${mysteryRoomName(mystery, currentRoom)}. Difficulty ${searchDifficulty}.${rollText ? ` ${rollText}.` : ""}`);
        }
      } else if ((lower.includes("accuse") || lower.includes("arrest")) && namedSuspect && suspectMurders.length > 0) {
        if (discoveredProof.some((proof) => suspectProofs.includes(proof))) {
          finished = true;
          won = true;
          summary = `${mystery.player.firstName} proved ${fullName(namedSuspect)} was tied to the Ravenwood murders.`;
          messages.push({ id: uid(), speaker: "GM", text: `${fullName(namedSuspect)} breaks under the weight of proof. The arrest is made before midnight can claim another name.`, roll: rollText });
          ledgerLines.push(`Win by arrest: accused ${fullName(namedSuspect)} with matching proof. Case finished.`);
        } else {
          const present = mysteryPeopleInRoom(workingMystery(), currentRoom).filter((person) => person.id !== mystery.player.id) as MysteryNpc[];
          npcs = applyMysteryTrustDelta(npcs, present.map((person) => person.id), -7);
          messages.push({ id: uid(), speaker: "GM", text: `${fullName(namedSuspect)} smiles at the accusation. Without proof, the room turns against you.`, roll: rollText });
          ledgerLines.push(`Failed accusation: ${fullName(namedSuspect)} is a real killer but no discovered proof matched yet.${rollText ? ` ${rollText}.` : ""}`);
        }
      } else if ((lower.includes("accuse") || lower.includes("arrest")) && namedSuspect) {
        const present = mysteryPeopleInRoom(workingMystery(), currentRoom).filter((person) => person.id !== mystery.player.id) as MysteryNpc[];
        npcs = applyMysteryTrustDelta(npcs, present.map((person) => person.id), -9);
        messages.push({ id: uid(), speaker: "GM", text: `${fullName(namedSuspect)} stiffens. The accusation has no clean shape yet, and Ravenwood's polite circle closes against you.`, roll: rollText });
        ledgerLines.push(`False/unsupported accusation against ${fullName(namedSuspect)}; trust -9 for present residents.${rollText ? ` ${rollText}.` : ""}`);
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
        const target = mysteryTargetNpc(text, workingMystery(), currentRoom);
        if (target) {
          const dialogue = mysteryResidentReply(text, workingMystery(), target, rollResult);
          const trustDelta = aiReply?.usedAi && typeof aiReply.trustDelta === "number" ? aiReply.trustDelta : dialogue.trustDelta;
          const romanceDelta = aiReply?.usedAi && typeof aiReply.romanceDelta === "number" ? aiReply.romanceDelta : dialogue.romanceDelta;
          const responseText = aiReply?.usedAi ? aiReply.text : dialogue.message.text;
          npcs = npcs.map((npc) => npc.id === target.id ? { ...npc, trust: clamp(npc.trust + trustDelta, 0, 100), romance: clamp(npc.romance + romanceDelta, 0, 100), romanceRevealed: npc.romanceRevealed || romanceDelta !== 0 || Boolean(aiReply?.revealRomance) || mysteryToneForText(text) === "flirt" } : npc);
          messages.push({
            id: uid(),
            speaker: "GM",
            text: responseText,
            roll: rollText,
            rich: mysteryNpcSegments(responseText, workingMystery())
          });
          ledgerLines.push(`Dialogue resolved with ${fullName(target)} using ${aiReply?.usedAi ? "AI" : "fallback"} reply. Trust delta ${trustDelta}; romance delta ${romanceDelta}.${rollText ? ` ${rollText}.` : ""}`);
        } else {
          const dialogue = mysteryDialogueMessage(text, workingMystery(), namedSuspect);
          messages.push({ ...dialogue, roll: rollText });
          ledgerLines.push(`Dialogue had no reachable NPC in ${mysteryRoomName(mystery, currentRoom)}.${rollText ? ` ${rollText}.` : ""}`);
        }
      } else {
        const room = mysteryRoomName(mystery, currentRoom);
        const people = mysteryPeopleInRoom(workingMystery(), currentRoom).filter((person) => person.id !== mystery.player.id) as MysteryNpc[];
        const knownProof = discoveredProof.length > 0 ? ` You are carrying ${discoveredProof.length} piece${discoveredProof.length === 1 ? "" : "s"} of proof, so careless questions may change who trusts you.` : "";
        const nearby = people.length > 0 ? ` ${fullName(people[0])} clocks your movement and ${mysteryTrustLabel(people[0])}.` : " No one nearby openly reacts.";
        const line = aiReply?.usedAi ? aiReply.text : `${mysteryReactiveRoomLine(workingMystery(), currentRoom)} ${nearby}${knownProof}`;
        messages.push({ id: uid(), speaker: "GM", text: line, roll: rollText, rich: mysteryNpcSegments(line, workingMystery()) });
        ledgerLines.push(`Free action resolved in ${room} using ${aiReply?.usedAi ? "AI" : "fallback"} reply.${rollText ? ` ${rollText}.` : ""}`);
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

      const stampedMessages = stampMysteryMessages(
        [...mystery.messages, ...messages],
        mystery.day,
        mystery.daytime
      );

      const splitMessages = splitMysteryMessages(stampedMessages);
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
        findables,
        inventory,
        finished,
        won,
        summary,
        lossPending
      };
    });
  }

  function visitMysteryRoom(roomId: string) {
    if (!activeMystery || activeMystery.finished) return;
    const room = activeMystery.rooms.find((candidate) => candidate.id === roomId);
    if (!room?.accessible) return;
    patchMystery((mystery) => {
      const stampedMessages = stampMysteryMessages(
        [
          ...mystery.messages,
          mysteryRoomDescription(
            { ...mystery, currentRoomId: roomId },
            roomId
          )
        ],
        mystery.day,
        mystery.daytime
      );

      const splitMessages = splitMysteryMessages(stampedMessages);
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

  function focusMysteryNpc(npcId: string) {
    if (!activeMystery?.npcs.some((npc) => npc.id === npcId)) return;
    restoreMysteryRelationsScrollRef.current = false;
    setFocusedMysteryNpcId(npcId);
    setScreen("mysteryRelations");
  }

  function openMysteryFamilyTree(npcId: string) {
    if (!activeMystery?.npcs.some((npc) => npc.id === npcId)) return;
    restoreMysteryRelationsScrollRef.current = screen === "mysteryRelations" || restoreMysteryRelationsScrollRef.current;
    setSelectedMysteryTreeNpcId(npcId);
    setScreen("mysteryFamilyTree");
  }

  function pressMysteryFamilyTreeNode(npcId: string) {
    const now = Date.now();
    const previous = mysteryTreePressRef.current;
    if (previous?.npcId === npcId && now - previous.time <= 420) {
      mysteryTreePressRef.current = null;
      if (mysteryTreeSinglePressTimerRef.current) {
        clearTimeout(mysteryTreeSinglePressTimerRef.current);
        mysteryTreeSinglePressTimerRef.current = null;
      }
      focusMysteryNpc(npcId);
      return;
    }
    mysteryTreePressRef.current = { npcId, time: now };
    if (mysteryTreeSinglePressTimerRef.current) clearTimeout(mysteryTreeSinglePressTimerRef.current);
    mysteryTreeSinglePressTimerRef.current = setTimeout(() => {
      mysteryTreeSinglePressTimerRef.current = null;
      openMysteryFamilyTree(npcId);
    }, 240);
  }

  function dropMysteryNpcOn(targetId: string) {
    if (!draggingMysteryNpcId || draggingMysteryNpcId === targetId) {
      setDraggingMysteryNpcId(null);
      return;
    }
    patchMystery((mystery) => {
      const dragged = mystery.npcs.find((npc) => npc.id === draggingMysteryNpcId);
      if (!dragged) return mystery;
      const withoutDragged = mystery.npcs.filter((npc) => npc.id !== draggingMysteryNpcId);
      const adjustedTargetIndex = withoutDragged.findIndex((npc) => npc.id === targetId);
      if (adjustedTargetIndex < 0) return mystery;
      const npcs = [...withoutDragged.slice(0, adjustedTargetIndex), dragged, ...withoutDragged.slice(adjustedTargetIndex)];
      return { ...mystery, npcs };
    });
    setDraggingMysteryNpcId(null);
  }

  function mysteryFamilyLinks(mystery: MysteryGame): MysteryNpcRelationship[] {
    return mysteryRelationshipsWithSingleSpouses(mystery.npcRelationships ?? []).filter((relationship) =>
      relationship.kind === "Family" ||
      relationship.kind === "Marriage" ||
      relationship.kind === "Romance" ||
      relationship.kind === "Affair"
    );
  }

  function mysteryResidentFamilyMembers(mystery: MysteryGame, rootId: string): MysteryNpc[] {
    const residentById = new Map(mystery.npcs.map((npc) => [npc.id, npc]));
    const root = residentById.get(rootId);
    if (!root) return [];
    const links = mysteryFamilyLinks(mystery);
    const keepDepth = new Map<string, number>([[root.id, 0]]);
    const pending = [root.id];
    let displayedCousins = 0;
    while (pending.length > 0) {
      const currentId = pending.shift()!;
      const depth = keepDepth.get(currentId) ?? 0;
      if (depth >= 2) continue;
      for (const link of links) {
        const nextId = link.fromId === currentId ? link.toId : link.toId === currentId ? link.fromId : null;
        const next = nextId ? residentById.get(nextId) : undefined;
        if (!nextId || keepDepth.has(nextId) || !next) continue;
        const rootRelation = directMysteryTreeRelationshipLabel(root, next, mystery) ?? indirectMysteryTreeRelationshipLabel(root, next, mystery);
        if (rootRelation?.includes("cousin")) {
          if (displayedCousins >= 3) continue;
          displayedCousins += 1;
        }
        keepDepth.set(nextId, depth + 1);
        pending.push(nextId);
      }
    }
    return mystery.npcs.filter((npc) => keepDepth.has(npc.id));
  }

  function sexedRelation(npc: MysteryNpc, female: string, male: string): string {
    return npc.sex === "Female" ? female : male;
  }

  function mysteryTreeGenerationDeltaForRelationLabel(label: string | null): number | null {
    if (!label) return null;
    const words = label.toLowerCase().split(/\s+/);
    const first = words[0] ?? "";
    const last = words[words.length - 1] ?? "";
    if (first === "grandmother" || first === "grandfather") return -2;
    if (first === "granddaughter" || first === "grandson") return 2;
    if (["mothers", "fathers"].includes(first)) return ["mother", "father"].includes(last) ? -2 : -1;
    if (["daughters", "sons"].includes(first)) return ["daughter", "son"].includes(last) ? 2 : 1;
    if (["mother", "father", "aunt", "uncle"].includes(first)) return -1;
    if (["daughter", "son", "step-daughter", "step-son", "niece", "nephew"].includes(first)) return 1;
    if (["mothers", "fathers", "aunts", "uncles"].includes(first)) return -1;
    if (["daughters", "sons", "nieces", "nephews"].includes(first)) return 1;
    if (["daughter", "son", "step-daughter", "step-son", "niece", "nephew"].includes(last) && ["sisters", "brothers", "cousins"].includes(first)) return 1;
    if (["mother", "father", "aunt", "uncle"].includes(last) && ["sisters", "brothers", "cousins"].includes(first)) return -1;
    return 0;
  }

  function mysteryParentAndSiblingSets(mystery: MysteryGame) {
    const parentPairs: { parentId: string; childId: string }[] = [];
    const siblingPairs = new Set<string>();
    const npcsById = new Map(mystery.npcs.map((npc) => [npc.id, npc]));
    const pairKey = (a: string, b: string) => [a, b].sort().join(":");
    const addParent = (parentId: string, childId: string) => {
      if (parentId !== childId && !parentPairs.some((pair) => pair.parentId === parentId && pair.childId === childId)) {
        parentPairs.push({ parentId, childId });
      }
    };
    for (const link of mysteryFamilyLinks(mystery).filter((relationship) => relationship.kind === "Family")) {
      const from = npcsById.get(link.fromId);
      const to = npcsById.get(link.toId);
      if (!from || !to) continue;
      const detail = link.detail.toLowerCase();
      const fromName = fullName(from).toLowerCase();
      const toName = fullName(to).toLowerCase();
      if (detail.includes("siblings") || from.familyRelationNote?.toLowerCase().includes("sister of") || from.familyRelationNote?.toLowerCase().includes("brother of") || to.familyRelationNote?.toLowerCase().includes("sister of") || to.familyRelationNote?.toLowerCase().includes("brother of")) {
        siblingPairs.add(pairKey(from.id, to.id));
      }
      if (detail.includes(`${fromName} is parent to ${toName}`)) addParent(from.id, to.id);
      if (detail.includes(`${toName} is parent to ${fromName}`)) addParent(to.id, from.id);
      if (detail.includes(`${toName} is staying with mother ${fromName}`) || detail.includes(`${toName} is staying with father ${fromName}`)) addParent(from.id, to.id);
      if (detail.includes(`${fromName} is staying with mother ${toName}`) || detail.includes(`${fromName} is staying with father ${toName}`)) addParent(to.id, from.id);
      if (from.familyRelationNote?.includes(fullName(to)) && /\b(son|daughter)\s+of\b/i.test(from.familyRelationNote)) addParent(to.id, from.id);
      if (to.familyRelationNote?.includes(fullName(from)) && /\b(son|daughter)\s+of\b/i.test(to.familyRelationNote)) addParent(from.id, to.id);
      if (from.familyRelationNote?.includes(fullName(to)) && /\b(mother|father)\s+of\b/i.test(from.familyRelationNote)) addParent(from.id, to.id);
      if (to.familyRelationNote?.includes(fullName(from)) && /\b(mother|father)\s+of\b/i.test(to.familyRelationNote)) addParent(to.id, from.id);
    }
    return { parentPairs, siblingPairs, pairKey };
  }

  function directMysteryTreeRelationshipLabel(root: MysteryNpc, npc: MysteryNpc, mystery: MysteryGame): string | null {
    const link = mysteryFamilyLinks(mystery).find((relationship) =>
      (relationship.fromId === root.id && relationship.toId === npc.id) ||
      (relationship.fromId === npc.id && relationship.toId === root.id)
    );
    if (!link) return null;
    if (link.kind === "Marriage") return "spouse";
    if (link.kind === "Romance") return "partner";
    if (link.kind === "Affair") return "lover";
    const detail = link.detail.toLowerCase();
    const rootName = fullName(root).toLowerCase();
    const npcName = fullName(npc).toLowerCase();
    if (detail.includes("siblings")) return sexedRelation(npc, "sister", "brother");
    if (detail.includes("cousins")) return "cousin";
    if (detail.includes(`${npcName} is parent to ${rootName}`)) return sexedRelation(npc, "mother", "father");
    if (detail.includes(`${rootName} is parent to ${npcName}`)) return sexedRelation(npc, "daughter", "son");
    if (detail.includes(`${rootName} is staying with mother ${npcName}`) || detail.includes(`${rootName} is staying with father ${npcName}`)) return sexedRelation(npc, "mother", "father");
    if (detail.includes(`${npcName} is staying with mother ${rootName}`) || detail.includes(`${npcName} is staying with father ${rootName}`)) return sexedRelation(npc, "daughter", "son");
    if (detail.includes(`${rootName} is staying with aunt ${npcName}`) || detail.includes(`${rootName} is staying with uncle ${npcName}`)) return sexedRelation(npc, "aunt", "uncle");
    if (detail.includes(`${npcName} is staying with aunt ${rootName}`) || detail.includes(`${npcName} is staying with uncle ${rootName}`)) return sexedRelation(npc, "niece", "nephew");
    if (npc.familyRelationNote?.includes(fullName(root))) {
      const note = npc.familyRelationNote.toLowerCase();
      if (note.includes("daughter of") || note.includes("son of")) return sexedRelation(npc, "daughter", "son");
      if (note.includes("mother of") || note.includes("father of")) return sexedRelation(npc, "mother", "father");
      if (note.includes("niece of") || note.includes("nephew of")) return sexedRelation(npc, "niece", "nephew");
      if (note.includes("aunt of") || note.includes("uncle of")) return sexedRelation(npc, "aunt", "uncle");
      if (note.includes("sister of") || note.includes("brother of")) return sexedRelation(npc, "sister", "brother");
    }
    if (root.familyRelationNote?.includes(fullName(npc))) {
      const note = root.familyRelationNote.toLowerCase();
      if (note.includes("daughter of") || note.includes("son of")) return sexedRelation(npc, "mother", "father");
      if (note.includes("mother of") || note.includes("father of")) return sexedRelation(npc, "daughter", "son");
      if (note.includes("niece of") || note.includes("nephew of")) return sexedRelation(npc, "aunt", "uncle");
      if (note.includes("aunt of") || note.includes("uncle of")) return sexedRelation(npc, "niece", "nephew");
      if (note.includes("sister of") || note.includes("brother of")) return sexedRelation(npc, "sister", "brother");
    }
    return "cousin";
  }

  function mysteryTreePossessiveRelation(relation: string): string {
    return relation.endsWith("s") ? `${relation}'` : `${relation}'s`;
  }

  function mysteryIsStepChildOf(parentId: string, childId: string, mystery: MysteryGame, parentPairs: { parentId: string; childId: string }[]): boolean {
    if (parentPairs.some((pair) => pair.parentId === parentId && pair.childId === childId)) return false;
    const partnerIds = mysteryFamilyLinks(mystery)
      .filter((link) =>
        (link.kind === "Marriage" || link.kind === "Romance") &&
        (link.fromId === parentId || link.toId === parentId)
      )
      .map((link) => link.fromId === parentId ? link.toId : link.fromId);
    return partnerIds.some((partnerId) => parentPairs.some((pair) => pair.parentId === partnerId && pair.childId === childId));
  }

  function simplifiedMysteryTreeRelationLabel(root: MysteryNpc, currentLabel: string, direct: string, npc: MysteryNpc, mystery: MysteryGame): string | null {
    const childLabels = ["daughter", "son", "step-daughter", "step-son"];
    if (["sister", "brother"].includes(currentLabel) && ["sister", "brother"].includes(direct)) return direct;
    if (["aunt", "uncle"].includes(currentLabel) && ["daughter", "son"].includes(direct)) return "cousin";
    if (["mother", "father"].includes(currentLabel) && ["niece", "nephew"].includes(direct)) return "cousin";
    if (["mother", "father"].includes(currentLabel) && ["daughter", "son"].includes(direct)) return sexedRelation(npc, "sister", "brother");
    if (["mother", "father"].includes(currentLabel) && ["sister", "brother"].includes(direct)) return sexedRelation(npc, "aunt", "uncle");
    if (["sister", "brother"].includes(currentLabel) && ["daughter", "son"].includes(direct)) return sexedRelation(npc, "niece", "nephew");
    if (childLabels.includes(currentLabel) && ["sister", "brother"].includes(direct)) {
      const { parentPairs } = mysteryParentAndSiblingSets(mystery);
      const directChild = parentPairs.some((pair) => pair.parentId === root.id && pair.childId === npc.id);
      if (directChild) return sexedRelation(npc, "daughter", "son");
      if (mysteryIsStepChildOf(root.id, npc.id, mystery, parentPairs)) return sexedRelation(npc, "step-daughter", "step-son");
      return `${mysteryTreePossessiveRelation(currentLabel)} ${direct}`;
    }
    if (childLabels.includes(currentLabel) && ["daughter", "son"].includes(direct)) return sexedRelation(npc, "granddaughter", "grandson");
    if (["mother", "father"].includes(currentLabel) && ["mother", "father"].includes(direct)) return sexedRelation(npc, "grandmother", "grandfather");
    return null;
  }

  function indirectMysteryTreeRelationshipLabel(root: MysteryNpc, npc: MysteryNpc, mystery: MysteryGame): string | null {
    const npcsById = new Map(mystery.npcs.map((candidate) => [candidate.id, candidate]));
    const links = mysteryFamilyLinks(mystery);
    const pending: { npc: MysteryNpc; label: string; depth: number }[] = [{ npc: root, label: "", depth: 0 }];
    const visited = new Set<string>([root.id]);
    while (pending.length > 0) {
      const current = pending.shift()!;
      if (current.depth >= 2) continue;
      for (const link of links) {
        const nextId = link.fromId === current.npc.id ? link.toId : link.toId === current.npc.id ? link.fromId : null;
        const next = nextId ? npcsById.get(nextId) : undefined;
        if (!next || visited.has(next.id)) continue;
        const direct = directMysteryTreeRelationshipLabel(current.npc, next, mystery);
        if (!direct) continue;
        const simplified = current.label ? simplifiedMysteryTreeRelationLabel(root, current.label, direct, next, mystery) : null;
        const label = simplified ?? (current.label ? `${mysteryTreePossessiveRelation(current.label)} ${direct}` : direct);
        if (next.id === npc.id) return label;
        visited.add(next.id);
        pending.push({ npc: next, label, depth: current.depth + 1 });
      }
    }
    return null;
  }

  function mysteryTreeRelationshipLabel(root: MysteryNpc, npc: MysteryNpc, mystery: MysteryGame): string {
    if (root.id === npc.id) return "";
    const direct = directMysteryTreeRelationshipLabel(root, npc, mystery);
    if (direct) return direct;
    const { parentPairs, siblingPairs, pairKey } = mysteryParentAndSiblingSets(mystery);
    const isParentOf = (parentId: string, childId: string) => parentPairs.some((pair) => pair.parentId === parentId && pair.childId === childId);
    const parentsOfRoot = parentPairs.filter((pair) => pair.childId === root.id).map((pair) => pair.parentId);
    const childrenOfRoot = parentPairs.filter((pair) => pair.parentId === root.id).map((pair) => pair.childId);
    const childSiblingId = childrenOfRoot.find((childId) => siblingPairs.has(pairKey(childId, npc.id)));
    if (childSiblingId) {
      if (isParentOf(root.id, npc.id)) return sexedRelation(npc, "daughter", "son");
      if (mysteryIsStepChildOf(root.id, npc.id, mystery, parentPairs)) return sexedRelation(npc, "step-daughter", "step-son");
      const relatedChild = mystery.npcs.find((candidate) => candidate.id === childSiblingId);
      return `${mysteryTreePossessiveRelation(relatedChild ? sexedRelation(relatedChild, "daughter", "son") : "child")} ${sexedRelation(npc, "sister", "brother")}`;
    }
    const indirect = indirectMysteryTreeRelationshipLabel(root, npc, mystery);
    if (indirect) return indirect;
    if (parentsOfRoot.some((parentId) => isParentOf(npc.id, parentId))) return sexedRelation(npc, "grandmother", "grandfather");
    if (childrenOfRoot.some((childId) => isParentOf(childId, npc.id))) return sexedRelation(npc, "granddaughter", "grandson");
    if (parentsOfRoot.some((parentId) => siblingPairs.has(pairKey(parentId, npc.id)))) return sexedRelation(npc, "aunt", "uncle");
    const npcParents = parentPairs.filter((pair) => pair.childId === npc.id).map((pair) => pair.parentId);
    if (npcParents.some((parentId) => siblingPairs.has(pairKey(parentId, root.id)))) return sexedRelation(npc, "niece", "nephew");
    if (siblingPairs.has(pairKey(root.id, npc.id))) return sexedRelation(npc, "sister", "brother");
    return "cousin";
  }

  function changeMysteryInventory(item: string, action: "Abandon") {
    if (!activeMystery || action !== "Abandon") return;
    patchMystery((mystery) => {
      const roomName = mysteryRoomName(mystery, mystery.currentRoomId);
      const droppedFindable: MysteryFindable = {
        id: uid(),
        kind: "Snatchable",
        origin: "Abandoned",
        name: item,
        description: `${mystery.player.firstName} dropped ${item} in ${roomName}. Any resident who passes through may pick it up.`,
        roomId: mystery.currentRoomId,
        availableDay: mystery.day,
        availableDaytime: mystery.daytime
      };
      const stampedMessages = stampMysteryMessages(
        [
          ...mystery.messages,
          {
            id: uid(),
            speaker: "GM" as const,
            text: `${mystery.player.firstName} abandons ${item} in the ${roomName}. It stays there until someone picks it up.`
          }
        ],
        mystery.day,
        mystery.daytime
      );

      const splitMessages = splitMysteryMessages(stampedMessages);
      return {
        ...mystery,
        inventory: mystery.inventory.filter((inventoryItem) => inventoryItem !== item),
        findables: [...(mystery.findables ?? []), droppedFindable],
        messages: splitMessages.visible,
        journal: appendMysteryJournal(mystery.journal, splitMessages.archived),
        sanityLedger: [
          ...(mystery.sanityLedger ?? []),
          `Abandoned item: ${item} dropped in ${roomName} on Day ${mystery.day} ${mystery.daytime}.`
        ].slice(-600)
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

  function removeMystery(mysteryId: string) {
    setMysteries((current) => current.filter((mystery) => mystery.id !== mysteryId));
    if (activeMysteryId === mysteryId) setActiveMysteryId(null);
  }

  function Shell({
    children,
    menuBackground = false,
    scrollRef,
    onScroll,
    scrollEventThrottle
  }: {
    children: React.ReactNode;
    menuBackground?: boolean;
    scrollRef?: React.RefObject<ScrollView | null>;
    onScroll?: React.ComponentProps<typeof ScrollView>["onScroll"];
    scrollEventThrottle?: number;
  }) {
    const showMysteryBottomMenu = Boolean(activeMystery && ["mystery", "mysteryCharacter", "mysteryRelations", "mysteryFamilyTree", "mysteryMap", "mysteryJournal"].includes(screen));
    const backgroundSource = menuBackground ? menuBackgrounds[themeName] : appBackgroundForScreen(themeName, screen);
    const backgroundTint = menuBackground
      ? themeName === "dark" ? "rgba(4, 4, 7, 0.38)" : "rgba(255, 250, 242, 0.18)"
      : themeName === "dark" ? "rgba(4, 4, 7, 0.34)" : "rgba(255, 255, 255, 0.2)";
    const content = (
      <SafeAreaView style={[styles.safe, { backgroundColor: "transparent" }]}>
        <StatusBar barStyle={themeName === "dark" ? "light-content" : "dark-content"} />
        <ScrollView
          ref={scrollRef}
          style={styles.scroll}
          contentContainerStyle={[styles.container, menuBackground && styles.menuContainer, showMysteryBottomMenu && styles.fixedBottomContent]}
          onScroll={onScroll}
          scrollEventThrottle={scrollEventThrottle}
        >
          {children}
        </ScrollView>
        {showMysteryBottomMenu ? (
          <View style={[styles.fixedBottomMenu, { backgroundColor: themeName === "dark" ? "rgba(9, 9, 12, 0.94)" : "rgba(251, 246, 238, 0.94)" }]}>
            <MysteryBottomMenu />
          </View>
        ) : null}
      </SafeAreaView>
    );

    return (
      <ImageBackground source={backgroundSource} resizeMode="cover" style={styles.backgroundImage}>
        <View style={[styles.backgroundTint, { backgroundColor: backgroundTint }]}>{content}</View>
      </ImageBackground>
    );
  }

  function Card({ children }: { children: React.ReactNode }) {
    return <View style={[styles.card, { backgroundColor: C.panel, borderColor: C.line }]}>{children}</View>;
  }

  function IconDumpIcon({ name, size = 22, style, scaleBoost }: { name: IconDumpKey; size?: number; style?: StyleProp<ViewStyle>; scaleBoost?: number }) {
    const icon = iconAssets[name];
    const scale = Math.min(size / icon.width, size / icon.height) * (scaleBoost ?? icon.scale ?? 1);
    return (
      <View style={[styles.iconDumpFrame, { width: size, height: size }, style]}>
        <Image
          source={icon.source}
          resizeMode="stretch"
          style={[
            styles.iconDumpSheet,
            {
              width: icon.width * scale,
              height: icon.height * scale,
              left: (size - icon.width * scale) / 2 + (icon.offsetX ?? 0),
              top: (size - icon.height * scale) / 2 + (icon.offsetY ?? 0)
            }
          ]}
        />
      </View>
    );
  }

  function BottomMenuLabel({ icon, label }: { icon: IconDumpKey; label: string }) {
    return (
      <View style={styles.bottomMenuLabel}>
        <View style={styles.bottomMenuIconStage}>
          <IconDumpIcon name={icon} size={58} />
        </View>
        <Text style={[styles.bottomMenuText, { color: C.text }]}>{label}</Text>
      </View>
    );
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
    const frameWidth = isHero ? 114 : isLarge ? 72 : isResident ? 92 : isMap ? 40 : 36;
    const frameHeight = isHero ? 190 : isLarge ? 128 : isResident ? 156 : isMap ? 68 : 62;
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

  function MysteryTrustPill({ npc }: { npc: MysteryNpc }) {
    const muted = !npc.alive;
    const altered = npc.substanceState === "drunk" || npc.substanceState === "high";
    const trust = effectiveMysteryTrust(npc);
    return (
      <View style={[styles.mysteryTrustPill, altered && styles.intoxicatedTrustPill, { borderColor: muted ? "#777" : altered ? "#ff2222" : C.good, backgroundColor: muted ? "rgba(70, 70, 74, 0.45)" : altered ? "rgba(255, 34, 34, 0.26)" : `${C.good}18` }]}>
        <Text style={[styles.mysteryTrustPillLabel, { color: muted ? "#c9c9c9" : altered ? "#ffdddd" : C.good }]}>{altered ? titleCase(npc.substanceState) : "Trust"}</Text>
        <Text style={[styles.mysteryTrustPillValue, { color: muted ? "#d2d2d2" : altered ? "#fff" : C.text }]}>{trust}</Text>
      </View>
    );
  }

  function MysteryBottomMenu() {
    return (
      <View style={[styles.bottomMenu, { backgroundColor: C.panel, borderColor: C.line }]}>
        <Pressable onPress={() => setScreen("mysteryCharacter")} style={[styles.bottomMenuItem, { borderColor: C.line }]}>
          <BottomMenuLabel icon="bag" label="Character" />
        </Pressable>
        <Pressable onPress={() => setScreen("mysteryRelations")} style={[styles.bottomMenuItem, { borderColor: C.line }]}>
          <BottomMenuLabel icon="shadowPortrait" label="Residents" />
        </Pressable>
        <Pressable onPress={() => setScreen("mysteryMap")} style={[styles.bottomMenuItem, { borderColor: C.line }]}>
          <BottomMenuLabel icon="candle" label="Map" />
        </Pressable>
        <Pressable onPress={() => setScreen("mysteryJournal")} style={[styles.bottomMenuItem, { borderColor: C.line }]}>
          <BottomMenuLabel icon="book" label="Journal" />
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
    const messageText = (
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
    if (!message.icon) return messageText;
    return (
      <View style={styles.mysteryMessageIconRow}>
        <View style={[styles.mysteryMessageIconBubble, { borderColor: message.icon === "death" ? "#c41338" : C.line, backgroundColor: C.panel2 }]}>
          <IconDumpIcon name={message.icon} size={42} />
        </View>
        <View style={styles.mysteryMessageIconText}>
          {messageText}
        </View>
      </View>
    );
  }

  function MysteryStoryWindow({ mystery }: { mystery: MysteryGame }) {
    const visibleMessages = mystery.messages.slice(-5);
    const currentRoom = mysteryRoomName(mystery, mystery.currentRoomId);
    const roomBackground = ravenwoodRoomBackgroundFor(mystery, themeName);
    const frameStyle = [styles.storyFrame, styles.mysteryStoryFrame, { borderColor: C.line, backgroundColor: C.panel }];
    const sceneHeaderStyle = [styles.mysterySceneHeader, styles.ravenwoodBubbleBackdrop, { backgroundColor: themeName === "dark" ? "rgba(20, 18, 23, 0.76)" : "rgba(239, 232, 220, 0.74)", borderColor: "rgba(240, 196, 92, 0.28)" }];
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
          editable={!mystery.finished && !mysteryAiThinking}
          style={[styles.storyInput, { color: C.text }]}
        />
        <View style={styles.storySendButton}>
          <Button small label={mysteryAiThinking ? "Thinking" : "Send"} onPress={submitMysteryInput} disabled={mystery.finished || mysteryAiThinking || mysteryInput.trim().length === 0} />
        </View>
        <Text style={[styles.rollText, styles.storyCount, { color: C.dim }]}>{mysteryInput.length}/500</Text>
      </>
    );
    const frameContent = (
      <>
        <View style={sceneHeaderStyle}>{sceneHeaderContent}</View>
        <View style={storyPanelStyle}>{storyPanelContent}</View>
        <View style={inputPanelStyle}>{inputPanelContent}</View>
      </>
    );
    return (
      roomBackground ? (
        <ImageBackground source={roomBackground} resizeMode="cover" imageStyle={styles.ravenwoodSceneBackdropImage} style={frameStyle}>
          {frameContent}
        </ImageBackground>
      ) : (
        <View style={frameStyle}>{frameContent}</View>
      )
    );
  }

  if (screen === "menu") {
    return (
      <Shell menuBackground>
        <Text style={[styles.title, styles.menuTextShadow, { color: C.text }]}>Ravenwood Mystery</Text>
        <Text style={[styles.subtitle, styles.menuTextShadow, { color: themeName === "dark" ? "#e7e1dc" : C.text }]}>Choose your charachter and investigate freely in your style.</Text>
        <Button label="Start New Mystery" onPress={() => setScreen("mysteryDetectiveSelect")} />
        <Button label="Load Game" onPress={() => setScreen("load")} />
        <Button label="Finished Games" onPress={() => setScreen("past")} />
        <Button label="Settings" onPress={() => setScreen("settings")} />
      </Shell>
    );
  }

  if (screen === "mysteryDetectiveSelect") {
    return (
      <Shell>
        <View style={styles.rowBetween}>
          <Text style={[styles.titleSmall, { color: C.text }]}>Choose Detective</Text>
          <Button small label="Back" onPress={() => setScreen("menu")} />
        </View>
        <ScrollView
          ref={detectiveCarouselRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          onScroll={(event) => {
            detectiveCarouselOffsetRef.current = event.nativeEvent.contentOffset.x;
          }}
          scrollEventThrottle={16}
          contentContainerStyle={styles.detectiveCarousel}
        >
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
    const roomsByFloor = [1, 2, 3].map((floor) =>
      activeMystery.rooms.filter((room) => room.floor === floor)
    );

    return Shell({
      children: (
        <>
          {MysteryHeader({ mystery: activeMystery })}

          {MysteryStoryWindow({ mystery: activeMystery })}

          {Card({
            children: (
              <>
                <Text style={[styles.label, { color: C.dim }]}>Places</Text>

                {roomsByFloor.map((rooms, index) => (
                  <View key={index} style={styles.mysteryFloorBlock}>
                    <Text
                      style={[
                        styles.mysteryFloorTitle,
                        { color: C.text }
                      ]}
                    >
                      Floor {index + 1}
                    </Text>

                    <View style={styles.wrapRow}>
                      {rooms.map((room) => (
                        <Chip
                          key={room.id}
                          label={room.name}
                          selected={
                            activeMystery.currentRoomId === room.id
                          }
                          disabled={
                            !room.accessible || activeMystery.finished
                          }
                          onPress={() => visitMysteryRoom(room.id)}
                        />
                      ))}
                    </View>
                  </View>
                ))}
              </>
            )
          })}

          {activeMystery.finished
            ? Card({
                children: (
                  <>
                    <Text
                      style={[
                        styles.heading,
                        {
                          color: activeMystery.won
                            ? C.good
                            : C.warning
                        }
                      ]}
                    >
                      {activeMystery.won
                        ? "Case Won"
                        : "Case Lost"}
                    </Text>

                    <Text
                      style={[
                        styles.body,
                        { color: C.text }
                      ]}
                    >
                      {activeMystery.summary}
                    </Text>
                  </>
                )
              })
            : null}

          <Modal
            visible={Boolean(activeMystery.lossPending)}
            transparent
            animationType="fade"
          >
            <View style={styles.modalShade}>
              <View
                style={[
                  styles.modalCard,
                  {
                    backgroundColor: C.panel,
                    borderColor: C.line
                  }
                ]}
              >
                <Text
                  style={[
                    styles.heading,
                    { color: C.warning }
                  ]}
                >
                  Ravenwood Is Lost
                </Text>

                <Text
                  style={[
                    styles.body,
                    { color: C.text }
                  ]}
                >
                  The thirteenth midnight passes. The killer
                  remains free, and the report moves to finished
                  games.
                </Text>

                {Button({
                  label: "Main Menu",
                  onPress: closeMysteryLoss
                })}
              </View>
            </View>
          </Modal>
        </>
      )
    });
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
              <View style={styles.itemNameRow}>
                {mysteryInventoryIconFor(item) ? (
                  <View style={[styles.inventoryItemIconBubble, { borderColor: C.line, backgroundColor: C.panel2 }]}>
                    <IconDumpIcon name={mysteryInventoryIconFor(item)!} size={30} />
                  </View>
                ) : null}
                <Text style={[styles.body, styles.itemName, { color: C.text }]}>{titleCase(item)}</Text>
              </View>
              <View style={styles.wrapRow}>
                <Button small label="Up" onPress={() => moveMysteryInventory(item, -1)} disabled={index === 0} />
                <Button small label="Down" onPress={() => moveMysteryInventory(item, 1)} disabled={index === activeMystery.inventory.length - 1} />
                <Button small label="Abandon" onPress={() => changeMysteryInventory(item, "Abandon")} variant="warning" />
              </View>
            </Pressable>
          ))}
        </Card>
        <Button label="Back" onPress={() => setScreen("mystery")} />
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
      <Shell
        scrollRef={mysteryRelationsScrollRef}
        onScroll={(event) => {
          mysteryRelationsScrollYRef.current = event.nativeEvent.contentOffset.y;
        }}
        scrollEventThrottle={16}
      >
        <View style={styles.rowBetween}>
          <Text style={[styles.titleSmall, { color: C.text }]}>Residents</Text>
          <Button small label="Back" onPress={() => setScreen("mystery")} />
        </View>
        {focusedMysteryNpcs.map((npc) => {
          const isDragging = draggingMysteryNpcId === npc.id;
          const familyStatus = mysteryDisplayFamilyStatus(npc, activeMystery);
          return (
            <Pressable
              key={npc.id}
              onLongPress={() => setDraggingMysteryNpcId(npc.id)}
              onPress={draggingMysteryNpcId ? () => dropMysteryNpcOn(npc.id) : undefined}
              style={[styles.card, { backgroundColor: C.panel, borderColor: C.line }, focusedMysteryNpcId === npc.id && styles.focusedMysteryNpcCard, isDragging && styles.relationCardDragging, !npc.alive && styles.deadTile, !npc.alive && styles.deadRelationCard]}
            >
              <View style={styles.relationHeader}>
                <View style={styles.residentPortraitTools}>
                  <PortraitImage subject={npc} size="resident" />
                  <Pressable onPress={() => openMysteryFamilyTree(npc.id)} style={[styles.mysteryPortraitMagnifierButton, { backgroundColor: C.panel2, borderColor: C.line }]}>
                    <IconDumpIcon name="magnifier" size={54} scaleBoost={0.74} />
                  </Pressable>
                </View>
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
                {mysteryRelationshipLinesFor(npc, activeMystery.npcs, activeMystery.npcRelationships ?? [], activeMystery.day, activeMystery.daytime).length === 0 ? (
                  <Text style={[styles.rollText, { color: C.dim }]}>No direct NPC relationship record.</Text>
                ) : mysteryRelationshipLinesFor(npc, activeMystery.npcs, activeMystery.npcRelationships ?? [], activeMystery.day, activeMystery.daytime).map((line) => (
                  <Text key={line} style={[styles.rollText, line.includes("(hidden") ? styles.discoverableHiddenText : { color: C.text }]}>{line}</Text>
                ))}
              </View>
              <View style={styles.mysteryDossierGrid}>
                {npc.substanceState !== "sober" ? (
                  <View style={styles.substanceBubbleRow}>
                    <Text style={styles.substanceBubble}>{titleCase(npc.substanceState)}</Text>
                    <Text style={styles.substanceBubble}>trust {npc.temporaryTrust >= 0 ? "+" : ""}{npc.temporaryTrust}</Text>
                    <Text style={styles.substanceBubble}>{npc.substanceTurns} turns</Text>
                  </View>
                ) : null}
                {mysterySubstanceLine(npc) ? <Text style={[styles.body, { color: npc.substanceState === "drunk" || npc.substanceState === "high" ? "#ff4d4d" : C.dim }]}>{mysterySubstanceLine(npc)}</Text> : null}
                <Text style={[styles.body, familyStatus.toLowerCase().includes("secret") ? styles.discoverableHiddenText : { color: C.text }]}>Family status: {familyStatus}</Text>
                <Text style={[styles.body, { color: C.text }]}>Education: {npc.education}</Text>
                <Text style={[styles.body, { color: C.text }]}>Occupation: {npc.occupation}</Text>
                <Text style={[styles.body, { color: C.text }]}>Interests: {npc.interests.join(", ")}</Text>
                <Text style={[styles.body, { color: C.text }]}>Reason of stay: {npc.reasonOfStay}</Text>
                <Text style={[styles.body, { color: C.text }]}>Current stay: {npc.currentStay ?? "Not recorded yet."}</Text>
                <Text style={[styles.body, { color: C.text }]}>Planned stay: {npc.plannedStay ?? "Not recorded yet."}</Text>
                <Text style={[styles.body, { color: C.text }]}>Previous stay: {npc.previousStay ?? "Not recorded yet."}</Text>
                <Text style={[styles.body, styles.discoverableHiddenText]}>Secret: {readableMysterySecret(npc.secret)}</Text>
                <Text style={[styles.body, { color: C.text }]}>Quirk: {npc.quirk}</Text>
                <Text style={[styles.body, { color: C.dim }]}>Substance preference: {npc.substancePreference}</Text>
                <Text style={[styles.body, { color: C.dim }]}>Current location: {mysteryRoomName(activeMystery, currentMysteryNpcRoomId(activeMystery, npc))}</Text>
                <Text style={[styles.body, { color: C.dim }]}>Room/station: {mysteryRoomName(activeMystery, npc.role === "Guest" ? npc.roomId : npc.stationRoomId)}</Text>
              </View>
            </Pressable>
          );
        })}
        <Button label="Back" onPress={() => setScreen("mystery")} />
      </Shell>
    );
  }

  if (screen === "mysteryFamilyTree" && activeMystery) {
    const treeRootId = selectedMysteryTreeNpcId ?? focusedMysteryNpcId;
    const root = activeMystery.npcs.find((npc) => npc.id === treeRootId) ?? activeMystery.npcs[0];
    const familyMembers = root ? mysteryResidentFamilyMembers(activeMystery, root.id) : [];
    const familyMemberIds = new Set(familyMembers.map((npc) => npc.id));
    const { parentPairs, pairKey } = mysteryParentAndSiblingSets(activeMystery);
    const isParentOf = (parentId: string, childId: string) => parentPairs.some((pair) => pair.parentId === parentId && pair.childId === childId);
    const relationshipEdges = mysteryFamilyLinks(activeMystery)
      .filter((link) => familyMemberIds.has(link.fromId) && familyMemberIds.has(link.toId))
      .filter((link, index, list) => list.findIndex((candidate) => pairKey(candidate.fromId, candidate.toId) === pairKey(link.fromId, link.toId) && candidate.kind === link.kind) === index);
    const generationById = new Map<string, number>();
    if (root) generationById.set(root.id, 0);
    const pendingGenerationIds = root ? [root.id] : [];
    while (pendingGenerationIds.length > 0) {
      const currentId = pendingGenerationIds.shift()!;
      const currentGeneration = generationById.get(currentId) ?? 0;
      const currentNpc = activeMystery.npcs.find((npc) => npc.id === currentId);
      if (!currentNpc) continue;
      for (const edge of relationshipEdges) {
        const otherId = edge.fromId === currentId ? edge.toId : edge.toId === currentId ? edge.fromId : null;
        if (!otherId || generationById.has(otherId)) continue;
        const otherNpc = activeMystery.npcs.find((npc) => npc.id === otherId);
        if (!otherNpc) continue;
        const labelDelta = mysteryTreeGenerationDeltaForRelationLabel(directMysteryTreeRelationshipLabel(currentNpc, otherNpc, activeMystery));
        const delta = labelDelta ?? (isParentOf(currentId, otherId) ? 1 : isParentOf(otherId, currentId) ? -1 : 0);
        generationById.set(otherId, currentGeneration + delta);
        pendingGenerationIds.push(otherId);
      }
    }
    for (const npc of familyMembers) {
      if (generationById.has(npc.id) || !root) continue;
      const labelDelta = mysteryTreeGenerationDeltaForRelationLabel(mysteryTreeRelationshipLabel(root, npc, activeMystery));
      generationById.set(npc.id, labelDelta ?? (npc.age >= root.age + 16 ? -1 : npc.age <= root.age - 16 || npc.isChild ? 1 : 0));
    }
    const generations = Array.from(new Set(familyMembers.map((npc) => generationById.get(npc.id) ?? 0))).sort((a, b) => a - b);
    const nodeWidth = 170;
    const nodeHeight = 82;
    const nodeGapX = 38;
    const generationGapY = 126;
    const canvasPaddingX = 34;
    const canvasPaddingY = 58;
    const orderGenerationPeople = (people: MysteryNpc[]) => {
      const peopleIds = new Set(people.map((npc) => npc.id));
      const weightedNeighborScore = (npc: MysteryNpc) => relationshipEdges.reduce((score, edge) => {
        const touchesNpc = edge.fromId === npc.id || edge.toId === npc.id;
        if (!touchesNpc) return score;
        const otherId = edge.fromId === npc.id ? edge.toId : edge.fromId;
        if (!peopleIds.has(otherId)) return score;
        if (edge.kind === "Marriage" || edge.kind === "Romance" || edge.kind === "Affair") return score + 80;
        if (edge.kind === "Family") return score + 20;
        return score + 5;
      }, 0);
      const baseSorted = [...people].sort((a, b) =>
        weightedNeighborScore(b) - weightedNeighborScore(a) ||
        b.age - a.age ||
        fullName(a).localeCompare(fullName(b))
      );
      const assigned = new Set<string>();
      const groups: MysteryNpc[][] = [];
      const strongestSameGenerationPartner = (npc: MysteryNpc) => {
        const partnerLinks = relationshipEdges
          .filter((edge) =>
            (edge.kind === "Marriage" || edge.kind === "Romance" || edge.kind === "Affair") &&
            (edge.fromId === npc.id || edge.toId === npc.id)
          )
          .map((edge) => ({
            edge,
            other: activeMystery.npcs.find((candidate) => candidate.id === (edge.fromId === npc.id ? edge.toId : edge.fromId))
          }))
          .filter((entry): entry is { edge: MysteryNpcRelationship; other: MysteryNpc } => Boolean(entry.other && peopleIds.has(entry.other.id) && !assigned.has(entry.other.id)));
        return partnerLinks
          .sort((a, b) =>
            (b.edge.kind === "Marriage" ? 3 : b.edge.kind === "Romance" ? 2 : 1) -
            (a.edge.kind === "Marriage" ? 3 : a.edge.kind === "Romance" ? 2 : 1) ||
            weightedNeighborScore(b.other) - weightedNeighborScore(a.other)
          )[0]?.other;
      };
      for (const npc of baseSorted) {
        if (assigned.has(npc.id)) continue;
        assigned.add(npc.id);
        const partner = strongestSameGenerationPartner(npc);
        if (partner) {
          assigned.add(partner.id);
          groups.push(npc.id === root?.id ? [partner, npc] : [npc, partner]);
        } else {
          groups.push([npc]);
        }
      }
      const scoreGroup = (group: MysteryNpc[]) => group.reduce((score, npc) => score + weightedNeighborScore(npc), 0);
      const sortedGroups = groups.sort((a, b) =>
        Number(b.some((npc) => npc.id === root?.id)) - Number(a.some((npc) => npc.id === root?.id)) ||
        scoreGroup(b) - scoreGroup(a) ||
        Math.max(...b.map((npc) => npc.age)) - Math.max(...a.map((npc) => npc.age))
      );
      if (!root || !sortedGroups.some((group) => group.some((npc) => npc.id === root.id))) return sortedGroups.flat();
      const rootGroup = sortedGroups.find((group) => group.some((npc) => npc.id === root.id)) ?? [root];
      const otherGroups = sortedGroups.filter((group) => !group.some((npc) => npc.id === root.id));
      const leftGroups: MysteryNpc[][] = [];
      const rightGroups: MysteryNpc[][] = [];
      otherGroups.forEach((group, index) => {
        (index % 2 === 0 ? rightGroups : leftGroups).push(group);
      });
      return [...leftGroups.reverse().flat(), ...rootGroup, ...rightGroups.flat()];
    };
    const generationRows = generations.map((generation) => ({
      generation,
      people: orderGenerationPeople(familyMembers.filter((npc) => (generationById.get(npc.id) ?? 0) === generation))
    }));
    const maxRowCount = Math.max(1, ...generationRows.map((row) => row.people.length));
    const treeCanvasWidth = Math.max(620, canvasPaddingX * 2 + maxRowCount * nodeWidth + Math.max(0, maxRowCount - 1) * nodeGapX);
    const treeCanvasHeight = Math.max(390, canvasPaddingY * 2 + generationRows.length * nodeHeight + Math.max(0, generationRows.length - 1) * generationGapY + 70);
    const nodeLayout = new Map<string, { x: number; y: number; centerX: number; centerY: number; generation: number }>();
    generationRows.forEach((row, rowIndex) => {
      const rowWidth = row.people.length * nodeWidth + Math.max(0, row.people.length - 1) * nodeGapX;
      const startX = (treeCanvasWidth - rowWidth) / 2;
      const y = canvasPaddingY + rowIndex * (nodeHeight + generationGapY);
      row.people.forEach((npc, index) => {
        const x = startX + index * (nodeWidth + nodeGapX);
        nodeLayout.set(npc.id, { x, y, centerX: x + nodeWidth / 2, centerY: y + nodeHeight / 2, generation: row.generation });
      });
    });
    const selectedTreeLayout = root ? nodeLayout.get(root.id) : null;
    mysteryTreeSelectedCenterRef.current = selectedTreeLayout
      ? { x: selectedTreeLayout.centerX, y: selectedTreeLayout.centerY, canvasWidth: treeCanvasWidth, canvasHeight: treeCanvasHeight }
      : null;
    const treeTone = themeName === "dark"
      ? {
        frame: "#8b6a34",
        shellBg: "#111015",
        headerBg: "rgba(8, 8, 10, 0.88)",
        headerText: "#f5e3c8",
        nodeBg: "rgba(26, 23, 24, 0.96)",
        nodeBorder: "rgba(176, 135, 64, 0.64)",
        nodeText: "#f4e4ca",
        familyLine: "#d88932",
        loverLine: "#d43b35",
        partnerLine: "#9a62e8"
      }
      : {
        frame: "#d1a65d",
        shellBg: "#fffaf2",
        headerBg: "rgba(255, 250, 240, 0.94)",
        headerText: "#5d4731",
        nodeBg: "rgba(255, 251, 244, 0.97)",
        nodeBorder: "rgba(190, 145, 72, 0.58)",
        nodeText: "#5a4434",
        familyLine: "#c9772c",
        loverLine: "#c93434",
        partnerLine: "#8d55d8"
      };
    const lineColorFor = (kind: MysteryNpcRelationshipKind) => kind === "Affair" ? treeTone.loverLine : kind === "Romance" || kind === "Marriage" ? treeTone.partnerLine : treeTone.familyLine;
    const lineWidthFor = (kind: MysteryNpcRelationshipKind) => kind === "Family" ? 3 : 4;
    const LineSegment = ({ x, y, width, height, color }: { x: number; y: number; width: number; height: number; color: string }) => (
      <View pointerEvents="none" style={[styles.mysteryFamilyTreeLineSegment, { left: x, top: y, width: Math.max(2, width), height: Math.max(2, height), backgroundColor: color }]} />
    );
    const sameGenerationCounts = new Map<number, number>();
    const edgeSegments = relationshipEdges.flatMap((edge) => {
      const from = nodeLayout.get(edge.fromId);
      const to = nodeLayout.get(edge.toId);
      if (!from || !to) return [];
      const fromNpc = activeMystery.npcs.find((npc) => npc.id === edge.fromId);
      const toNpc = activeMystery.npcs.find((npc) => npc.id === edge.toId);
      const color = lineColorFor(edge.kind);
      const thickness = lineWidthFor(edge.kind);
      const horizontal = (x1: number, x2: number, y: number, key: string) => (
        <LineSegment key={key} x={Math.min(x1, x2)} y={y - thickness / 2} width={Math.abs(x2 - x1)} height={thickness} color={color} />
      );
      const vertical = (x: number, y1: number, y2: number, key: string) => (
        <LineSegment key={key} x={x - thickness / 2} y={Math.min(y1, y2)} width={thickness} height={Math.abs(y2 - y1)} color={color} />
      );
      if (from.generation === to.generation) {
        const count = sameGenerationCounts.get(from.generation) ?? 0;
        sameGenerationCounts.set(from.generation, count + 1);
        const sameLevelLabel = fromNpc && toNpc ? directMysteryTreeRelationshipLabel(fromNpc, toNpc, activeMystery) : "";
        const routeAbove = edge.kind === "Family" && Boolean(sameLevelLabel?.match(/\b(sister|brother|cousin)\b/));
        const routeBelow = !routeAbove && from.y < treeCanvasHeight - nodeHeight - 90;
        const routeY = routeBelow ? from.y + nodeHeight + 22 + count * 13 : from.y - 22 - count * 13;
        const fromAnchorY = routeBelow ? from.y + nodeHeight : from.y;
        const toAnchorY = routeBelow ? to.y + nodeHeight : to.y;
        return [
          vertical(from.centerX, fromAnchorY, routeY, `${edge.id}-same-from`),
          horizontal(from.centerX, to.centerX, routeY, `${edge.id}-same-mid`),
          vertical(to.centerX, toAnchorY, routeY, `${edge.id}-same-to`)
        ];
      }
      const fromLower = from.y < to.y;
      const fromAnchorY = fromLower ? from.y + nodeHeight : from.y;
      const toAnchorY = fromLower ? to.y : to.y + nodeHeight;
      const routeY = (fromAnchorY + toAnchorY) / 2;
      return [
        vertical(from.centerX, fromAnchorY, routeY, `${edge.id}-from`),
        horizontal(from.centerX, to.centerX, routeY, `${edge.id}-mid`),
        vertical(to.centerX, toAnchorY, routeY, `${edge.id}-to`)
      ];
    });

    return (
      <Shell>
        <View style={styles.rowBetween}>
          <Text style={[styles.titleSmall, { color: C.text }]}>Family Tree</Text>
          <Button small label="Residents" onPress={() => setScreen("mysteryRelations")} />
        </View>
        <View style={[styles.mysteryFamilyTreeShell, { backgroundColor: treeTone.shellBg, borderColor: treeTone.frame }]}>
          <View style={[styles.mysteryFamilyTreeTitleBar, { backgroundColor: treeTone.headerBg, borderBottomColor: treeTone.frame }]}>
            <Text style={[styles.mysteryFamilyTreeTitle, { color: treeTone.headerText }]}>{root ? `Family Tree of ${fullName(root)}` : "Family Tree"}</Text>
          </View>
          <ScrollView
            ref={mysteryTreeHorizontalRef}
            horizontal
            nestedScrollEnabled
            showsHorizontalScrollIndicator
            style={styles.mysteryFamilyTreeViewport}
            onLayout={(event) => {
              const { width, height } = event.nativeEvent.layout;
              setMysteryTreeViewport((current) => current.width === width && current.height === height ? current : { width, height });
            }}
          >
            <ScrollView ref={mysteryTreeVerticalRef} nestedScrollEnabled showsVerticalScrollIndicator>
              <View style={[styles.mysteryFamilyTreeCanvas, { width: treeCanvasWidth, height: treeCanvasHeight }]}>
                <View pointerEvents="none" style={styles.mysteryFamilyTreeLineLayer}>
                  {edgeSegments}
                </View>
                {familyMembers.map((npc) => {
                  const selected = root?.id === npc.id;
                  const relationLabel = root ? mysteryTreeRelationshipLabel(root, npc, activeMystery) : "";
                  const hasRelationLabel = relationLabel.length > 0;
                  const layout = nodeLayout.get(npc.id);
                  if (!layout) return null;
                  return (
                    <Pressable
                      key={npc.id}
                      onPress={() => pressMysteryFamilyTreeNode(npc.id)}
                      style={[
                        styles.mysteryFamilyTreeNode,
                        { left: layout.x, top: layout.y, backgroundColor: treeTone.nodeBg, borderColor: treeTone.nodeBorder },
                        !hasRelationLabel && styles.mysteryFamilyTreeNodeNoText,
                        selected && [styles.mysteryFamilyTreeNodeSelected, { borderColor: C.gold, shadowColor: C.gold }]
                      ]}
                    >
                      <PortraitImage subject={npc} size="map" highlight={selected} />
                      {hasRelationLabel ? (
                        <View style={styles.mysteryFamilyTreeNodeText}>
                          <Text style={[styles.mysteryFamilyTreeNodeName, { color: treeTone.nodeText }]} numberOfLines={1}>{relationLabel}</Text>
                        </View>
                      ) : null}
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>
          </ScrollView>
        </View>
        <Button label="Back" onPress={() => setScreen("mysteryRelations")} />
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
        <Button label="Back" onPress={() => setScreen("mystery")} />
      </Shell>
    );
  }

  if (screen === "mysteryJournal" && activeMystery) {
    const archiveMessagesByDay = activeMystery.journal.reduce<
      Record<number, StoryMessage[]>
    >((groups, message) => {
      const day = message.archiveDay ?? 1;

      if (!groups[day]) {
        groups[day] = [];
      }

      groups[day].push(message);
      return groups;
    }, {});

    const archiveDays = Object.keys(archiveMessagesByDay)
      .map(Number)
      .sort((a, b) => b - a);

    const blueprint = activeMystery.murders.map((murder, index) => `Murder ${index + 1}: ${mysteryNpcName(activeMystery, murder.victimId)} by ${mysteryNpcName(activeMystery, murder.killerId)} on day ${murder.day} ${murder.daytime}, ${murder.method}. Motive: ${cleanSentenceEnd(murder.motive)}. Clues/proof: ${(murder.proofs?.length ? murder.proofs : [murder.proof]).join(", ")}.`);
    const findableBlueprint = (activeMystery.findables ?? []).map((findable) => {
      const room = findable.roomId ? mysteryRoomName(activeMystery, findable.roomId) : "no fixed room";
      const holder = findable.holderNpcId ? mysteryNpcName(activeMystery, findable.holderNpcId) : "no holder";
      const murderLabel = findable.relatedMurderIndex !== undefined ? `, murder ${findable.relatedMurderIndex + 1}` : "";
      return `${findable.kind}${findable.origin ? `/${findable.origin}` : ""}: ${findable.name}${murderLabel}. ${findable.description} Location: ${room}; holder/source: ${holder}; available from ${mysteryAvailabilityLabel(findable.availableDay, findable.availableDaytime)}.${findable.collected ? " Collected." : ""}`;
    });
    return Shell({
      children: (
        <>
        <View style={styles.rowBetween}>
          <Text style={[styles.titleSmall, { color: C.text }]}>Journal</Text>
          <Button small label="Back" onPress={() => setScreen("mystery")} />
        </View>
        {Card({
          children: (
            <>
              <Text style={[styles.heading, { color: C.text }]}>
                Your Notes
              </Text>

              <TextInput
                value={activeMystery.journalNotes}
                onChangeText={(journalNotes) =>
                  patchMystery((mystery) => ({
                    ...mystery,
                    journalNotes: journalNotes.slice(0, 3000)
                  }))
                }
                placeholder="Write your own suspicions, clues, and theories..."
                placeholderTextColor={C.dim}
                multiline
                maxLength={3000}
                style={[
                  styles.input,
                  styles.notesInput,
                  {
                    backgroundColor: C.panel2,
                    borderColor: C.line,
                    color: C.text
                  }
                ]}
              />
            </>
          )
        })}
        <Card>
          <Text style={[styles.heading, styles.gameHiddenText]}>Case Blueprint For Testing</Text>
          {blueprint.map((line) => <Text key={line} style={[styles.body, styles.gameHiddenText]}>{line}</Text>)}
          <Text style={[styles.heading, styles.gameHiddenText]}>Generated Findable Items For Testing</Text>
          {findableBlueprint.length === 0 ? <Text style={[styles.body, styles.gameHiddenText]}>No generated findables in this older save.</Text> : null}
          {findableBlueprint.map((line) => <Text key={line} style={[styles.body, styles.gameHiddenText]}>{line}</Text>)}
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
        <Text style={[styles.heading, { color: C.text }]}>
          Story Archive
        </Text>

        {activeMystery.journal.length === 0 ? (
          <Text style={[styles.subtitle, { color: C.dim }]}>
            Older story text will appear here after more than five responses.
          </Text>
        ) : null}

        {archiveDays.map((day) => {
          const isExpanded =
            expandedMysteryArchiveDays[day] ??
            day === archiveDays[0];

          const dayMessages = archiveMessagesByDay[day];

          return (
            <View key={`archive-day-${day}`}>
              <Pressable
                onPress={() =>
                  setExpandedMysteryArchiveDays((current) => ({
                    ...current,
                    [day]: !(current[day] ?? day === archiveDays[0])
                  }))
                }
                style={[
                  styles.mysteryArchiveDayHeader,
                  {
                    backgroundColor: C.panel2,
                    borderColor: C.line
                  }
                ]}
              >
                <View>
                  <Text style={[styles.heading, { color: C.text }]}>
                    Day {day}
                  </Text>

                  <Text style={[styles.rollText, { color: C.dim }]}>
                    {dayMessages.length} archived{" "}
                    {dayMessages.length === 1 ? "entry" : "entries"}
                  </Text>
                </View>

                <Text
                  style={[
                    styles.mysteryArchiveArrow,
                    { color: C.accent }
                  ]}
                >
                  {isExpanded ? "â–˛" : "â–Ľ"}
                </Text>
              </Pressable>

              {isExpanded
                ? dayMessages.map((message) => (
                    <Card key={message.id}>
                      <View style={styles.rowBetween}>
                        <Text
                          style={[
                            styles.storySpeaker,
                            {
                              color:
                                message.speaker === "Player"
                                  ? C.accent
                                  : C.gold
                            }
                          ]}
                        >
                          {message.speaker}
                        </Text>

                        {message.archiveDaytime ? (
                          <Text
                            style={[
                              styles.rollText,
                              { color: C.dim }
                            ]}
                          >
                            {message.archiveDaytime}
                          </Text>
                        ) : null}
                      </View>

                      {message.icon ? (
                        <View style={styles.mysteryMessageIconRow}>
                          <View style={[styles.mysteryMessageIconBubble, { borderColor: message.icon === "death" ? "#c41338" : C.line, backgroundColor: C.panel2 }]}>
                            <IconDumpIcon name={message.icon} size={42} />
                          </View>
                          <View style={styles.mysteryMessageIconText}>
                            <Text style={[styles.body, { color: C.text }]}>
                              {message.text}
                            </Text>
                          </View>
                        </View>
                      ) : (
                        <Text style={[styles.body, { color: C.text }]}>
                          {message.text}
                        </Text>
                      )}

                      {message.roll ? (
                        <Text
                          style={[
                            styles.rollText,
                            { color: C.dim }
                          ]}
                        >
                          {message.roll}
                        </Text>
                      ) : null}
                    </Card>
                  ))
                : null}
            </View>
          );
        })}
        <Button label="Back" onPress={() => setScreen("mystery")} />
        </>
      )
    });
  }

  if (screen === "load") {
    const activeMysteries = mysteries.filter((mystery) => !mystery.finished);
    return (
      <Shell>
        <Text style={[styles.titleSmall, { color: C.text }]}>Load Game</Text>
        {activeMysteries.length === 0 ? <Text style={[styles.subtitle, { color: C.dim }]}>No open cases yet.</Text> : null}
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
    const pastMysteries = mysteries.filter((mystery) => mystery.finished);
    return (
      <Shell>
        <Text style={[styles.titleSmall, { color: C.text }]}>Finished Games</Text>
        {pastMysteries.length === 0 ? <Text style={[styles.subtitle, { color: C.dim }]}>No closed cases yet.</Text> : null}
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
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  backgroundImage: { flex: 1 },
  backgroundTint: { flex: 1 },
  scroll: { flex: 1 },
  container: { padding: 20, gap: 14 },
  fixedBottomContent: { paddingBottom: 124 },
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
  mysteryArchiveDayHeader: {
    minHeight: 62,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 10,
    marginBottom: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },

  mysteryArchiveArrow: {
    fontSize: 18,
    fontWeight: "800",
    marginLeft: 12
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
  portraitResidentFrame: { width: 92, height: 156, borderWidth: 1, borderRadius: 8, overflow: "hidden" },
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
  intoxicatedTrustPill: { shadowColor: "#ff2222", shadowOpacity: 0.45, shadowRadius: 8, shadowOffset: { width: 0, height: 0 } },
  mysteryTrustPillLabel: { fontSize: 8, lineHeight: 10, fontWeight: "900", textTransform: "uppercase" },
  mysteryTrustPillValue: { fontSize: 18, lineHeight: 20, fontWeight: "800" },
  gameHiddenText: { color: "#b97cff", fontWeight: "800" },
  discoverableHiddenText: { color: "#8fd3ff", fontWeight: "800" },
  characterHeader: { flexDirection: "row", alignItems: "center", gap: 14 },
  characterHeaderText: { flex: 1, minWidth: 0, gap: 4 },
  fixedBottomMenu: { position: "absolute", left: 0, right: 0, bottom: 0, paddingHorizontal: 12, paddingTop: 8, paddingBottom: 12, borderTopWidth: 1, borderColor: "rgba(255,255,255,0.12)" },
  bottomMenu: { flexDirection: "row", borderWidth: 1, borderRadius: 8, overflow: "hidden", marginTop: 8 },
  bottomMenuItem: { flex: 1, minHeight: 94, alignItems: "center", justifyContent: "center", paddingHorizontal: 4, paddingVertical: 7, borderRightWidth: 1 },
  bottomMenuLabel: { minHeight: 78, alignItems: "center", justifyContent: "center", gap: 3 },
  bottomMenuIconStage: { width: 66, height: 58, alignItems: "center", justifyContent: "center" },
  bottomMenuText: { fontSize: 12, lineHeight: 14, fontWeight: "800", textAlign: "center" },
  iconDumpFrame: { overflow: "hidden", alignItems: "center", justifyContent: "center" },
  iconDumpSheet: { position: "absolute" },
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
  mysteryMessageIconRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  mysteryMessageIconBubble: { width: 54, height: 54, borderWidth: 1, borderRadius: 8, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  mysteryMessageIconText: { flex: 1, minWidth: 0 },
  mysteryDayPanel: { alignItems: "center", justifyContent: "center", padding: 10, borderWidth: 1, borderColor: "rgba(240, 196, 92, 0.28)" },
  ravenwoodBubbleBackdrop: { overflow: "hidden" },
  ravenwoodBubbleBackdropImage: { borderRadius: 8 },
  ravenwoodSceneBackdropImage: { borderRadius: 8 },
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
  residentPortraitTools: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 16 },
  mysteryPortraitMagnifierButton: { width: 74, height: 74, borderWidth: 1, borderRadius: 8, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  substanceBubbleRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 2 },
  substanceBubble: { overflow: "hidden", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, backgroundColor: "#ff2222", color: "#fff", fontSize: 10, lineHeight: 13, fontWeight: "900", textTransform: "uppercase" },
  relationshipLedgerBox: { borderWidth: 1, borderRadius: 8, padding: 10, gap: 4 },
  ledgerBox: { borderWidth: 1, borderRadius: 8, padding: 10, gap: 3, maxHeight: 420 },
  ledgerText: { fontSize: 11, lineHeight: 15, fontFamily: "monospace" },
  mysteryMapGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  mysteryRoomTile: { width: "48%", minHeight: 112, borderWidth: 1, borderRadius: 8, padding: 10, gap: 6 },
  mysteryRoomName: { fontSize: 14, fontWeight: "800" },
  mapPortraitButton: { borderRadius: 8 },
  mysteryFamilyTreeShell: { borderWidth: 2, borderRadius: 8, overflow: "hidden", minHeight: 430 },
  mysteryFamilyTreeTitleBar: { minHeight: 34, justifyContent: "center", paddingHorizontal: 10, borderBottomWidth: 1 },
  mysteryFamilyTreeTitle: { fontSize: 15, lineHeight: 19, fontWeight: "900" },
  mysteryFamilyTreeViewport: { flexGrow: 0, height: 430 },
  mysteryFamilyTreeCanvas: { minWidth: 620, minHeight: 390, position: "relative" },
  mysteryFamilyTreeLineLayer: { ...StyleSheet.absoluteFillObject },
  mysteryFamilyTreeLineSegment: { position: "absolute", borderRadius: 8 },
  mysteryFamilyTreeNode: { position: "absolute", width: 170, minHeight: 82, borderWidth: 2, borderRadius: 8, padding: 7, flexDirection: "row", alignItems: "center", justifyContent: "flex-start", gap: 9 },
  mysteryFamilyTreeNodeNoText: { justifyContent: "center" },
  mysteryFamilyTreeNodeSelected: { borderWidth: 3, shadowOpacity: 0.78, shadowRadius: 13, shadowOffset: { width: 0, height: 0 }, elevation: 9 },
  mysteryFamilyTreeNodeText: { flex: 1, minWidth: 96 },
  mysteryFamilyTreeNodeName: { fontSize: 12, lineHeight: 16, fontWeight: "900", textTransform: "lowercase" },
  mysteryFamilyTreeNodeMeta: { fontSize: 9, lineHeight: 12, fontWeight: "800" },
  itemRow: { borderTopWidth: 1, paddingTop: 10, gap: 8, flexDirection: "row", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" },
  itemNameRow: { flex: 1, minWidth: 190, flexDirection: "row", alignItems: "center", gap: 9 },
  inventoryItemIconBubble: { width: 40, height: 40, borderWidth: 1, borderRadius: 8, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  itemName: { flex: 1, minWidth: 0, flexShrink: 1, fontWeight: "800" },
  modalShade: { flex: 1, backgroundColor: "rgba(0, 0, 0, 0.62)", alignItems: "center", justifyContent: "center", padding: 20 },
  modalCard: { width: "100%", maxWidth: 420, borderWidth: 1, borderRadius: 8, padding: 16, gap: 10 }
});
