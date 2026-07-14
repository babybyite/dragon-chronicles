import type { Appearance, BirthStatus, Gender, Origin } from "./types.js";
import type { Rng } from "./rng.js";

export const firstNames: Record<Gender, string[]> = {
  female: ["Aelene", "Althaea", "Caelynn", "Enna", "Liora", "Meriele", "Shava", "Thia", "Vaessa", "Zesra", "Amelia", "Aurora", "Eliza", "Evelyn", "Isolde", "Juliette", "Lydia", "Rosalie", "Vivienne", "Mirelle"],
  male: ["Zorion", "Dezyr", "Aramil", "Erevan", "Faelar", "Galin", "Immeral", "Paelias", "Riardon", "Thamior", "Veldrin", "Ilvryn", "Velkyn", "Miron", "Dusan", "Cassian", "Dorian", "Elias", "Lucian", "Rowan"],
  nonbinary: ["Ash", "Veyr", "Ren", "Sol", "Kael", "Lior", "Sable", "Taryn", "Nyx", "Vesper", "Ari", "Riven"]
};

export const familyNames = [
  "Moonwhisper",
  "Silverfrond",
  "Blackwood",
  "Ashcroft",
  "Ravenshade",
  "Wintermere",
  "Hawthorne",
  "Thornfield",
  "Everhart",
  "Whitlock",
  "Valerian",
  "Storme",
  "Duskblade",
  "Embermere",
  "Crownfall",
  "Velorian"
];

export const dragonNames = [
  "Azharax",
  "Vaerith",
  "Nythrax",
  "Caldrith",
  "Zorathis",
  "Thalaxor",
  "Vyrmion",
  "Kryzareth",
  "Maelthor",
  "Saryth",
  "Velkrath",
  "Ignivar",
  "Rhazorth",
  "Xyraxis",
  "Drakhar",
  "Cindrath",
  "Oryndor",
  "Zephyrax",
  "Morvath",
  "Tiamor"
];

export const hairStyles = ["Short", "Long Straight", "Wavy", "Curly", "Braided", "Pixie", "Shaved", "Messy Bun"];
export const hairColors = ["Black", "Light Brown", "Dark Brown", "Blonde", "Platinum Blonde", "Ash White", "Ginger", "Dark Red"];
export const faceTraits = ["Freckles", "Scarred", "Mismatched Eyes", "Fire-Burned", "Vitiligo", "Half-Blind", "Sharp-Boned", "Glowing Eyes"];
export const nobleClothes = ["Decorated Gown", "Cloak with Hood", "Simple Dress", "Armor", "Decorated Suit", "Decorated Tunic"];
export const roughClothes = ["Simple Dress", "Dirty Rags", "Tunic", "Hooded Robe", "Travel Coat", "Patched Leathers"];
export const nobleColors = ["Scarlet", "Azure", "Violet", "Golden", "Silver", "Rose", "Steel Black", "Ivory"];
export const roughColors = ["Bloody Red", "Pitch Black", "Faded Brown", "Ash Grey", "Light Cream", "Clean Pastel"];

export const origins: Origin[] = ["northlands", "southern_isles", "eastern_courts", "western_marches", "steppe", "deep_cities"];
export const startAges = [0, 12, 16, 24] as const;
export const birthStatuses: BirthStatus[] = ["royal", "noble", "bastard", "commoner"];

export const bloodlineArchetypes = [
  { label: "Elder Flame", crest: "Dragon Crest", aura: "ancient firebound aura", dragonAffinity: 100 },
  { label: "Wolf-Crowned", crest: "Wolf Crest", aura: "hardy northern aura", dragonAffinity: 20 },
  { label: "Moon-Witch", crest: "Moon Crest", aura: "strange watchful aura", dragonAffinity: 45 },
  { label: "Common Blood", crest: "Plain Crest", aura: "quiet mortal aura", dragonAffinity: 0 }
] as const;

export function randomAppearance(rng: Rng, birthStatus: BirthStatus): Appearance {
  const wealthy = birthStatus === "royal" || birthStatus === "noble";
  return {
    hairStyle: rng.pick(hairStyles),
    hairColor: rng.pick(hairColors),
    faceTrait: rng.pick(faceTraits),
    clothing: rng.pick(wealthy ? nobleClothes : roughClothes),
    clothColor: rng.pick(wealthy ? nobleColors : roughColors)
  };
}

export function randomOrigin(rng: Rng): Origin {
  return rng.pick(origins);
}

export function crestForBloodlineName(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes("flame") || lower.includes("dragon") || lower.includes("ember")) return "Dragon Crest";
  if (lower.includes("wolf") || lower.includes("winter")) return "Wolf Crest";
  if (lower.includes("moon") || lower.includes("witch")) return "Moon Crest";
  return "Plain Crest";
}
