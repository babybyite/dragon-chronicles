import React, { useMemo, useState } from "react";
import {
  ImageBackground,
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
type Screen = "menu" | "builder1" | "builder2" | "chronicle" | "load" | "past" | "settings";
type BirthStatus = "Royal" | "Noble" | "Bastard" | "Commoner";

type CharacterDraft = {
  firstName: string;
  familyName: string;
  sex: "Female" | "Male";
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

type Story = {
  id: string;
  title: string;
  player: CharacterDraft & {
    age: number;
    alive: boolean;
    health: number;
    happiness: number;
    strength: number;
    honor: number;
    dragon?: string;
    causeOfDeath?: string;
  };
  currentYear: number;
  yearLog: { year: number; lines: string[] }[];
  milestones: { id: string; title: string; year: number }[];
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
    good: "#9fb29b"
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
    good: "#9aad92"
  }
};

const menuBackgrounds = {
  dark: require("./assets/backgrounds/main-menu-dark.png"),
  pastel: require("./assets/backgrounds/main-menu-pastel.png")
};

const firstNames = ["Aelira", "Mirelle", "Vaessa", "Rowan", "Lucian", "Dorian", "Veyr", "Sable"];
const familyNames = ["Duskblade", "Ashcroft", "Ravenshade", "Embermere", "Wintermere", "Crownfall"];
const bloodlines = ["Elder Flame", "Wolf-Crowned", "Moon-Witch", "Common Blood"];
const origins = ["Northlands", "Southern Isles", "Eastern Courts", "Western Marches", "Steppe", "Deep Cities"];
const hairStyles = ["Short", "Long Straight", "Wavy", "Curly", "Braided", "Pixie", "Shaved", "Messy Bun"];
const hairColors = ["Black", "Light Brown", "Dark Brown", "Blonde", "Platinum Blonde", "Ash White", "Ginger", "Dark Red"];
const faceTraits = ["Freckles", "Scarred", "Mismatched Eyes", "Fire-Burned", "Vitiligo", "Half-Blind", "Sharp-Boned", "Glowing Eyes"];
const clothes = ["Decorated Gown", "Cloak with Hood", "Armor", "Decorated Suit", "Decorated Tunic", "Hooded Robe"];
const clothColors = ["Scarlet", "Azure", "Violet", "Golden", "Silver", "Rose", "Steel Black", "Ivory"];

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
  clothing: "Decorated Tunic",
  clothColor: "Scarlet"
};

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

