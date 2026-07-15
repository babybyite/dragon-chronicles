import React, { useMemo, useState } from "react";
import {
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

type ThemeName = "dark" | "pastel";
type Screen = "menu" | "builder1" | "builder2" | "chronicle" | "load" | "past" | "settings" | "family" | "relationships" | "possessions" | "paper";
type BirthStatus = "Royal" | "Noble" | "Bastard" | "Commoner";
type Sex = "Female" | "Male";

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
  yearLog: { year: number; lines: string[] }[];
  placeUses: Record<string, number>;
  milestones: { id: string; title: string; year: number }[];
  pendingBirth?: PendingBirth | null;
  outerPolitics: string[];
  innerPolitics: string[];
  finished: boolean;
  summary?: string;
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

const firstNames = ["Aelira", "Mirelle", "Vaessa", "Rowan", "Lucian", "Dorian", "Veyr", "Sable", "Corenna", "Tavik"];
const childNames = ["Elian", "Mara", "Neris", "Orren", "Lysa", "Theo", "Asha", "Rook", "Selene", "Bryn"];
const extraNames = ["Ilyra", "Cassian", "Maelor", "Nyra", "Edric", "Rhaen", "Tamsin", "Gareth", "Yselle", "Kael", "Nadia", "Osric", "Helena", "Jory", "Maric", "Evara", "Tristan", "Liora"];
const familyNames = ["Duskblade", "Ashcroft", "Ravenshade", "Embermere", "Wintermere", "Crownfall"];
const bloodlines = ["Child of Atlantis", "Wolf Cub", "Witch Blood", "Common Blood"];
const origins = ["Northlands", "Southern Isles", "Eastern Courts", "Western Marches", "Steppe", "Deep Cities"];
const hairStyles = ["Short", "Long Straight", "Wavy", "Curly", "Braided", "Pixie", "Shaved", "Messy Bun"];
const hairColors = ["Black", "Light Brown", "Dark Brown", "Blonde", "Platinum Blonde", "Ash White", "Ginger", "Dark Red"];
const faceTraits = ["Freckles", "Scarred", "Mismatched Eyes", "Fire-Burned", "Vitiligo", "Half-Blind", "Sharp-Boned", "Glowing Eyes"];

const clothingByStatus: Record<BirthStatus, string[]> = {
  Royal: ["Jeweled Court Gown", "Royal Armor", "Crown Silk Robe", "Embroidered State Suit", "Ceremonial Cloak"],
  Noble: ["Decorated Gown", "Cloak with Hood", "Armor", "Decorated Suit", "Decorated Tunic"],
  Bastard: ["Simple Dress", "Hooded Robe", "Patched Tunic", "Travel Coat", "Worn Leathers"],
  Commoner: ["Simple Dress", "Work Tunic", "Market Apron", "Hooded Robe", "Patched Leathers"]
};

const clothColorsByStatus: Record<BirthStatus, string[]> = {
  Royal: ["Crimson", "Silver", "Ivory", "Royal Violet", "Deep Black", "Ocean Pearl"],
  Noble: ["Scarlet", "Azure", "Violet", "Golden", "Silver", "Rose", "Steel Black", "Ivory"],
  Bastard: ["Bloody Red", "Pitch Black", "Faded Brown", "Ash Grey", "Light Cream", "Clean Pastel"],
  Commoner: ["Faded Brown", "Moss Green", "Washed Blue", "Ash Grey", "Light Cream", "Clay Red"]
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
    origin: pick(origins),
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
    bloodline: pick([player.bloodline, "Common Blood"])
  });
  const paternalGrandmother = makePerson({
    relation: "Grandmother",
    familyName: player.familyName,
    sex: "Female",
    age: player.age + rand(46, 66),
    birthStatus: fatherStatus === "Royal" ? pick<BirthStatus>(["Royal", "Noble"]) : fatherStatus,
    bloodline: pick([player.bloodline, "Common Blood"])
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
    parentIds: [paternalGrandfather.id, paternalGrandmother.id]
  });
  auntOrUncle.relation = auntOrUncle.sex === "Female" ? "Aunt" : "Uncle";
  const cousin = makePerson({
    relation: "Cousin",
    familyName: player.familyName,
    age: clamp(player.age + pick([-8, -4, 0, 5, 10]), 0, 80),
    birthStatus: fatherStatus,
    bloodline: pick([player.bloodline, "Common Blood"]),
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
      bloodline: pick([marriedParent.bloodline, "Common Blood"])
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
        birthStatus: pick<BirthStatus>(["Commoner", "Commoner", "Bastard"])
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

function possessionWorth(item: string, status: BirthStatus): number {
  const base = status === "Royal" ? rand(70, 260) : status === "Noble" ? rand(35, 150) : status === "Bastard" ? rand(12, 75) : rand(4, 42);
  const rare = item.includes("signet") || item.includes("letter") || item.includes("writ") || item.includes("ring");
  return rare ? Math.floor(base * 1.6) : base;
}

function possessionValueMap(items: string[], status: BirthStatus): Record<string, number> {
  return Object.fromEntries(items.map((item) => [item, possessionWorth(item, status)]));
}

function petitionReady(story: Story): boolean {
  return story.player.birthStatus === "Bastard" && !story.player.legitimacySupport.petitioned && (story.player.legitimacySupport.royal >= 1 || story.player.legitimacySupport.noble >= story.player.legitimacySupport.requiredNoble);
}

function isCloseFamily(relation: Relation): boolean {
  return ["Mother", "Father", "Sibling", "Half Sibling", "Child", "Ward"].includes(relation.relation) || relation.isWard === true;
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
  const [treeZoom, setTreeZoom] = useState(1);
  const [babyNames, setBabyNames] = useState<string[]>([]);
  const [influenceTargets, setInfluenceTargets] = useState<Record<string, string>>({});
  const C = themes[themeName];
  const activeStory = useMemo(() => stories.find((story) => story.id === activeStoryId) ?? null, [activeStoryId, stories]);

  function patchDraft(next: Partial<CharacterDraft>) {
    setDraft((current) => ({ ...current, ...next }));
  }

  function chooseBirthStatus(birthStatus: BirthStatus) {
    patchDraft({
      birthStatus,
      clothing: clothingByStatus[birthStatus][0],
      clothColor: clothColorsByStatus[birthStatus][0]
    });
  }

  function startStory() {
    const visibleBastardSigns = draft.birthStatus === "Bastard" && roll(draft.bloodline === "Common Blood" ? 0.35 : 0.58);
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
        ? `The noble father was not written openly into every prayer, but the family tree knows: the claim begins in noble blood.${player.visibleBastardSigns ? " The face makes denial harder, and danger sharper." : " The face gives useful room for denial."}`
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

  function addLine(line: string) {
    patchActive((story) => {
      const yearLog = [...story.yearLog];
      const latest = yearLog[yearLog.length - 1];
      if (!latest) return story;
      yearLog[yearLog.length - 1] = { ...latest, lines: [...latest.lines, line] };
      return { ...story, yearLog };
    });
  }

  function visit(place: string) {
    if (!activeStory || activeStory.finished) return;
    const used = activeStory.placeUses[place] ?? 0;
    if (used >= 3) {
      addLine(`${activeStory.player.firstName} has already tested ${place} three times this year; even rumors need time to grow back.`);
      return;
    }

    const encounter = Math.random() < encounterChance(activeStory.player.birthStatus, place);
    const newRelation = encounter ? normalizeNewRelationNames([createRelationFromPlace(activeStory, place)], usedNamesForStory(activeStory))[0] : null;
    const line = describePlaceVisit(activeStory, place, used + 1, newRelation);

    patchActive((story) => ({
      ...story,
      player: {
        ...story.player,
        happiness: clamp(story.player.happiness + (place === "private chambers" || place === "home" ? 3 : 1), 0, 100),
        strength: place === "forest" || place === "sewers" ? clamp(story.player.strength + 1, 0, 100) : story.player.strength,
        honor: place === "slums" ? clamp(story.player.honor - 1, 0, 100) : story.player.honor
      },
      relations: newRelation ? [newRelation, ...story.relations] : story.relations,
      placeUses: { ...story.placeUses, [place]: used + 1 }
    }));
    addLine(line);
  }

  function labour() {
    if (!activeStory || activeStory.finished || !["Bastard", "Commoner"].includes(activeStory.player.birthStatus)) return;
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

  function petitionForLegitimacy() {
    if (!activeStory || !petitionReady(activeStory)) return;
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
    if (!activeStory) return;
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
        ...story.family.filter((person) => person.id !== removeWardPersonId),
        ...(wardPerson ? [wardPerson] : [])
      ],
      relations: story.relations.map((candidate) =>
        candidate.id === relationId
          ? {
              ...candidate,
              trust: clamp(candidate.trust + delta.trust, 0, 100),
              romance: clamp(candidate.romance + delta.romance, 0, 100),
              resentment: clamp(candidate.resentment + delta.resentment, 0, 100),
              spouseId: relationSpouseId,
              isWard: action === "Take Ward" ? true : action === "Abandon Ward" ? false : candidate.isWard,
              allianceFormed: action === "Form Alliance" ? true : candidate.allianceFormed,
              legitimacyConvinced: action === "Convince of Legitimacy" ? true : candidate.legitimacyConvinced,
              familyPersonId: action === "Take Ward" ? relation.id : action === "Abandon Ward" ? undefined : candidate.familyPersonId,
              actionUses: { ...candidate.actionUses, [action]: used + 1 },
              memory: [...candidate.memory, line].slice(-20),
              note: line
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
      const lines = player.alive ? backgroundLines : [...backgroundLines, `${player.firstName} died of ${player.causeOfDeath}. The chronicle falls silent for now.`];
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
        finished: !player.alive,
        summary: !player.alive ? `${player.firstName} ${player.familyName} died at age ${age} after ${story.yearLog.length} recorded years.` : story.summary,
        yearLog: [...story.yearLog, { year: nextYear, lines }]
      };
    });
  }

  function removeStory(storyId: string) {
    setStories((current) => current.filter((story) => story.id !== storyId));
    if (activeStoryId === storyId) setActiveStoryId(null);
  }

  function nameBabies() {
    if (!activeStory?.pendingBirth) return;
    const pending = activeStory.pendingBirth;
    patchActive((story) => {
      const otherParent = pending.parentRelationId ? story.relations.find((relation) => relation.id === pending.parentRelationId) : undefined;
      const usedNames = usedNamesForStory(story);
      const parentsMarried = otherParent?.spouseId === story.player.id || story.player.spouseId === otherParent?.id;
      const motherFamilyName = story.player.sex === "Female" ? story.player.familyName : otherParent?.familyName ?? story.player.familyName;
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
    const content = (
      <SafeAreaView style={[styles.safe, { backgroundColor: menuBackground ? "transparent" : C.bg }]}>
        <StatusBar barStyle={themeName === "dark" ? "light-content" : "dark-content"} />
        <ScrollView style={styles.scroll} contentContainerStyle={[styles.container, menuBackground && styles.menuContainer]}>
          {children}
        </ScrollView>
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
        <View
          style={[
            styles.backgroundTint,
            { backgroundColor: themeName === "dark" ? "rgba(4, 4, 7, 0.38)" : "rgba(255, 250, 242, 0.18)" }
          ]}
        >
          {content}
        </View>
      </ImageBackground>
    );
  }

  function Card({ children }: { children: React.ReactNode }) {
    return <View style={[styles.card, { backgroundColor: C.panel, borderColor: C.line }]}>{children}</View>;
  }

  function Button({ label, onPress, disabled = false, small = false }: { label: string; onPress: () => void; disabled?: boolean; small?: boolean }) {
    return (
      <Pressable onPress={disabled ? undefined : onPress} style={[styles.button, small && styles.buttonSmall, { backgroundColor: disabled ? C.panel2 : C.accent, opacity: disabled ? 0.55 : 1 }]}>
        <Text style={[styles.buttonText, { fontSize: small ? 14 : 17 }]}>{label}</Text>
      </Pressable>
    );
  }

  function Chip({ label, selected, onPress, disabled = false }: { label: string; selected: boolean; onPress: () => void; disabled?: boolean }) {
    return (
      <Pressable onPress={disabled ? undefined : onPress} style={[styles.chip, { backgroundColor: selected ? C.accent : C.panel2, borderColor: selected ? C.accent : C.line, opacity: disabled ? 0.5 : 1 }]}>
        <Text style={styles.chipText}>{label}</Text>
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

  function Portrait({ story }: { story: Story }) {
    const p = story.player;
    return (
      <View style={[styles.portrait, { backgroundColor: C.panel2, borderColor: C.line }]}>
        <Text style={[styles.portraitStage, { color: C.silver }]}>{p.age < 16 ? "young portrait" : p.age < 45 ? "adult portrait" : "elder portrait"}</Text>
        <View style={[styles.face, { backgroundColor: p.bloodline === "Child of Atlantis" ? "#467c8f" : p.bloodline === "Witch Blood" ? "#9d8ac8" : p.bloodline === "Wolf Cub" ? "#71806c" : C.good }]}>
          <Text style={styles.faceText}>{p.firstName.slice(0, 1)}</Text>
        </View>
        <Text style={[styles.portraitName, { color: C.text }]}>{p.firstName}</Text>
        <Text style={[styles.portraitDetail, { color: C.dim }]}>{p.sex} - {p.hairColor} - {p.faceTrait}</Text>
      </View>
    );
  }

  function Stat({ label, value }: { label: string; value: number }) {
    return (
      <View style={styles.stat}>
        <View style={styles.rowBetween}>
          <Text style={{ color: C.dim }}>{label}</Text>
          <Text style={{ color: C.text }}>{value}</Text>
        </View>
        <View style={[styles.bar, { backgroundColor: C.panel2 }]}>
          <View style={[styles.barFill, { backgroundColor: value >= 60 ? C.good : C.accent, width: `${clamp(value, 0, 100)}%` }]} />
        </View>
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

  function marriageText(person: Person): string | null {
    const spouseName = nameById(person.spouseId);
    if (spouseName) return `Married to ${spouseName}`;
    if (person.age >= 14) return "Not married";
    return null;
  }

  if (screen === "menu") {
    return (
      <Shell menuBackground>
        <Text style={[styles.title, styles.menuTextShadow, { color: C.text }]}>Dragon Chronicles</Text>
        <Text style={[styles.subtitle, styles.menuTextShadow, { color: themeName === "dark" ? "#e7e1dc" : C.text }]}>Forge a soul. Year by year, keep the bloodline alive.</Text>
        <Button label="New Game" onPress={() => setScreen("builder1")} />
        <Button label="Load Game" onPress={() => setScreen("load")} />
        <Button label="Past Games" onPress={() => setScreen("past")} />
        <Button label="Settings" onPress={() => setScreen("settings")} />
        <Button label="Exit" onPress={() => undefined} disabled />
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
          <View style={styles.wrapRow}>{(["Female", "Male"] as const).map((sex) => <Chip key={sex} label={sex} selected={draft.sex === sex} onPress={() => patchDraft({ sex })} />)}</View>
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
    const availableClothes = clothingByStatus[draft.birthStatus];
    const availableColors = clothColorsByStatus[draft.birthStatus];
    return (
      <Shell>
        <Text style={[styles.titleSmall, { color: C.text }]}>Character Builder</Text>
        <Text style={[styles.subtitle, { color: C.dim }]}>Step 2 of 2: age, origin, and portrait seed.</Text>
        <Card>
          <Text style={[styles.label, { color: C.dim }]}>Starting Age</Text>
          <View style={styles.wrapRow}>{[0, 12, 16, 24].map((startAge) => <Chip key={startAge} label={String(startAge)} selected={draft.startAge === startAge} onPress={() => patchDraft({ startAge })} />)}</View>
          <Text style={[styles.label, { color: C.dim }]}>Origin</Text>
          <View style={styles.wrapRow}>{origins.map((origin) => <Chip key={origin} label={origin} selected={draft.origin === origin} onPress={() => patchDraft({ origin })} />)}</View>
          <Text style={[styles.label, { color: C.dim }]}>Hair</Text>
          <View style={styles.wrapRow}>{hairStyles.map((hairStyle) => <Chip key={hairStyle} label={hairStyle} selected={draft.hairStyle === hairStyle} onPress={() => patchDraft({ hairStyle })} />)}</View>
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
    const latest = activeStory.yearLog[activeStory.yearLog.length - 1];
    return (
      <Shell>
        <View style={styles.rowBetween}>
          <Button small label="Menu" onPress={() => setScreen("menu")} />
          <Portrait story={activeStory} />
        </View>
        <Card>
          <Text style={[styles.heading, { color: C.text }]}>{activeStory.player.firstName} {activeStory.player.familyName}</Text>
          <Text style={{ color: C.dim }}>{activeStory.player.birthStatus} - {activeStory.player.bloodline} - {activeStory.player.sex} - {activeStory.player.origin}</Text>
          <Text style={{ color: C.dim }}>{activeStory.player.clothColor} {activeStory.player.clothing} - {activeStory.player.faceTrait}</Text>
          <Text style={{ color: C.dim }}>Gold: {activeStory.player.gold}</Text>
          {activeStory.player.birthStatus === "Bastard" ? <Text style={{ color: C.warning }}>Legitimacy Doubt: {activeStory.player.legitimacyDoubt}{activeStory.player.visibleBastardSigns ? " - appearance invites suspicion" : ""}</Text> : null}
          {activeStory.player.birthStatus === "Bastard" ? <Text style={{ color: C.dim }}>Support: {activeStory.player.legitimacySupport.noble}/{activeStory.player.legitimacySupport.requiredNoble} nobles or {activeStory.player.legitimacySupport.royal}/1 royals</Text> : null}
          <Stat label="Health" value={activeStory.player.health} />
          <Stat label="Happiness" value={activeStory.player.happiness} />
          <Stat label="Strength" value={activeStory.player.strength} />
          <Stat label="Honor" value={activeStory.player.honor} />
        </Card>
        <View style={styles.row}>
          <Button small label="Family Tree" onPress={() => setScreen("family")} />
          <Button small label="Relationships" onPress={() => setScreen("relationships")} />
          <Button small label="Possessions" onPress={() => setScreen("possessions")} />
          <Button small label="Daily Paper" onPress={() => setScreen("paper")} />
          {["Bastard", "Commoner"].includes(activeStory.player.birthStatus) ? <Button small label="Labour" onPress={labour} disabled={activeStory.finished || (activeStory.placeUses.labour ?? 0) >= activeStory.player.labourLimit} /> : null}
          {petitionReady(activeStory) ? <Button small label="Petition Legitimacy" onPress={petitionForLegitimacy} disabled={activeStory.finished} /> : null}
          <Button small label="Age Up" onPress={ageUp} disabled={activeStory.finished} />
        </View>
        <Card>
          <Text style={[styles.heading, { color: C.text }]}>Year {latest?.year}</Text>
          {latest?.lines.map((line, index) => <Text key={`${line}-${index}`} style={[styles.body, { color: C.text }]}>{line}</Text>)}
        </Card>
        <Card>
          <Text style={[styles.label, { color: C.dim }]}>Places</Text>
          <View style={styles.wrapRow}>
            {places.map((place) => {
              const used = activeStory.placeUses[place] ?? 0;
              return <Chip key={place} label={titleCase(place)} selected={false} disabled={used >= 3 || activeStory.finished} onPress={() => visit(place)} />;
            })}
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
      </Shell>
    );
  }

  if (screen === "possessions" && activeStory) {
    return (
      <Shell>
        <Text style={[styles.titleSmall, { color: C.text }]}>Gold And Possessions</Text>
        <Card>
          <Text style={[styles.heading, { color: C.text }]}>{activeStory.player.gold} Gold</Text>
          <Text style={[styles.subtitle, { color: C.dim }]}>Status, marriage, inheritance, gifts, and danger will change this over time.</Text>
        </Card>
        <Card>
          <Text style={[styles.heading, { color: C.text }]}>Possessions</Text>
          {activeStory.player.possessions.length === 0 ? <Text style={[styles.body, { color: C.text }]}>Nothing carried.</Text> : null}
          {activeStory.player.possessions.map((item) => (
            <View key={item} style={[styles.itemRow, { borderColor: C.line }]}>
              <Text style={[styles.body, styles.itemName, { color: C.text }]}>{titleCase(item)} - worth {activeStory.player.possessionValues[item] ?? 0} gold</Text>
              <View style={styles.wrapRow}>
                <Button small label="Sell" onPress={() => changePossession(item, "Sell")} />
                <Button small label="Abandon" onPress={() => changePossession(item, "Abandon")} />
              </View>
            </View>
          ))}
        </Card>
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
          spouseId: player.id
        })
      : null;
    const playerNode: Person = { id: player.id, firstName: player.firstName, familyName: player.familyName, sex: player.sex, age: player.age, birthStatus: player.birthStatus, bloodline: player.bloodline, relation: "You", parentIds: parents.map((parent) => parent.id), spouseId: spousePerson?.id, alive: player.alive };
    return (
      <Shell>
        <Text style={[styles.titleSmall, { color: C.text }]}>Family Tree</Text>
        <View style={styles.row}>
          <Button small label="Zoom -" onPress={() => setTreeZoom((zoom) => clamp(Number((zoom - 0.1).toFixed(1)), 0.7, 1.6))} />
          <Button small label={`${treeZoom.toFixed(1)}x`} onPress={() => undefined} disabled />
          <Button small label="Zoom +" onPress={() => setTreeZoom((zoom) => clamp(Number((zoom + 0.1).toFixed(1)), 0.7, 1.6))} />
        </View>
        <Text style={[styles.subtitle, { color: C.dim }]}>Drag or scroll sideways to move through the tree.</Text>
        <ScrollView horizontal style={[styles.treeViewport, { borderColor: C.line }]}>
          <View style={[styles.treeCanvas, { transform: [{ scale: treeZoom }] }]}>
            <Text style={[styles.treeSectionLabel, { color: C.dim }]}>Grandparents</Text>
            <View style={styles.treeRow}>{grandparents.map((person) => <TreeNode key={person.id} person={person} />)}</View>
            <Text style={[styles.treeLine, { color: C.dim }]}>|</Text>
            <Text style={[styles.treeSectionLabel, { color: C.dim }]}>Parents</Text>
            <View style={styles.treeRow}>
              {parents.map((person) => <TreeNode key={person.id} person={person} />)}
            </View>
            <View style={styles.treeSplitRow}>
              <View style={styles.treeBranch}>
                <Text style={[styles.treeLine, { color: C.dim }]}>|</Text>
                <Text style={[styles.treeSectionLabel, { color: C.dim }]}>You And Siblings</Text>
                <View style={styles.treeRow}>
                  <TreeNode person={playerNode} highlight />
                  {siblings.map((person) => <TreeNode key={person.id} person={person} />)}
                </View>
              </View>
              {auntUncles.length > 0 || cousins.length > 0 ? (
                <View style={styles.treeBranch}>
                  <Text style={[styles.treeLine, { color: C.dim }]}>|</Text>
                  <Text style={[styles.treeSectionLabel, { color: C.dim }]}>Aunts And Uncles</Text>
                  <View style={styles.treeRow}>{auntUncles.map((person) => <TreeNode key={person.id} person={person} />)}</View>
                  {cousins.length > 0 ? (
                    <>
                      <Text style={[styles.treeLine, { color: C.dim }]}>|</Text>
                      <Text style={[styles.treeSectionLabel, { color: C.dim }]}>Cousins</Text>
                      <View style={styles.treeRow}>{cousins.map((person) => <TreeNode key={person.id} person={person} />)}</View>
                    </>
                  ) : null}
                </View>
              ) : null}
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
    return (
      <View style={[styles.treeNode, { backgroundColor: highlight ? C.accent : C.panel, borderColor: highlight ? C.accent : C.line }]}>
        <Text style={[styles.treeNodeName, { color: "#fff" }]}>{person.firstName} {person.familyName}</Text>
        <Text style={{ color: highlight ? "#fff" : C.dim }}>{titleCase(person.relation)} - {person.sex} - age {person.age}</Text>
        <Text style={{ color: highlight ? "#fff" : C.dim }}>{person.birthStatus} - {person.bloodline}</Text>
        {royalLabel ? <Text style={{ color: C.gold, fontWeight: "800" }}>{royalLabel}</Text> : null}
        {married ? <Text style={{ color: highlight ? "#fff" : C.warning }}>{married}</Text> : null}
      </View>
    );
  }

  if (screen === "relationships" && activeStory) {
    return (
      <Shell>
        <View style={styles.rowBetween}>
          <Text style={[styles.titleSmall, { color: C.text }]}>Relationships</Text>
          <Button small label="Back" onPress={() => setScreen("chronicle")} />
        </View>
        {activeStory.relations.length === 0 ? <Text style={[styles.subtitle, { color: C.dim }]}>No relations yet. Visit places to meet people.</Text> : null}
        {activeStory.relations.map((relation) => (
          <Card key={relation.id}>
            <View style={styles.rowBetween}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.heading, { color: C.text }]}>{relation.firstName} {relation.familyName}</Text>
                <Text style={{ color: C.dim }}>{titleCase(relation.relation)} - {relation.sex} - age {relation.age} - {relation.birthStatus} - {relation.bloodline}</Text>
                {successionLabel(relation) ? <Text style={{ color: C.gold, fontWeight: "800" }}>{successionLabel(relation)}</Text> : null}
                {relation.spouseId ? <Text style={{ color: C.warning }}>{relation.spouseId === activeStory.player.id ? `Married to ${fullName(activeStory.player)} (you)` : `Married to ${nameById(relation.spouseId) ?? "someone"}`}</Text> : null}
                {!relation.spouseId && relation.age >= 14 ? <Text style={{ color: C.warning }}>Not married</Text> : null}
                {relation.isWard ? <Text style={{ color: C.warning }}>Ward - not romanceable</Text> : null}
                {!relation.alive ? <Text style={{ color: C.warning }}>Dead</Text> : null}
                <Text style={{ color: C.dim }}>{relation.note}</Text>
              </View>
            </View>
            <Stat label="Trust" value={relation.trust} />
            <Stat label="Romance" value={relation.romance} />
            {relation.memory.length > 0 ? <Text style={{ color: C.dim }}>Memory: {relation.memory[relation.memory.length - 1]}</Text> : null}
            {relation.allianceFormed ? (
              <View>
                <Text style={[styles.label, { color: C.dim }]}>Influence Target</Text>
                <View style={styles.wrapRow}>
                  {activeStory.relations
                    .filter((target) => target.id !== relation.id && target.alive)
                    .slice(0, 8)
                    .map((target) => (
                      <Chip
                        key={target.id}
                        label={fullName(target)}
                        selected={influenceTargets[relation.id] === target.id}
                        onPress={() => setInfluenceTargets((current) => ({ ...current, [relation.id]: target.id }))}
                      />
                    ))}
                </View>
              </View>
            ) : null}
            <View style={styles.wrapRow}>
              {availableRelationActions(activeStory, relation).map((action) => (
                <Chip key={action} label={action} selected={false} disabled={activeStory.finished || !relation.alive || (relation.actionUses[action] ?? 0) >= relation.actionLimit} onPress={() => interact(relation.id, action)} />
              ))}
            </View>
          </Card>
        ))}
        <Button label="Back" onPress={() => setScreen("chronicle")} />
      </Shell>
    );
  }

  if (screen === "load") {
    const active = stories.filter((story) => !story.finished && story.player.alive);
    return (
      <Shell>
        <Text style={[styles.titleSmall, { color: C.text }]}>Load Game</Text>
        {active.length === 0 ? <Text style={[styles.subtitle, { color: C.dim }]}>No living chronicles yet.</Text> : null}
        {active.map((story) => (
          <Card key={story.id}>
            <Text style={[styles.heading, { color: C.text }]}>{story.title}</Text>
            <Text style={{ color: C.dim }}>{story.player.firstName}, {story.player.sex}, age {story.player.age}, year {story.currentYear}</Text>
            <Button small label="Open" onPress={() => { setActiveStoryId(story.id); setScreen("chronicle"); }} />
          </Card>
        ))}
        <Button label="Back" onPress={() => setScreen("menu")} />
      </Shell>
    );
  }

  if (screen === "past") {
    const past = stories.filter((story) => story.finished);
    return (
      <Shell>
        <Text style={[styles.titleSmall, { color: C.text }]}>Past Games</Text>
        {past.length === 0 ? <Text style={[styles.subtitle, { color: C.dim }]}>No finished chronicles yet.</Text> : null}
        {past.map((story) => (
          <Card key={story.id}>
            <Text style={[styles.heading, { color: C.text }]}>{story.title}</Text>
            <Text style={[styles.body, { color: C.text }]}>{story.summary}</Text>
            <Button small label="Delete Report" onPress={() => removeStory(story.id)} />
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
  field: { gap: 6 },
  label: { fontSize: 13, letterSpacing: 2, textTransform: "uppercase" },
  input: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 12, fontSize: 16 },
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
  portrait: { width: 118, height: 154, borderWidth: 1, borderRadius: 8, padding: 10, alignItems: "center", justifyContent: "space-between" },
  portraitStage: { fontSize: 11, textTransform: "uppercase" },
  face: { width: 58, height: 58, borderRadius: 29, alignItems: "center", justifyContent: "center" },
  faceText: { color: "#fff", fontSize: 28, fontWeight: "800" },
  portraitName: { fontWeight: "700", fontSize: 16 },
  portraitDetail: { fontSize: 11, textAlign: "center" },
  stat: { marginTop: 4 },
  bar: { height: 8, borderRadius: 8, overflow: "hidden", marginTop: 5 },
  barFill: { height: "100%", borderRadius: 8 },
  treeViewport: { borderWidth: 1, borderRadius: 8, minHeight: 430 },
  treeCanvas: { width: 1380, minHeight: 410, alignItems: "center", justifyContent: "center", padding: 20 },
  treeRow: { flexDirection: "row", justifyContent: "center", gap: 16, marginVertical: 8 },
  treeSplitRow: { flexDirection: "row", justifyContent: "center", alignItems: "flex-start", gap: 46, marginTop: 4 },
  treeBranch: { alignItems: "center", maxWidth: 760 },
  treeLine: { fontSize: 30, textAlign: "center" },
  treeNode: { width: 220, borderWidth: 1, borderRadius: 8, padding: 12 },
  treeNodeName: { fontSize: 16, fontWeight: "800" },
  treeSectionLabel: { fontSize: 12, letterSpacing: 1.5, textTransform: "uppercase", marginTop: 4 },
  spouseBranch: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 4 },
  itemRow: { borderTopWidth: 1, paddingTop: 10, gap: 8, flexDirection: "row", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" },
  itemName: { flexShrink: 1, fontWeight: "800", minWidth: 180 },
  modalShade: { flex: 1, backgroundColor: "rgba(0, 0, 0, 0.62)", alignItems: "center", justifyContent: "center", padding: 20 },
  modalCard: { width: "100%", maxWidth: 420, borderWidth: 1, borderRadius: 8, padding: 16, gap: 10 }
});
