import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";

type PortraitAge = 0 | 12 | 16 | 24 | 30 | 50;
type HairColor = "Black" | "Brown" | "Dirty Blonde" | "Platinum Blonde" | "Ash White" | "Ginger" | "Deep Red";
type HairStyle = "Messy" | "Tiny Braid" | "Neat" | "Hair Clip" | "Baby Fringe";
type Origin = "Northlands" | "Eastern Courts" | "Western Marches" | "Steppe" | "Deep Cities";

type NormalizedRect = { x: number; y: number; width: number; height: number };
type Profile = {
  headBounds: NormalizedRect;
  eyeLineY: number;
  chinLineY: number;
  shoulderLineY: number;
  waistLineY: number;
  crop: "full_baby" | "head_to_waist";
};

const CANVAS_WIDTH = 250;
const CANVAS_HEIGHT = 350;

const PROFILES: Record<PortraitAge, Profile> = {
  0: { headBounds: { x: 0.25, y: 0.12, width: 0.5, height: 0.26 }, eyeLineY: 0.235, chinLineY: 0.37, shoulderLineY: 0.43, waistLineY: 0.78, crop: "full_baby" },
  12: { headBounds: { x: 0.28, y: 0.07, width: 0.44, height: 0.25 }, eyeLineY: 0.18, chinLineY: 0.305, shoulderLineY: 0.37, waistLineY: 0.92, crop: "head_to_waist" },
  16: { headBounds: { x: 0.3, y: 0.06, width: 0.4, height: 0.245 }, eyeLineY: 0.17, chinLineY: 0.295, shoulderLineY: 0.365, waistLineY: 0.94, crop: "head_to_waist" },
  24: { headBounds: { x: 0.3, y: 0.06, width: 0.4, height: 0.245 }, eyeLineY: 0.17, chinLineY: 0.295, shoulderLineY: 0.365, waistLineY: 0.94, crop: "head_to_waist" },
  30: { headBounds: { x: 0.3, y: 0.055, width: 0.4, height: 0.245 }, eyeLineY: 0.165, chinLineY: 0.29, shoulderLineY: 0.36, waistLineY: 0.94, crop: "head_to_waist" },
  50: { headBounds: { x: 0.3, y: 0.055, width: 0.4, height: 0.245 }, eyeLineY: 0.165, chinLineY: 0.29, shoulderLineY: 0.36, waistLineY: 0.94, crop: "head_to_waist" }
};

const HAIR_COLORS: Record<HairColor, string> = {
  Black: "#211d1b",
  Brown: "#5b3c2a",
  "Dirty Blonde": "#a38b67",
  "Platinum Blonde": "#e6d8bf",
  "Ash White": "#d8d5cf",
  Ginger: "#b75928",
  "Deep Red": "#702622"
};

const SKIN_BY_ORIGIN: Record<Origin, string> = {
  Northlands: "#ead0b1",
  "Eastern Courts": "#d8b18b",
  "Western Marches": "#bb8962",
  Steppe: "#74482f",
  "Deep Cities": "#ead7c8"
};

const ages: PortraitAge[] = [0, 12, 16, 24, 30, 50];
const origins = Object.keys(SKIN_BY_ORIGIN) as Origin[];
const hairColors = Object.keys(HAIR_COLORS) as HairColor[];
const hairStyles: HairStyle[] = ["Messy", "Tiny Braid", "Neat", "Hair Clip", "Baby Fringe"];

