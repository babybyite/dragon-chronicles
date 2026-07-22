export type Origin = "Northlands" | "Eastern Courts" | "Western Marches" | "Steppe" | "Deep Cities";
export type Sex = "Female" | "Male";
export type FaceShape = "Oval" | "Square" | "Round" | "Heart" | "Diamond" | "Long" | "Wide";
export type JawShape = "Soft" | "Average" | "Strong" | "Very Strong";
export type NoseShape = "Straight" | "Roman" | "Button" | "Broad" | "Hooked" | "Upturned";
export type EyeShape = "Round" | "Almond" | "Narrow" | "Deep Set" | "Large" | "Sharp";
export type EyebrowShape = "Straight" | "Arched" | "Heavy" | "Thin";
export type LipShape = "Thin" | "Average" | "Full";
export type HairTexture = "Straight" | "Wavy" | "Curly" | "Coily";
export type HairThickness = "Fine" | "Normal" | "Thick";
export type NaturalHairColor = "Black" | "Brown" | "Blonde" | "Platinum Blonde" | "Ash White" | "Ginger" | "Dark Red";
export type EyeColor = "Brown" | "Hazel" | "Green" | "Blue" | "Grey" | "Amber" | "Light Purple";
export type BodyBuild = "Slim" | "Athletic" | "Heavy" | "Muscular";

export type BloodlineGenes = {
  witch: number;
  wolf: number;
  common: number;
};

export type CharacterDNA = {
  origin: Origin;
  sex: Sex;
  faceShape: FaceShape;
  jaw: JawShape;
  nose: NoseShape;
  eyes: EyeShape;
  eyebrows: EyebrowShape;
  lips: LipShape;
  skinTone: number;
  hairTexture: HairTexture;
  hairThickness: HairThickness;
  naturalHairColor: NaturalHairColor;
  naturalEyeColor: EyeColor;
  heightCm: number;
  build: BodyBuild;
  freckles: boolean;
  vitiligo: boolean;
  bloodlineGenes: BloodlineGenes;
  familySignatureIds: string[];
};

const clampPercent = (value: number): number => Math.max(0, Math.min(100, Math.round(value)));
const mixNumber = (a: number, b: number, variation: number, random: () => number): number =>
  Math.round((a + b) / 2 + (random() * 2 - 1) * variation);

export function normalizeBloodlineGenes(input: Partial<BloodlineGenes>): BloodlineGenes {
  const raw: BloodlineGenes = {
    witch: Math.max(0, input.witch ?? 0),
    wolf: Math.max(0, input.wolf ?? 0),
    common: Math.max(0, input.common ?? 0)
  };
  const total = raw.witch + raw.wolf + raw.common;
  if (total <= 0) return { witch: 0, wolf: 0, common: 100 };
  return {
    witch: clampPercent((raw.witch / total) * 100),
    wolf: clampPercent((raw.wolf / total) * 100),
    common: clampPercent((raw.common / total) * 100)
  };
}

export function inheritBloodlineGenes(mother: BloodlineGenes, father: BloodlineGenes): BloodlineGenes {
  return normalizeBloodlineGenes({
    witch: (mother.witch + father.witch) / 2,
    wolf: (mother.wolf + father.wolf) / 2,
    common: (mother.common + father.common) / 2
  });
}

export function inheritDNA(mother: CharacterDNA, father: CharacterDNA, random: () => number = Math.random): CharacterDNA {
  const inherit = <T>(a: T, b: T): T => (random() < 0.5 ? a : b);
  const rareMutation = (chance = 0.05): boolean => random() < chance;
  const origin = inherit(mother.origin, father.origin);
  return {
    origin,
    sex: random() < 0.5 ? "Female" : "Male",
    faceShape: inherit(mother.faceShape, father.faceShape),
    jaw: inherit(mother.jaw, father.jaw),
    nose: inherit(mother.nose, father.nose),
    eyes: inherit(mother.eyes, father.eyes),
    eyebrows: inherit(mother.eyebrows, father.eyebrows),
    lips: inherit(mother.lips, father.lips),
    skinTone: Math.max(1, Math.min(5, mixNumber(mother.skinTone, father.skinTone, 1, random))),
    hairTexture: inherit(mother.hairTexture, father.hairTexture),
    hairThickness: inherit(mother.hairThickness, father.hairThickness),
    naturalHairColor: inherit(mother.naturalHairColor, father.naturalHairColor),
    naturalEyeColor: inherit(mother.naturalEyeColor, father.naturalEyeColor),
    heightCm: Math.max(145, Math.min(215, mixNumber(mother.heightCm, father.heightCm, 7, random))),
    build: inherit(mother.build, father.build),
    freckles: inherit(mother.freckles, father.freckles) || rareMutation(0.03),
    vitiligo: inherit(mother.vitiligo, father.vitiligo) || rareMutation(0.01),
    bloodlineGenes: inheritBloodlineGenes(mother.bloodlineGenes, father.bloodlineGenes),
    familySignatureIds: Array.from(new Set([...mother.familySignatureIds, ...father.familySignatureIds])).filter(() => random() < 0.5)
  };
}
