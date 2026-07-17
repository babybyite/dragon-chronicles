import type { Gender, Id, Origin } from "./types.js";

export const PORTRAIT_CANVAS = {
  width: 250,
  height: 350,
  aspectRatio: 5 / 7,
  physicalWidthCm: 2.5,
  physicalHeightCm: 3.5
} as const;

export type PortraitAge = 0 | 12 | 16 | 24 | 30 | 50;
export type PortraitAgeAssetGroup = "age_0" | "age_12" | "age_16_24" | "age_30" | "age_50";

export type PortraitLayerKind =
  | "base"
  | "skin_detail"
  | "eyes"
  | "eyebrows"
  | "hair_back"
  | "clothing"
  | "hair_front"
  | "accessory";

export type HairColorId =
  | "black"
  | "brown"
  | "dirty_blonde"
  | "platinum_blonde"
  | "ash_white"
  | "ginger"
  | "deep_red";

export const HAIR_COLOR_PRESETS: Record<HairColorId, string> = {
  black: "#211D1B",
  brown: "#5B3C2A",
  dirty_blonde: "#A38B67",
  platinum_blonde: "#E6D8BF",
  ash_white: "#D8D5CF",
  ginger: "#B75928",
  deep_red: "#702622"
};

export type NormalizedRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type FemalePortraitProportionProfile = {
  age: PortraitAge;
  assetGroup: PortraitAgeAssetGroup;
  crop: "full_baby" | "head_to_waist";
  headBounds: NormalizedRect;
  eyeLineY: number;
  chinLineY: number;
  shoulderLineY: number;
  waistLineY: number;
  notes: string;
};

/**
 * Locked female portrait framing based on the approved reference sheet.
 * Every asset is authored on the same 250 x 350 canvas and must preserve
 * these anchor lines so layers can be exchanged without per-item nudging.
 */
export const FEMALE_PORTRAIT_PROFILES: Record<PortraitAge, FemalePortraitProportionProfile> = {
  0: {
    age: 0,
    assetGroup: "age_0",
    crop: "full_baby",
    headBounds: { x: 0.25, y: 0.12, width: 0.5, height: 0.26 },
    eyeLineY: 0.235,
    chinLineY: 0.37,
    shoulderLineY: 0.43,
    waistLineY: 0.78,
    notes: "Large infant head, short neck, full upper body and hands visible; sparse baby hair must follow the smaller skull contour."
  },
  12: {
    age: 12,
    assetGroup: "age_12",
    crop: "head_to_waist",
    headBounds: { x: 0.28, y: 0.07, width: 0.44, height: 0.25 },
    eyeLineY: 0.18,
    chinLineY: 0.305,
    shoulderLineY: 0.37,
    waistLineY: 0.92,
    notes: "Child proportions with a slightly larger head, narrow shoulders and long visible torso to the natural waist."
  },
  16: {
    age: 16,
    assetGroup: "age_16_24",
    crop: "head_to_waist",
    headBounds: { x: 0.3, y: 0.06, width: 0.4, height: 0.245 },
    eyeLineY: 0.17,
    chinLineY: 0.295,
    shoulderLineY: 0.365,
    waistLineY: 0.94,
    notes: "Teen frame; shares the exact layer geometry with age 24 so one asset set can serve both ages."
  },
  24: {
    age: 24,
    assetGroup: "age_16_24",
    crop: "head_to_waist",
    headBounds: { x: 0.3, y: 0.06, width: 0.4, height: 0.245 },
    eyeLineY: 0.17,
    chinLineY: 0.295,
    shoulderLineY: 0.365,
    waistLineY: 0.94,
    notes: "Young adult frame using the same head, neck and shoulder anchors as age 16."
  },
  30: {
    age: 30,
    assetGroup: "age_30",
    crop: "head_to_waist",
    headBounds: { x: 0.3, y: 0.055, width: 0.4, height: 0.245 },
    eyeLineY: 0.165,
    chinLineY: 0.29,
    shoulderLineY: 0.36,
    waistLineY: 0.94,
    notes: "Adult frame; same overall crop, with mature facial detail contained inside the unchanged head silhouette."
  },
  50: {
    age: 50,
    assetGroup: "age_50",
    crop: "head_to_waist",
    headBounds: { x: 0.3, y: 0.055, width: 0.4, height: 0.245 },
    eyeLineY: 0.165,
    chinLineY: 0.29,
    shoulderLineY: 0.36,
    waistLineY: 0.94,
    notes: "Mature frame; ageing changes texture and features, not the canvas anchors or body placement."
  }
};

