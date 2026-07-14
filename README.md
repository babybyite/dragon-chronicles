# Dragon Chronicles Core

Dragon Chronicles Core is a TypeScript simulation library for an original mobile dynasty RPG: dragon-court politics, tabletop-style adventuring, life-sim choices, long family histories, and AI-assisted story/media generation.

This package is intentionally engine-agnostic. It can sit under React Native, Unity via a JS bridge, a web prototype, or a server-backed mobile client.

## Library Map

```text
src/
├── Character Creator      -> characters.ts
├── Bloodlines             -> characters.ts, families.ts
├── Families               -> families.ts
├── Portrait Generator     -> assets.ts, ai.ts
├── AI Story Engine        -> ai.ts, events.ts
├── Relationships          -> relationships.ts
├── Marriage               -> relationships.ts
├── Kingdom Politics       -> politics.ts
├── Wars                   -> politics.ts
├── Events                 -> events.ts
├── Dynamic NPC AI         -> ai.ts
├── Procedural Quests      -> quests.ts
├── Inventory              -> inventory.ts
├── Crafting               -> inventory.ts
├── Economy                -> inventory.ts
├── Save Files             -> saves.ts
├── Cloud Saves            -> saves.ts
├── AI Portraits           -> ai.ts, assets.ts
├── AI Music               -> ai.ts, assets.ts
└── AI Narrator/Game Master-> ai.ts
```

## What Exists Now

- Seeded procedural world creation.
- Procedural bloodlines with mottos, sigils, prestige, dragon bond, inherited traits, and curses.
- Character creation with stats, traits, secrets, rank, inventory, gold, and portrait prompts.
- Family tree helpers for ancestors, descendants, and succession order.
- Relationship simulation with affection, trust, fear, respect, resentment, rivalries, spouses, and history.
- Marriage scoring and alliance creation.
- Kingdom politics with factions, laws, stability, dread, prosperity, council pressure, and wars.
- BitLife-style events with choices and effects.
- DnD-flavored procedural quests.
- Inventory, crafting, item value, and market price helpers.
- Save file serialization, schema migration hook, and cloud save adapter interface.
- AI provider interfaces for dialogue, portraits, music, narrator, and a future AI game master.

## Quick Start

```ts
import { advanceYear, createWorld, fallbackDialogue } from "dragon-chronicles-core";

let world = createWorld({
  seed: "my-first-dynasty",
  playerName: "Aelira",
  kingdomName: "The Ember Crown"
});

world = advanceYear(world);

const line = fallbackDialogue({
  world,
  speakerId: world.playerCharacterId,
  listenerIds: [],
  intent: "scheme"
});

console.log(world.eventLog.at(-1));
console.log(line[0]?.text);
```

## Design Principles

1. Deterministic core, magical surface. The same seed should rebuild the same starting world, while AI and assets can add flavor on top.
2. Save first. Every system uses serializable data structures so long-term mobile saves remain stable.
3. Original fantasy. The tone is dragon-court dynastic drama, not a clone of any existing franchise.
4. AI is optional. The game should still run with fallback dialogue and premade assets when AI services are unavailable.
5. The mobile client owns presentation. This library owns state, rules, prompts, and simulation decisions.

## Install Later

```bash
npm install
npm run typecheck
npm run build
```

This repo currently contains the core library only. The next layer should be a mobile prototype that renders characters, events, family trees, and choices from this state.
