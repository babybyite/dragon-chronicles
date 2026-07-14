# Architecture

Dragon Chronicles is split into a deterministic simulation core and optional AI/media providers.

## Core Loop

1. Load or create a `GameWorld`.
2. Render the player character, family, kingdom, relationships, quests, and current event choices.
3. Apply a player choice through a system function.
4. Advance time with `advanceYear` or a future `advanceMonth`/`advanceDay` function.
5. Persist with `createSaveFile`, `serializeSave`, or a `CloudSaveAdapter`.

## Main Systems

| System | Purpose | First file |
| --- | --- | --- |
| Character Creator | Generate player and NPCs with stats, traits, rank, secrets, portrait prompts | `src/characters.ts` |
| Bloodlines | Dynastic identity, prestige, inherited traits, dragon bond, curses | `src/characters.ts` |
| Families | Family trees, ancestors, descendants, succession order | `src/families.ts` |
| Relationships | Long-term social memory between NPCs | `src/relationships.ts` |
| Marriage | Political alliance score and spouse links | `src/relationships.ts` |
| Politics | Kingdoms, factions, law pressure, rebellion tension | `src/politics.ts` |
| Wars | War declaration and yearly score progression | `src/politics.ts` |
| Events | Life-sim choices with mechanical effects | `src/events.ts` |
| Quests | Adventurer-style quest hooks | `src/quests.ts` |
| Inventory | Items, crafting, market pricing | `src/inventory.ts` |
| Saves | Local and cloud save contracts | `src/saves.ts` |
| AI | Provider interfaces and prompts | `src/ai.ts` |
| Assets | Premade and AI media references | `src/assets.ts` |
| World | New game creation and time advancement | `src/world.ts` |

## AI Roadmap

AI should be introduced in layers:

1. Dialogue flavor: generate short lines for key scenes, then cache them in save data if needed.
2. Portrait requests: generate missing portraits, but always support premade or placeholder portraits.
3. Narrator: summarize major events in a consistent tone.
4. Game master: propose new events/quests using the current world state, but validate all effects through deterministic game rules.
5. Memory: summarize character history and relationship history into compact context records.

## Mobile Roadmap

1. New-game screen with seed, player name, and kingdom name.
2. Character sheet and event feed.
3. Family tree view.
4. Relationship screen with spouse/rival/friend history.
5. Kingdom screen with factions, laws, wars, and succession.
6. Quest and inventory screens.
7. Save slots and cloud sync.
8. AI media unlocks once the core game feels fun without them.

## Data Rule

Anything that changes gameplay belongs in `GameWorld` or a typed save object. Anything that is expensive or provider-specific, such as generated images, music, or narration audio, should be stored as an asset key plus metadata.