export type PortraitLayerAsset = {
  id: Id;
  kind: PortraitLayerKind;
  assetKey: string;
  ageGroups: PortraitAgeAssetGroup[];
  genders: Gender[];
  origins?: Origin[];
  tintable?: boolean;
  tags: string[];
  zIndex?: number;
};

export type LayeredPortraitConfig = {
  gender: Gender;
  origin: Origin;
  age: PortraitAge;
  baseId: Id;
  skinDetailId?: Id;
  eyesId?: Id;
  eyebrowsId?: Id;
  hairBackId?: Id;
  clothingId?: Id;
  hairFrontId?: Id;
  accessoryIds: Id[];
  hairColor?: HairColorId;
};

export type ResolvedPortraitLayer = PortraitLayerAsset & {
  tint?: string;
  resolvedZIndex: number;
};

const DEFAULT_Z_INDEX: Record<PortraitLayerKind, number> = {
  base: 0,
  skin_detail: 10,
  eyes: 20,
  eyebrows: 30,
  hair_back: 40,
  clothing: 50,
  hair_front: 60,
  accessory: 70
};

export function portraitAgeAssetGroup(age: PortraitAge): PortraitAgeAssetGroup {
  if (age === 0) return "age_0";
  if (age === 12) return "age_12";
  if (age === 16 || age === 24) return "age_16_24";
  if (age === 30) return "age_30";
  return "age_50";
}

export function femalePortraitProfile(age: PortraitAge): FemalePortraitProportionProfile {
  return FEMALE_PORTRAIT_PROFILES[age];
}

export function isLayerCompatible(asset: PortraitLayerAsset, config: LayeredPortraitConfig): boolean {
  const ageGroup = portraitAgeAssetGroup(config.age);
  const genderMatches = asset.genders.includes(config.gender);
  const ageMatches = asset.ageGroups.includes(ageGroup);
  const originMatches = !asset.origins || asset.origins.length === 0 || asset.origins.includes(config.origin);
  return genderMatches && ageMatches && originMatches;
}

export function resolvePortraitLayers(
  config: LayeredPortraitConfig,
  assets: Record<Id, PortraitLayerAsset>
): ResolvedPortraitLayer[] {
  const requestedIds = [
    config.baseId,
    config.skinDetailId,
    config.eyesId,
    config.eyebrowsId,
    config.hairBackId,
    config.clothingId,
    config.hairFrontId,
    ...config.accessoryIds
  ].filter((id): id is Id => Boolean(id));

  const missing = requestedIds.filter((id) => !assets[id]);
  if (missing.length > 0) {
    throw new Error(`Unknown portrait layer assets: ${missing.join(", ")}`);
  }

  const incompatible = requestedIds
    .map((id) => assets[id])
    .filter((asset) => !isLayerCompatible(asset, config));
  if (incompatible.length > 0) {
    throw new Error(`Incompatible portrait layer assets: ${incompatible.map((asset) => asset.id).join(", ")}`);
  }

  const tint = config.hairColor ? HAIR_COLOR_PRESETS[config.hairColor] : undefined;

  return requestedIds
    .map((id) => assets[id])
    .map((asset) => ({
      ...asset,
      tint: asset.tintable && (asset.kind === "hair_back" || asset.kind === "hair_front") ? tint : undefined,
      resolvedZIndex: asset.zIndex ?? DEFAULT_Z_INDEX[asset.kind]
    }))
    .sort((a, b) => a.resolvedZIndex - b.resolvedZIndex);
}

export function validateFemalePortraitAssetDimensions(width: number, height: number): string[] {
  const errors: string[] = [];
  if (width !== PORTRAIT_CANVAS.width || height !== PORTRAIT_CANVAS.height) {
    errors.push(
      `Portrait layers must be exactly ${PORTRAIT_CANVAS.width}x${PORTRAIT_CANVAS.height}px (2.5 x 3.5 cm ratio); received ${width}x${height}px.`
    );
  }
  if (Math.abs(width / height - PORTRAIT_CANVAS.aspectRatio) > 0.0001) {
    errors.push("Portrait layer aspect ratio must be exactly 5:7.");
  }
  return errors;
}
