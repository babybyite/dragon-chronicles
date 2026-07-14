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
type Screen = "menu" | "builder1" | "builder2" | "chronicle" | "load" | "past" | "settings" | "family" | "relationships";
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
  alive: boolean;
};

type Relation = {
  id: string;
  firstName: string;
  familyName: string;
  relation: string;
  age: number;
  birthStatus: BirthStatus;
  origin: string;
  trust: number;
  romance: number;
  resentment: number;
  alive: boolean;
  note: string;
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
    causeOfDeath?: string;
  };
  family: Person[];
  relations: Relation[];
  currentYear: number;
  yearLog: { year: number; lines: string[] }[];
  placeUses: Record<string, number>;
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
    good: "#9aad92",
    warning: "#b99354"
  }
};

const menuBackgrounds = {
  dark: require("./assets/backgrounds/main-menu-dark.png"),
  pastel: require("./assets/backgrounds/main-menu-pastel.png")
};

const firstNames = ["Aelira", "Mirelle", "Vaessa", "Rowan", "Lucian", "Dorian", "Veyr", "Sable", "Corenna", "Tavik"];
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

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function makePerson(input: Partial<Person> & { relation: string; familyName: string; age: number }): Person {
  return {
    id: uid(),
    firstName: input.firstName ?? pick(firstNames),
    familyName: input.familyName,
    sex: input.sex ?? pick<Sex>(["Female", "Male"]),
    age: input.age,
    birthStatus: input.birthStatus ?? "Noble",
    bloodline: input.bloodline ?? "Common Blood",
    relation: input.relation,
    parentIds: input.parentIds ?? [],
    spouseId: input.spouseId,
    alive: input.alive ?? true
  };
}

function relationFromPerson(person: Person): Relation {
  return {
    id: person.id,
    firstName: person.firstName,
    familyName: person.familyName,
    relation: person.relation,
    age: person.age,
    birthStatus: person.birthStatus,
    origin: pick(origins),
    trust: person.relation === "Mother" || person.relation === "Father" ? 62 : 45,
    romance: 0,
    resentment: 0,
    alive: person.alive,
    note: "Known since the beginning of the chronicle."
  };
}

