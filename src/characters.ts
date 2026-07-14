import type { Bloodline, Character, Gender, PoliticalRank, StatBlock, Trait, Year } from "./types.js";
import type { Rng } from "./rng.js";
import { clamp, id } from "./rng.js";

const givenNames: Record<Gender, string[]> = {
  female: ["Aelira", "Mira", "Selyse", "Nyra", "Vaella", "Corenna", "Lysa", "Maera"],
  male: ["Aeron", "Darian", "Rhaed", "Corvin", "Maelor", "Tavik", "Lucan", "Orys"],
  nonbinary: ["Ash", "Veyr", "Ren", "Sol", "Kael", "Lior", "Sable", "Taryn"]
};

const familyNames = ["Ashvane", "Stormcrown", "Drakeson", "Emberhall", "Nightglass", "Ironwyck", "Valewyrm", "Ravenmere"];
const mottos = ["Fire remembers", "The crown bends last", "Blood before banners", "From ash, dominion", "No oath unpriced", "Wings over winter"];
const sigils = ["silver dragon over red flame", "black tower beneath twin moons", "gold wyvern on white", "crimson sword in blue smoke", "green serpent around a crown"];

export const traitLibrary: Trait[] = [
  { id: "ambitious", label: "Ambitious", category: "personality" },
  { id: "honorable", label: "Honorable", category: "personality" },
  { id: "vengeful", label: "Vengeful", category: "personality" },
  { id: "silver_tongue", label: "Silver Tongue", category: "personality" },
  { id: "dragon_dreams", label: "Dragon Dreams", category: "dragon" },
  { id: "ember_blood", label: "Ember Blood", category: "bloodline" },
  { id: "frail", label: "Frail", category: "body" },
  { id: "scarred", label: "Scarred", category: "reputation" }
];

export function createStats(rng: Rng, bias: Partial<StatBlock> = {}): StatBlock {
  const stat = (key: keyof StatBlock) => clamp(rng.int(1, 10) + (bias[key] ?? 0), 1, 20);
  return {
    charm: stat("charm"),
    cunning: stat("cunning"),
    diplomacy: stat("diplomacy"),
    dragonAffinity: stat("dragonAffinity"),
    fertility: stat("fertility"),
    health: stat("health"),
    learning: stat("learning"),
    martial: stat("martial"),
    stewardship: stat("stewardship"),
    will: stat("will")
  };
}

export function createBloodline(rng: Rng, founderId?: string): Bloodline {
  const name = rng.pick(familyNames);
  const inheritedTraits = [rng.pick(traitLibrary.filter((trait) => trait.category === "bloodline" || trait.category === "dragon"))];
  return {
    id: id("bloodline", rng),
    name,
    motto: rng.pick(mottos),
    sigil: rng.pick(sigils),
    founderId,
    prestige: rng.int(5, 70),
    dragonBond: rng.int(0, 100),
    inheritedTraits,
    curse: rng.chance(0.18) ? rng.pick(["heirs dream of their own deaths", "fire answers anger first", "every third ruler is betrayed by kin"]) : undefined
  };
}

export function inheritTraits(rng: Rng, bloodline: Bloodline, parents: Character[] = []): Trait[] {
  const traits = new Map<string, Trait>();
  for (const trait of bloodline.inheritedTraits) {
    if (rng.chance(0.72)) traits.set(trait.id, trait);
  }
  for (const parent of parents) {
    for (const trait of parent.traits) {
      if (rng.chance(trait.category === "bloodline" ? 0.55 : 0.18)) traits.set(trait.id, trait);
    }
  }
  while (traits.size < 2 && rng.chance(0.6)) {
    const trait = rng.pick(traitLibrary);
    traits.set(trait.id, trait);
  }
  return [...traits.values()];
}

export type CreateCharacterInput = {
  year: Year;
  bloodline: Bloodline;
  parents?: Character[];
  gender?: Gender;
  rank?: PoliticalRank;
  familyName?: string;
};

export function createCharacter(rng: Rng, input: CreateCharacterInput): Character {
  const gender = input.gender ?? rng.pick<Gender>(["female", "male", "nonbinary"]);
  const traits = inheritTraits(rng.fork("traits"), input.bloodline, input.parents ?? []);
  return {
    id: id("char", rng),
    givenName: rng.pick(givenNames[gender]),
    familyName: input.familyName ?? input.bloodline.name,
    gender,
    bornYear: input.year,
    status: "alive",
    rank: input.rank ?? "courtier",
    bloodlineId: input.bloodline.id,
    parentIds: input.parents?.map((parent) => parent.id) ?? [],
    spouseIds: [],
    childrenIds: [],
    stats: createStats(rng.fork("stats"), { dragonAffinity: Math.floor(input.bloodline.dragonBond / 25) }),
    traits,
    portrait: {
      id: id("portrait", rng),
      characterId: undefined,
      kind: "placeholder",
      prompt: buildPortraitPrompt(input.bloodline.name, traits.map((trait) => trait.label)),
      tags: ["character", "portrait", input.bloodline.name.toLowerCase()]
    },
    inventoryIds: [],
    gold: rng.int(5, 250),
    secrets: rng.chance(0.25) ? [rng.pick(["hidden parentage", "forbidden love", "dragon egg theft", "secret cult oath"])] : []
  };
}

export function buildPortraitPrompt(familyName: string, traits: string[]): string {
  return `Original high-fantasy noble portrait, house ${familyName}, ${traits.join(", ")}, mobile game character art, no text.`;
}