function ChoiceRow<T extends string | number>({ label, values, value, onChange }: { label: string; values: readonly T[]; value: T; onChange: (next: T) => void }) {
  return (
    <View style={styles.controlGroup}>
      <Text style={styles.controlLabel}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.choiceRow}>
        {values.map((item) => (
          <Pressable key={String(item)} onPress={() => onChange(item)} style={[styles.choice, item === value && styles.choiceActive]}>
            <Text style={[styles.choiceText, item === value && styles.choiceTextActive]}>{item}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

function GuideLine({ y, label }: { y: number; label: string }) {
  return (
    <View style={[styles.guideLine, { top: y * CANVAS_HEIGHT }]}>
      <Text style={styles.guideLabel}>{label}</Text>
    </View>
  );
}

function PlaceholderPortrait({ age, origin, hairColor, hairStyle, guides }: { age: PortraitAge; origin: Origin; hairColor: HairColor; hairStyle: HairStyle; guides: boolean }) {
  const profile = PROFILES[age];
  const head = profile.headBounds;
  const skin = SKIN_BY_ORIGIN[origin];
  const hair = HAIR_COLORS[hairColor];
  const headWidth = head.width * CANVAS_WIDTH;
  const headHeight = head.height * CANVAS_HEIGHT;
  const isBaby = age === 0;
  const torsoTop = profile.shoulderLineY * CANVAS_HEIGHT;
  const torsoBottom = profile.waistLineY * CANVAS_HEIGHT;
  const torsoHeight = torsoBottom - torsoTop;
  const torsoWidth = isBaby ? 148 : age === 12 ? 140 : 154;

  const hairShape = useMemo(() => {
    if (isBaby) return { height: headHeight * 0.36, top: head.y * CANVAS_HEIGHT - 2, radius: 26 };
    if (hairStyle === "Messy") return { height: headHeight * 0.52, top: head.y * CANVAS_HEIGHT - 10, radius: 22 };
    if (hairStyle === "Tiny Braid") return { height: headHeight * 0.45, top: head.y * CANVAS_HEIGHT - 5, radius: 28 };
    if (hairStyle === "Neat") return { height: headHeight * 0.4, top: head.y * CANVAS_HEIGHT - 2, radius: 34 };
    if (hairStyle === "Hair Clip") return { height: headHeight * 0.43, top: head.y * CANVAS_HEIGHT - 4, radius: 30 };
    return { height: headHeight * 0.48, top: head.y * CANVAS_HEIGHT - 4, radius: 26 };
  }, [hairStyle, head.y, headHeight, isBaby]);

  return (
    <View style={styles.canvas}>
      <View style={[styles.torso, { backgroundColor: skin, top: torsoTop, height: torsoHeight, width: torsoWidth, left: (CANVAS_WIDTH - torsoWidth) / 2, borderTopLeftRadius: isBaby ? 55 : 44, borderTopRightRadius: isBaby ? 55 : 44 }]} />
      <View style={[styles.baseTunic, { top: torsoTop + (isBaby ? 35 : 47), height: Math.max(70, torsoHeight - (isBaby ? 35 : 47)), width: torsoWidth + (isBaby ? 2 : 8), left: (CANVAS_WIDTH - torsoWidth - (isBaby ? 2 : 8)) / 2 }]} />
      {isBaby && <>
        <View style={[styles.arm, { backgroundColor: skin, left: 34, top: torsoTop + 38, transform: [{ rotate: "8deg" }] }]} />
        <View style={[styles.arm, { backgroundColor: skin, right: 34, top: torsoTop + 38, transform: [{ rotate: "-8deg" }] }]} />
      </>}
      <View style={[styles.neck, { backgroundColor: skin, top: head.y * CANVAS_HEIGHT + headHeight - 8, left: CANVAS_WIDTH / 2 - (isBaby ? 18 : 15), width: isBaby ? 36 : 30, height: isBaby ? 25 : 39 }]} />
      <View style={[styles.head, { backgroundColor: skin, left: head.x * CANVAS_WIDTH, top: head.y * CANVAS_HEIGHT, width: headWidth, height: headHeight, borderRadius: headWidth / 2 }]}>
        <View style={[styles.eye, { left: headWidth * 0.28, top: headHeight * 0.43 }]} />
        <View style={[styles.eye, { right: headWidth * 0.28, top: headHeight * 0.43 }]} />
        <View style={[styles.nose, { left: headWidth * 0.48, top: headHeight * 0.49 }]} />
        <View style={[styles.mouth, { left: headWidth * 0.37, top: headHeight * 0.69, width: headWidth * 0.26 }]} />
      </View>
      <View style={[styles.hairMass, { backgroundColor: hair, left: head.x * CANVAS_WIDTH - (isBaby ? 0 : 4), top: hairShape.top, width: headWidth + (isBaby ? 0 : 8), height: hairShape.height, borderTopLeftRadius: hairShape.radius, borderTopRightRadius: hairShape.radius, borderBottomLeftRadius: hairStyle === "Neat" ? 16 : 28, borderBottomRightRadius: hairStyle === "Neat" ? 16 : 28 }]} />
      {hairStyle === "Tiny Braid" && !isBaby && <View style={[styles.braid, { backgroundColor: hair, left: head.x * CANVAS_WIDTH - 2, top: head.y * CANVAS_HEIGHT + 25 }]} />}
      {hairStyle === "Hair Clip" && !isBaby && <View style={[styles.clip, { left: head.x * CANVAS_WIDTH + headWidth - 24, top: head.y * CANVAS_HEIGHT + 27 }]} />}
      {hairStyle === "Baby Fringe" && <View style={[styles.fringe, { backgroundColor: hair, left: head.x * CANVAS_WIDTH + headWidth * 0.2, top: head.y * CANVAS_HEIGHT + 9, width: headWidth * 0.6 }]} />}
      {guides && <>
        <View style={[styles.headGuide, { left: head.x * CANVAS_WIDTH, top: head.y * CANVAS_HEIGHT, width: headWidth, height: headHeight }]} />
        <GuideLine y={profile.eyeLineY} label="eyes" />
        <GuideLine y={profile.chinLineY} label="chin" />
        <GuideLine y={profile.shoulderLineY} label="shoulders" />
        <GuideLine y={profile.waistLineY} label="waist" />
      </>}
    </View>
  );
}

export default function PortraitCreatorScreen() {
  const [age, setAge] = useState<PortraitAge>(24);
  const [origin, setOrigin] = useState<Origin>("Deep Cities");
  const [hairColor, setHairColor] = useState<HairColor>("Black");
  const [hairStyle, setHairStyle] = useState<HairStyle>("Messy");
  const [guides, setGuides] = useState(true);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.eyebrow}>DEVELOPER PORTRAIT LAB</Text>
      <Text style={styles.title}>Female portrait creator</Text>
      <Text style={styles.subtitle}>Locked 250 × 350 px canvas, exact 5:7 ratio. Ages 16 and 24 use identical geometry.</Text>

      <View style={styles.previewWrap}>
        <PlaceholderPortrait age={age} origin={origin} hairColor={hairColor} hairStyle={hairStyle} guides={guides} />
      </View>

      <View style={styles.guideToggle}>
        <View style={styles.toggleTextWrap}>
          <Text style={styles.toggleTitle}>Alignment guides</Text>
          <Text style={styles.toggleCopy}>Shows locked skull, eye, chin, shoulder and waist anchors.</Text>
        </View>
        <Switch value={guides} onValueChange={setGuides} />
      </View>

      <ChoiceRow label="Age" values={ages} value={age} onChange={setAge} />
      <ChoiceRow label="Origin" values={origins} value={origin} onChange={setOrigin} />
      <ChoiceRow label="Hair style" values={hairStyles} value={hairStyle} onChange={setHairStyle} />
      <ChoiceRow label="Hair colour" values={hairColors} value={hairColor} onChange={setHairColor} />

      <View style={styles.specBox}>
        <Text style={styles.specTitle}>Current asset contract</Text>
        <Text style={styles.specLine}>• Transparent PNG layers must be exactly 250 × 350 px.</Text>
        <Text style={styles.specLine}>• No per-item nudging after export.</Text>
        <Text style={styles.specLine}>• Age 0 uses baby proportions and visible hands.</Text>
        <Text style={styles.specLine}>• Ages 16/24 share the same canvas anchors.</Text>
        <Text style={styles.specLine}>• Final art replaces these placeholders without changing geometry.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f7f0e5" },
  content: { paddingHorizontal: 18, paddingTop: 28, paddingBottom: 70 },
  eyebrow: { fontSize: 12, letterSpacing: 2, color: "#8b735b", textAlign: "center", fontWeight: "700" },
  title: { marginTop: 7, fontSize: 28, color: "#342c27", textAlign: "center", fontWeight: "600" },
  subtitle: { marginTop: 8, fontSize: 14, lineHeight: 20, color: "#74685f", textAlign: "center" },
  previewWrap: { alignItems: "center", marginVertical: 22 },
  canvas: { width: CANVAS_WIDTH, height: CANVAS_HEIGHT, overflow: "hidden", backgroundColor: "#efe6d9", borderWidth: 1, borderColor: "#c8b9a4", position: "relative" },
  torso: { position: "absolute" },
  baseTunic: { position: "absolute", backgroundColor: "rgba(235,226,210,0.96)", borderTopLeftRadius: 18, borderTopRightRadius: 18 },
  neck: { position: "absolute", borderRadius: 12 },
  head: { position: "absolute", zIndex: 4, borderWidth: 1, borderColor: "rgba(80,60,45,0.12)" },
  eye: { position: "absolute", width: 8, height: 5, borderRadius: 5, backgroundColor: "#4b453f" },
  nose: { position: "absolute", width: 3, height: 12, borderRadius: 3, backgroundColor: "rgba(112,79,60,0.3)" },
  mouth: { position: "absolute", height: 3, borderRadius: 3, backgroundColor: "#9a6556" },
  hairMass: { position: "absolute", zIndex: 5, opacity: 0.92 },
  braid: { position: "absolute", zIndex: 6, width: 13, height: 68, borderRadius: 8, transform: [{ rotate: "7deg" }] },
  clip: { position: "absolute", zIndex: 7, width: 18, height: 6, borderRadius: 4, backgroundColor: "#c4a45c", transform: [{ rotate: "-18deg" }] },
  fringe: { position: "absolute", zIndex: 7, height: 18, borderBottomLeftRadius: 14, borderBottomRightRadius: 14 },
  arm: { position: "absolute", zIndex: 2, width: 31, height: 102, borderRadius: 18 },
  guideLine: { position: "absolute", zIndex: 20, left: 0, right: 0, height: 1, backgroundColor: "rgba(166,52,52,0.82)" },
  guideLabel: { position: "absolute", right: 3, top: -14, fontSize: 9, color: "#9b3535", backgroundColor: "rgba(247,240,229,0.9)", paddingHorizontal: 3 },
  headGuide: { position: "absolute", zIndex: 20, borderWidth: 1, borderColor: "rgba(48,91,140,0.9)", borderStyle: "dashed", borderRadius: 50 },
  guideToggle: { flexDirection: "row", gap: 12, alignItems: "center", justifyContent: "space-between", padding: 14, borderRadius: 16, borderWidth: 1, borderColor: "#d4c5b1", backgroundColor: "#fffaf2" },
  toggleTextWrap: { flex: 1 },
  toggleTitle: { fontSize: 16, color: "#3b322c", fontWeight: "600" },
  toggleCopy: { marginTop: 2, fontSize: 12, color: "#7e7167", lineHeight: 17 },
  controlGroup: { marginTop: 18 },
  controlLabel: { marginBottom: 8, fontSize: 14, color: "#4c4037", fontWeight: "600" },
  choiceRow: { gap: 8, paddingRight: 18 },
  choice: { paddingHorizontal: 13, paddingVertical: 9, borderRadius: 999, borderWidth: 1, borderColor: "#cdbca6", backgroundColor: "#fffaf2" },
  choiceActive: { backgroundColor: "#5f5145", borderColor: "#5f5145" },
  choiceText: { color: "#64574d", fontSize: 13 },
  choiceTextActive: { color: "#fffaf2" },
  specBox: { marginTop: 24, padding: 16, borderRadius: 16, backgroundColor: "#e9e2d5", borderWidth: 1, borderColor: "#cdbda7" },
  specTitle: { fontSize: 16, color: "#3f352e", fontWeight: "600", marginBottom: 8 },
  specLine: { fontSize: 13, lineHeight: 20, color: "#6d5f55" }
});
