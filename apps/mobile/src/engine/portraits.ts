import type { AtlantisExpression, CharacterDNA, NaturalHairColor } from "./genetics";
import { rollAtlantisExpression } from "./genetics";

export type PortraitAgeStage = "age-00" | "age-12" | "age-16" | "age-24" | "age-30" | "age-50";
export type BirthStatus = "Royal" | "Noble" | "Bastard" | "Commoner";
export type RoyalTitle = "Ruling King" | "Ruling Queen";

export type VisibleInjury = {
  id: string;
  type: "scar" | "burn" | "blind-eye";
  placement: "left-eye" | "right-eye" | "left-cheek" | "right-cheek" | "forehead" | "jaw" | "neck" | "multiple";
  severity: 1 | 2 | 3;
  acquiredYear: number;
};

export type PortraitIdentity = {
  id: string;
  dna: CharacterDNA;
  baseVariant: number;
  hairStyle: string;
  hairColor: NaturalHairColor;
  clothingStyle: string;
  clothingColor: string;
  accessories: string[];
  injuries: VisibleInjury[];
  atlantisExpression: AtlantisExpression;
};

export type PortraitLayers = {
  stage: PortraitAgeStage;
  baseKey: string;
  clothingKey: string;
  hairKey?: string;
  faceTraitKeys: string[];
  accessoryKeys: string[];
  crownKey?: "royal-crown";
  glowOpacity: number;
  eyeOverride?: string;
  whiteHairStrand: boolean;
};

export function getPortraitAgeStage(age: number): PortraitAgeStage {
  if (age < 12) return "age-00";
  if (age < 16) return "age-12";
  if (age < 24) return "age-16";
  if (age < 30) return "age-24";
  if (age < 50) return "age-30";
  return "age-50";
}

export function getPortraitSocialTier(status: BirthStatus): "highborn" | "lowborn" {
  return status === "Royal" || status === "Noble" ? "highborn" : "lowborn";
}

export function canWearRulingCrown(title?: RoyalTitle): boolean {
  return title === "Ruling King" || title === "Ruling Queen";
}

export function createPortraitIdentity(input: {
  id: string;
  dna: CharacterDNA;
  baseVariant: number;
  hairStyle: string;
  hairColor: NaturalHairColor;
  clothingStyle: string;
  clothingColor: string;
  accessories?: string[];
  random?: () => number;
}): PortraitIdentity {
  return {
    id: input.id,
    dna: input.dna,
    baseVariant: input.baseVariant,
    hairStyle: input.hairStyle,
    hairColor: input.hairColor,
    clothingStyle: input.clothingStyle,
    clothingColor: input.clothingColor,
    accessories: input.accessories ?? [],
    injuries: [],
    atlantisExpression: rollAtlantisExpression(input.dna.bloodlineGenes.atlantis, input.hairColor, input.random)
  };
}

export function addVisibleInjury(identity: PortraitIdentity, injury: VisibleInjury): PortraitIdentity {
  if (identity.injuries.some((existing) => existing.id === injury.id)) return identity;
  return { ...identity, injuries: [...identity.injuries, injury] };
}

export function buildPortraitLayers(input: {
  identity: PortraitIdentity;
  age: number;
  birthStatus: BirthStatus;
  royalTitle?: RoyalTitle;
}): PortraitLayers {
  const { identity } = input;
  const stage = getPortraitAgeStage(input.age);
  const originKey = identity.dna.origin.toLowerCase().replace(/\s+/g, "-");
  const sexKey = identity.dna.sex.toLowerCase();
  const socialTier = getPortraitSocialTier(input.birthStatus);
  const hairKey = stage === "age-00" ? undefined : `${stage}/hair/${sexKey}/${identity.hairStyle}/${identity.hairColor}`;
  const injuryKeys = identity.injuries.map((injury) => `${stage}/injuries/${injury.type}/${injury.placement}/${injury.severity}`);
  const inheritedTraits = [
    identity.dna.freckles ? `${stage}/traits/freckles` : undefined,
    identity.dna.vitiligo ? `${stage}/traits/vitiligo` : undefined
  ].filter((value): value is string => Boolean(value));

  return {
    stage,
    baseKey: `${stage}/base/${sexKey}/${originKey}/variant-${String(identity.baseVariant).padStart(2, "0")}`,
    clothingKey: stage === "age-00"
      ? `${stage}/clothing/${socialTier}/swaddle`
      : `${stage}/clothing/${socialTier}/${identity.clothingStyle}/${identity.clothingColor}`,
    hairKey,
    faceTraitKeys: [...inheritedTraits, ...injuryKeys],
    accessoryKeys: identity.accessories.map((accessory) => `${stage}/accessories/${accessory}`),
    crownKey: canWearRulingCrown(input.royalTitle) ? "royal-crown" : undefined,
    glowOpacity: identity.atlantisExpression.glowOpacity,
    eyeOverride: identity.atlantisExpression.eyeOverride,
    whiteHairStrand: stage !== "age-00" && identity.atlantisExpression.whiteHairStrand
  };
}
