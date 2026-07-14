# Mobile Stack Decision

Dragon Chronicles should be built as a React Native + Expo mobile app on top of the existing TypeScript simulation core.

## Chosen Stack

| Layer | Choice | Why |
| --- | --- | --- |
| Mobile app | React Native + Expo | Fast iteration, real mobile UI, simple previews, easier asset handling, good path to iOS/Android builds. |
| Game logic | `dragon-chronicles-core` TypeScript library | Keeps saves, rules, generation, relationships, politics, and AI contracts separate from UI. |
| Portraits | Pre-generated portrait library first | Fast loading, consistent art direction, predictable offline play, no wait during character screens. |
| Dynamic writing | Cloud AI | Best used for dialogue, narration, rumors, letters, quests, and game master moves. |
| AI orchestration | Structured game master prompt | Allows the AI to reason over world state without directly owning game rules. |
| Saves | Local-first save files | Reliable mobile play, instant resume, no account required. |
| Sync | Optional cloud save adapter | Lets players move between devices later without making the first version heavier than needed. |

## Runtime Shape

```text
Expo App
  -> UI screens and navigation
  -> local asset registry
  -> local save storage
  -> optional cloud sync
  -> cloud AI client

Core Library
  -> deterministic world state
  -> chronicle actions
  -> relationships and families
  -> politics, quests, events, inventory
  -> AI request/response contracts
```

The app should never let the AI mutate save data directly. The AI can propose dialogue, narration, events, quests, rumors, and mysteries. The core validates and applies the actual mechanical effects.

## Portrait Strategy

Start with pre-generated portraits organized by metadata:

- age stage: child, teen, young adult, adult, older adult, elder
- gender presentation
- birth status: royal, noble, bastard, commoner
- bloodline flavor
- hair color and face trait
- outfit tier
- mood or scene use

A character stores a `PortraitRef`, not raw image data. The app resolves that reference to a local bundled asset or downloaded/generated asset.

AI portrait generation can come later for special characters, dynasty founders, dragons, heirs, and major story moments. Generated assets should be cached and referenced by asset key.

## Cloud AI Strategy

Use cloud AI for material that benefits from surprise and texture:

- short NPC dialogue
- letters, rumors, threats, prophecies, dreams
- event narration
- quest hooks
- court gossip
- long-term mystery reveals
- game master suggestions

Keep deterministic fallbacks for every AI feature so the game still works offline or when the AI service is unavailable.

## Game Master Contract

The game master receives compact structured context and returns structured proposals.

Input should include:

- current year and player character
- living major NPCs
- family tree highlights
- relationship summaries
- inventory highlights
- kingdom and faction state
- active quests
- unresolved mysteries
- recent chronicle lines
- important memories and secrets
- tone guardrails

The game master may return:

- dialogue beats
- a new event proposal
- a quest hook
- a rumor or letter
- a mystery clue
- a relationship memory update
- narrator text

The game master must not return arbitrary save patches. Mechanical changes should be represented as known event effects or system actions that the core can validate.

## Save Strategy

Use local-first saves:

1. Serialize `SaveFile` into local device storage.
2. Keep asset references separate from save data.
3. Save after player actions and year advancement.
4. Add schema migrations before changing save shape.
5. Add optional cloud sync through the existing `CloudSaveAdapter` interface.

Cloud sync should upload save payloads and asset metadata, not necessarily every generated image/audio file in the first version.

## First Mobile Prototype

The first Expo app should only prove the loop:

1. New game creator.
2. Chronicle screen with portrait, vitals, year log, locations, claim dragon, age up.
3. Relationships screen with available actions.
4. Family tree screen.
5. Save slots.
6. Simple AI dialogue button behind an adapter.

Once that loop is fun, expand into politics, quests, inventory, cloud saves, generated narration, and the game master.
