# Architecture

Dragon Chronicles is split into a deterministic simulation core, a chronicle life-sim layer, and optional AI/media providers.

## Core Loop

1. Load or create a `GameWorld`.
2. Render the player character, family, kingdom, relationships, quests, current event choices, and latest chronicle year log.
3. Apply a player action through a system function such as `visitLocation`, `performLifeAction`, `claimDragon`, or an event choice.
4. Advance time with `advanceYear` or `advanceChronicleYear`.
5. If the current player dies, continue through an heir or finish the chronicle with a life summary.
6. Persist with `createSaveFile`, `serializeSave`, or a `CloudSaveAdapter`.

## Main Systems

| System | Purpose | First file |
| --- | --- | --- |
| Character Creator | Generate player and NPCs with stats, traits, rank, secrets, appearance, birth status, and origin | `src/characters.ts`, `src/presets.ts` |
| Bloodlines | Dynastic identity, prestige, inherited traits, dragon bond, curses | `src/characters.ts` |
| Families | Family trees, ancestors, descendants, succession order | `src/families.ts` |
| Chronicle | Year logs, places, age-up, milestones, death, heirs, game-over summaries | `src/chronicle.ts` |
| Relationships | Long-term social memory between NPCs | `src/relationships.ts`, `src/chronicle.ts` |
| Marriage | Political alliance score and spouse links | `src/relationships.ts`, `src/chronicle.ts` |
| Dragons | Claimed dragons, rider bonds, trust, ferocity, temperament | `src/chronicle.ts` |
| Politics | Kingdoms, factions, law pressure, rebellion tension | `src/politics.ts` |
| Wars | War declaration and yearly score progression | `src/politics.ts` |
| Events | Life-sim choices with mechanical effects | `src/events.ts` |
| Quests | Adventurer-style quest hooks | `src/quests.ts` |
| Inventory | Items, crafting, market pricing | `src/inventory.ts` |
| Saves | Local and cloud save contracts | `src/saves.ts` |
| AI | Provider interfaces and prompts | `src/ai.ts` |
| Assets | Premade and AI media references | `src/assets.ts` |
| World | New game creation and time advancement | `src/world.ts` |

## Prototype Lineage

The initial mobile prototype in `C:/Users/MozsikAV/Downloads/App.js` proved the basic loop:

- create a person,
- generate family,
- visit places,
- interact with relationships,
- claim a dragon,
- age up,
- pass the chronicle to heirs or end the story.

The library keeps those mechanics but moves them out of React component state and into typed, deterministic game rules. See `docs/PROTOTYPE_IMPORT.md` for the import notes.

## AI Roadmap

AI should be introduced in layers:

1. Dialogue flavor: generate short lines for key scenes, then cache them in save data if needed.
2. Portrait requests: generate missing portraits, but always support premade or placeholder portraits.
3. Narrator: summarize major events in a consistent tone.
4. Game master: propose new events/quests using the current world state, but validate all effects through deterministic game rules.
5. Memory: summarize character history and relationship history into compact context records.

## Mobile Roadmap

1. New-game screen with seed, player name, birth status, appearance, starting age, and kingdom name.
2. Chronicle screen with portrait, stats, year log, places, actions, dragon button, and age-up.
3. Character sheet and event feed.
4. Family tree view.
5. Relationship screen with spouse/rival/friend/ward history.
6. Kingdom screen with factions, laws, wars, and succession.
7. Quest and inventory screens.
8. Save slots and cloud sync.
9. AI media unlocks once the core game feels fun without them.

## Data Rule

Anything that changes gameplay belongs in `GameWorld` or a typed save object. Anything that is expensive or provider-specific, such as generated images, music, or narration audio, should be stored as an asset key plus metadata.