function pick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("menu");
  const [themeName, setThemeName] = useState<ThemeName>("dark");
  const [draft, setDraft] = useState<CharacterDraft>(initialDraft);
  const [stories, setStories] = useState<Story[]>([]);
  const [activeStoryId, setActiveStoryId] = useState<string | null>(null);
  const C = themes[themeName];
  const activeStory = useMemo(() => stories.find((story) => story.id === activeStoryId) ?? null, [activeStoryId, stories]);

  function patchDraft(next: Partial<CharacterDraft>) {
    setDraft((current) => ({ ...current, ...next }));
  }

  function startStory() {
    const player = {
      ...draft,
      firstName: draft.firstName.trim() || pick(firstNames),
      familyName: draft.familyName.trim() || pick(familyNames),
      age: draft.startAge,
      alive: true,
      health: 70,
      happiness: 55,
      strength: 55,
      honor: 50
    };
    const story: Story = {
      id: uid(),
      title: `${player.familyName} Chronicle`,
      player,
      currentYear: player.age,
      yearLog: [
        {
          year: player.age,
          lines: [`${player.firstName} ${player.familyName} began this year beneath a sky heavy with omen and promise.`]
        }
      ],
      milestones: [],
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
    if (!activeStory) return;
    const name = activeStory.player.firstName;
    const lines: Record<string, string> = {
      Market: `${name} wandered the market and left with a whisper, a rumor, and lighter coin.`,
      Tavern: `${name} drank among loose tongues, and someone spoke more than they meant to.`,
      Forest: `${name} walked beneath dark boughs and returned with mud on the hem and thought in the blood.`,
      Home: `${name} lingered at home, where comfort and old wounds shared the same fire.`,
      "City Gate": `At the city gate, ${name} watched travelers arrive with strange news from the road.`,
      "Castle Gardens": `${name} crossed the gardens where smiles bloomed as carefully as roses.`,
      "Throne Room": `${name} entered the throne room and felt every eye weigh worth, danger, and promise.`,
      "Training Court": `${name} trained until breath burned and pride stood straighter.`
    };
    patchActive((story) => ({
      ...story,
      player: {
        ...story.player,
        happiness: clamp(story.player.happiness + 2, 0, 100),
        strength: place === "Training Court" ? clamp(story.player.strength + 2, 0, 100) : story.player.strength
      }
    }));
    addLine(lines[place] ?? `${name} spent time at ${place}.`);
  }

  function claimDragon() {
    if (!activeStory || activeStory.player.dragon) return;
    const eligible = activeStory.player.bloodline === "Elder Flame" || activeStory.player.birthStatus === "Royal";
    if (!eligible) {
      addLine(`${activeStory.player.firstName} felt the old fire stir, yet no dragon answered the call.`);
      return;
    }
    const dragon = pick(["Azharax", "Vaerith", "Nythrax", "Caldrith", "Saryth", "Ignivar"]);
    patchActive((story) => ({
      ...story,
      player: { ...story.player, dragon },
      milestones: [...story.milestones, { id: uid(), title: "Claimed a Dragon", year: story.currentYear }]
    }));
    addLine(`${activeStory.player.firstName} claimed ${dragon}, and dragon and rider were bound for life.`);
  }

  function ageUp() {
    patchActive((story) => {
      const nextYear = story.currentYear + 1;
      const age = story.player.age + 1;
      const deathRoll = age >= 70 ? Math.random() < Math.min(0.08 + (age - 70) * 0.05, 0.95) : Math.random() < 0.03;
      const player = {
        ...story.player,
        age,
        health: clamp(story.player.health - (age > 55 ? 2 : 0), 0, 100),
        alive: deathRoll ? false : story.player.alive,
        causeOfDeath: deathRoll ? pick(["illness", "a fall", "court poison", "old age", "dragonfire"]) : story.player.causeOfDeath
      };
      const opening = `Year ${nextYear} opened with old burdens, fresh hungers, and the memory of all that came before.`;
      const lines = player.alive ? [opening] : [opening, `${player.firstName} died by ${player.causeOfDeath}. The chronicle falls silent for now.`];
      return {
        ...story,
        currentYear: nextYear,
        player,
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

  function Shell({ children, menuBackground = false }: { children: React.ReactNode; menuBackground?: boolean }) {
    const content = (
      <SafeAreaView style={[styles.safe, { backgroundColor: menuBackground ? "transparent" : C.bg }]}>
        <StatusBar barStyle={themeName === "dark" ? "light-content" : "dark-content"} />
        <ScrollView style={styles.scroll} contentContainerStyle={[styles.container, menuBackground && styles.menuContainer]}>
          {children}
        </ScrollView>
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

  function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
    return (
      <Pressable onPress={onPress} style={[styles.chip, { backgroundColor: selected ? C.accent : C.panel2, borderColor: selected ? C.accent : C.line }]}>
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
        <View style={[styles.face, { backgroundColor: p.bloodline === "Elder Flame" ? "#b5122b" : p.bloodline === "Moon-Witch" ? "#9d8ac8" : C.good }]}>
          <Text style={styles.faceText}>{p.firstName.slice(0, 1)}</Text>
        </View>
        <Text style={[styles.portraitName, { color: C.text }]}>{p.firstName}</Text>
        <Text style={[styles.portraitDetail, { color: C.dim }]}>{p.hairColor} - {p.faceTrait}</Text>
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

  if (screen === "menu") {
    return (
      <Shell menuBackground>
        <Text style={[styles.overline, styles.menuTextShadow, { color: themeName === "dark" ? C.silver : C.dim }]}>A CHRONICLE OF</Text>
        <Text style={[styles.title, styles.menuTextShadow, { color: C.text }]}>Dragon Chronicles</Text>
        <Text style={[styles.subtitle, styles.menuTextShadow, { color: themeName === "dark" ? "#e7e1dc" : C.text }]}>Forge a soul. Rule year by year. Keep the bloodline alive.</Text>
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
          <View style={styles.wrapRow}>{(["Royal", "Noble", "Bastard", "Commoner"] as const).map((birthStatus) => <Chip key={birthStatus} label={birthStatus} selected={draft.birthStatus === birthStatus} onPress={() => patchDraft({ birthStatus })} />)}</View>
          <Text style={[styles.label, { color: C.dim }]}>Bloodline</Text>
          <View style={styles.wrapRow}>{bloodlines.map((bloodline) => <Chip key={bloodline} label={bloodline} selected={draft.bloodline === bloodline} onPress={() => patchDraft({ bloodline })} />)}</View>
        </Card>
        <Button label="Next" onPress={() => setScreen("builder2")} />
        <Button label="Back" onPress={() => setScreen("menu")} />
      </Shell>
    );
  }

  if (screen === "builder2") {
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
          <Text style={[styles.label, { color: C.dim }]}>Face Trait</Text>
          <View style={styles.wrapRow}>{faceTraits.map((faceTrait) => <Chip key={faceTrait} label={faceTrait} selected={draft.faceTrait === faceTrait} onPress={() => patchDraft({ faceTrait })} />)}</View>
          <Text style={[styles.label, { color: C.dim }]}>Clothing</Text>
          <View style={styles.wrapRow}>{clothes.map((clothing) => <Chip key={clothing} label={clothing} selected={draft.clothing === clothing} onPress={() => patchDraft({ clothing })} />)}</View>
          <View style={styles.wrapRow}>{clothColors.map((clothColor) => <Chip key={clothColor} label={clothColor} selected={draft.clothColor === clothColor} onPress={() => patchDraft({ clothColor })} />)}</View>
        </Card>
        <Button label="Start Chronicle" onPress={startStory} />
        <Button label="Back" onPress={() => setScreen("builder1")} />
      </Shell>
    );
  }

  if (screen === "chronicle" && activeStory) {
    const places = activeStory.player.birthStatus === "Commoner" || activeStory.player.birthStatus === "Bastard"
      ? ["Market", "Tavern", "Forest", "Home", "City Gate"]
      : ["Market", "Tavern", "Forest", "Home", "City Gate", "Castle Gardens", "Throne Room", "Training Court"];
    const latest = activeStory.yearLog[activeStory.yearLog.length - 1];
    return (
      <Shell>
        <View style={styles.rowBetween}>
          <Button small label="Menu" onPress={() => setScreen("menu")} />
          <Portrait story={activeStory} />
        </View>
        <Card>
          <Text style={[styles.heading, { color: C.text }]}>{activeStory.player.firstName} {activeStory.player.familyName}</Text>
          <Text style={{ color: C.dim }}>{activeStory.player.birthStatus} - {activeStory.player.bloodline} - {activeStory.player.origin}</Text>
          <Text style={{ color: C.dim }}>{activeStory.player.dragon ? `Dragon: ${activeStory.player.dragon}` : "No dragon claimed"}</Text>
          <Stat label="Health" value={activeStory.player.health} />
          <Stat label="Happiness" value={activeStory.player.happiness} />
          <Stat label="Strength" value={activeStory.player.strength} />
          <Stat label="Honor" value={activeStory.player.honor} />
        </Card>
        <Card>
          <Text style={[styles.heading, { color: C.text }]}>Year {latest?.year}</Text>
          {latest?.lines.map((line, index) => <Text key={`${line}-${index}`} style={[styles.body, { color: C.text }]}>{line}</Text>)}
        </Card>
        <Card>
          <Text style={[styles.label, { color: C.dim }]}>Places</Text>
          <View style={styles.wrapRow}>{places.map((place) => <Chip key={place} label={place} selected={false} onPress={() => visit(place)} />)}</View>
        </Card>
        <View style={styles.row}>
          <Button small label="Claim Dragon" onPress={claimDragon} disabled={Boolean(activeStory.player.dragon) || activeStory.finished} />
          <Button small label="Age Up" onPress={ageUp} disabled={activeStory.finished} />
        </View>
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

  if (screen === "load") {
    const active = stories.filter((story) => !story.finished && story.player.alive);
    return (
      <Shell>
        <Text style={[styles.titleSmall, { color: C.text }]}>Load Game</Text>
        {active.length === 0 ? <Text style={[styles.subtitle, { color: C.dim }]}>No living chronicles yet.</Text> : null}
        {active.map((story) => (
          <Card key={story.id}>
            <Text style={[styles.heading, { color: C.text }]}>{story.title}</Text>
            <Text style={{ color: C.dim }}>{story.player.firstName}, age {story.player.age}, year {story.currentYear}</Text>
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
  barFill: { height: "100%", borderRadius: 8 }
});