function buildStartingFamily(player: Story["player"]): Person[] {
  const mother = makePerson({
    relation: "Mother",
    familyName: player.familyName,
    sex: "Female",
    age: player.age + 24,
    birthStatus: player.birthStatus === "Royal" ? "Royal" : "Noble",
    bloodline: player.bloodline
  });
  const father = makePerson({
    relation: "Father",
    familyName: player.familyName,
    sex: "Male",
    age: player.age + 27,
    birthStatus: player.birthStatus === "Royal" ? "Royal" : "Noble",
    bloodline: pick([player.bloodline, "Common Blood"])
  });
  const sibling = makePerson({
    relation: "Sibling",
    familyName: player.familyName,
    age: clamp(player.age + pick([-3, -1, 2, 4]), 0, 80),
    birthStatus: player.birthStatus,
    bloodline: player.bloodline,
    parentIds: [mother.id, father.id]
  });
  return [mother, father, sibling];
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("menu");
  const [themeName, setThemeName] = useState<ThemeName>("dark");
  const [draft, setDraft] = useState<CharacterDraft>(initialDraft);
  const [stories, setStories] = useState<Story[]>([]);
  const [activeStoryId, setActiveStoryId] = useState<string | null>(null);
  const [treeZoom, setTreeZoom] = useState(1);
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
    const player = {
      ...draft,
      id: uid(),
      firstName: draft.firstName.trim() || pick(firstNames),
      familyName: draft.familyName.trim() || pick(familyNames),
      age: draft.startAge,
      alive: true,
      health: 70,
      happiness: 55,
      strength: 55,
      honor: 50
    };
    const family = buildStartingFamily(player);
    const story: Story = {
      id: uid(),
      title: `${player.familyName} Chronicle`,
      player,
      family,
      relations: family.map(relationFromPerson),
      currentYear: player.age,
      yearLog: [
        {
          year: player.age,
          lines: [`${player.firstName} ${player.familyName} began this year as ${articleFor(player.birthStatus)} ${player.birthStatus.toLowerCase()} of ${player.bloodline}, dressed in ${player.clothColor.toLowerCase()} ${player.clothing.toLowerCase()}.`]
        }
      ],
      placeUses: {},
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
    if (!activeStory || activeStory.finished) return;
    const used = activeStory.placeUses[place] ?? 0;
    if (used >= 3) {
      addLine(`${activeStory.player.firstName} has already tested ${place} three times this year; even rumors need time to grow back.`);
      return;
    }

    const encounter = Math.random() < encounterChance(activeStory.player.birthStatus, place);
    const newRelation = encounter ? createRelationFromPlace(activeStory, place) : null;
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

  function interact(relationId: string, action: string) {
    if (!activeStory) return;
    const relation = activeStory.relations.find((candidate) => candidate.id === relationId);
    if (!relation) return;

    let line = `${activeStory.player.firstName} spent time with ${relation.firstName}.`;
    const delta = { trust: 0, romance: 0, resentment: 0, health: 0, happiness: 0, honor: 0 };

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
    }

    patchActive((story) => ({
      ...story,
      player: {
        ...story.player,
        health: clamp(story.player.health + delta.health, 0, 100),
        happiness: clamp(story.player.happiness + delta.happiness, 0, 100),
        honor: clamp(story.player.honor + delta.honor, 0, 100)
      },
      relations: story.relations.map((candidate) =>
        candidate.id === relationId
          ? {
              ...candidate,
              trust: clamp(candidate.trust + delta.trust, 0, 100),
              romance: clamp(candidate.romance + delta.romance, 0, 100),
              resentment: clamp(candidate.resentment + delta.resentment, 0, 100),
              note: line
            }
          : candidate
      )
    }));
    addLine(line);
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
        causeOfDeath: deathRoll ? pick(["illness", "a fall", "court poison", "old age", "a sewer fever"]) : story.player.causeOfDeath
      };
      const opening = `Year ${nextYear} opened with old burdens, fresh hungers, and the memory of all that came before.`;
      const lines = player.alive ? [opening] : [opening, `${player.firstName} died by ${player.causeOfDeath}. The chronicle falls silent for now.`];
      return {
        ...story,
        currentYear: nextYear,
        player,
        family: story.family.map((person) => ({ ...person, age: person.age + (person.alive ? 1 : 0) })),
        relations: story.relations.map((relation) => ({ ...relation, age: relation.age + (relation.alive ? 1 : 0) })),
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
          <Text style={{ color: C.dim }}>{activeStory.player.birthStatus} - {activeStory.player.bloodline} - {activeStory.player.origin}</Text>
          <Text style={{ color: C.dim }}>{activeStory.player.clothColor} {activeStory.player.clothing} - {activeStory.player.faceTrait}</Text>
          <Stat label="Health" value={activeStory.player.health} />
          <Stat label="Happiness" value={activeStory.player.happiness} />
          <Stat label="Strength" value={activeStory.player.strength} />
          <Stat label="Honor" value={activeStory.player.honor} />
        </Card>
        <View style={styles.row}>
          <Button small label="Family Tree" onPress={() => setScreen("family")} />
          <Button small label="Relationships" onPress={() => setScreen("relationships")} />
          <Button small label="Age Up" onPress={ageUp} disabled={activeStory.finished} />
        </View>
        <Card>
          <Text style={[styles.heading, { color: C.text }]}>Year {latest?.year}</Text>
          {latest?.lines.map((line, index) => <Text key={`${line}-${index}`} style={[styles.body, { color: C.text }]}>{line}</Text>)}
        </Card>
        <Card>
          <Text style={[styles.label, { color: C.dim }]}>Places: 3 Visits Each Per Year</Text>
          <View style={styles.wrapRow}>
            {places.map((place) => {
              const used = activeStory.placeUses[place] ?? 0;
              return <Chip key={place} label={`${place} ${used}/3`} selected={false} disabled={used >= 3 || activeStory.finished} onPress={() => visit(place)} />;
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

  if (screen === "family" && activeStory) {
    const player = activeStory.player;
    const parents = activeStory.family.filter((person) => person.relation === "Mother" || person.relation === "Father");
    const siblings = activeStory.family.filter((person) => person.relation === "Sibling");
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
            <View style={styles.treeRow}>
              {parents.map((person) => <TreeNode key={person.id} person={person} />)}
            </View>
            <Text style={[styles.treeLine, { color: C.dim }]}>|</Text>
            <View style={styles.treeRow}>
              <TreeNode person={{ id: player.id, firstName: player.firstName, familyName: player.familyName, sex: player.sex, age: player.age, birthStatus: player.birthStatus, bloodline: player.bloodline, relation: "Player", parentIds: parents.map((parent) => parent.id), alive: player.alive }} highlight />
            </View>
            <Text style={[styles.treeLine, { color: C.dim }]}>|</Text>
            <View style={styles.treeRow}>
              {siblings.map((person) => <TreeNode key={person.id} person={person} />)}
            </View>
          </View>
        </ScrollView>
        <Button label="Back" onPress={() => setScreen("chronicle")} />
      </Shell>
    );
  }

  function TreeNode({ person, highlight = false }: { person: Person; highlight?: boolean }) {
    return (
      <View style={[styles.treeNode, { backgroundColor: highlight ? C.accent : C.panel, borderColor: highlight ? C.accent : C.line }]}>
        <Text style={[styles.treeNodeName, { color: "#fff" }]}>{person.firstName} {person.familyName}</Text>
        <Text style={{ color: highlight ? "#fff" : C.dim }}>{person.relation} - age {person.age}</Text>
        <Text style={{ color: highlight ? "#fff" : C.dim }}>{person.birthStatus} - {person.bloodline}</Text>
      </View>
    );
  }

  if (screen === "relationships" && activeStory) {
    return (
      <Shell>
        <Text style={[styles.titleSmall, { color: C.text }]}>Relationships</Text>
        {activeStory.relations.length === 0 ? <Text style={[styles.subtitle, { color: C.dim }]}>No relations yet. Visit places to meet people.</Text> : null}
        {activeStory.relations.map((relation) => (
          <Card key={relation.id}>
            <View style={styles.rowBetween}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.heading, { color: C.text }]}>{relation.firstName} {relation.familyName}</Text>
                <Text style={{ color: C.dim }}>{relation.relation} - age {relation.age} - {relation.birthStatus}</Text>
                <Text style={{ color: C.dim }}>{relation.note}</Text>
              </View>
            </View>
            <Stat label="Trust" value={relation.trust} />
            <Stat label="Romance" value={relation.romance} />
            <Stat label="Resentment" value={relation.resentment} />
            <View style={styles.wrapRow}>
              {["Talk", "Drink Together", "Fight", "Give Rose", "Try to Learn Secret", "Form Alliance"].map((action) => (
                <Chip key={action} label={action} selected={false} disabled={activeStory.finished} onPress={() => interact(relation.id, action)} />
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

  function createRelationFromPlace(story: Story, place: string): Relation {
    const noblePlace = ["palace halls", "palace gardens", "throne room", "counsil room", "ball room", "private chambers", "chambers"].includes(place);
    return {
      id: uid(),
      firstName: pick(firstNames),
      familyName: noblePlace ? pick(familyNames) : pick([...familyNames, "No-House", "Riverborn", "Dockhand"]),
      relation: relationKindForPlace(place, story.player.birthStatus),
      age: clamp(story.player.age + pick([-8, -4, 0, 3, 7, 12]), 12, 80),
      birthStatus: noblePlace ? pick<BirthStatus>(["Royal", "Noble", "Bastard"]) : pick<BirthStatus>(["Noble", "Bastard", "Commoner"]),
      origin: pick(origins),
      trust: 35 + Math.floor(Math.random() * 25),
      romance: 0,
      resentment: 0,
      alive: true,
      note: `Met in the ${place} during year ${story.currentYear}.`
    };
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
  const details = [
    `${p.firstName} entered the ${place} as ${articleFor(p.birthStatus)} ${status}, the ${outfit} making every glance linger a moment longer.`,
    `${p.faceTrait} and ${blood} marked ${p.firstName} before a word was spoken in the ${place}.`,
    `On visit ${useNumber} to the ${place}, ${p.firstName}'s ${status} name carried ${status === "bastard" ? "old insult and stubborn opportunity" : status === "royal" ? "command, danger, and expectation" : "weight enough to open doors and sharpen knives"}.`,
    `${p.firstName} moved through the ${place} with ${p.honor > 60 ? "a reputation still polished" : "a reputation people tested in whispers"}.`
  ];
  const response = pick(details);
  if (!relation) return response;
  return `${response} There, ${relation.firstName} ${relation.familyName}, a ${relation.relation.toLowerCase()}, entered the chronicle.`;
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
  treeCanvas: { width: 900, minHeight: 410, alignItems: "center", justifyContent: "center", padding: 20 },
  treeRow: { flexDirection: "row", justifyContent: "center", gap: 16, marginVertical: 8 },
  treeLine: { fontSize: 30, textAlign: "center" },
  treeNode: { width: 220, borderWidth: 1, borderRadius: 8, padding: 12 },
  treeNodeName: { fontSize: 16, fontWeight: "800" }
});
