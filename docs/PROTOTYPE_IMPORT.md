# Prototype Import Notes

Source reviewed: `C:/Users/MozsikAV/Downloads/App.js`.

The prototype is a valuable gameplay sketch: it already proves the fantasy life-sim loop can feel playable. The core library now borrows its mechanical shape while keeping the repository clean, original, and reusable.

## Imported Into Core

- Two-step character creation concepts: name, gender, birth status, bloodline, starting age, origin, hair, face trait, clothing, and cloth color.
- Portrait descriptors with age stages: child, teen, young adult, adult, older adult, elder.
- Started/finished chronicle structure with year logs, action counts, milestones, summaries, and generation handoff.
- Family basics: parents, siblings, children, spouse links, wards, and relationship labels.
- Relationship actions: talk, drink together, fight, give rose, propose marriage, lay together, learn secrets, form alliance, attempt murder, take in or abandon ward.
- Places to visit: market, tavern, forest, home, city gate, and court locations for nobles.
- Dragon claiming with eligibility based on bloodline or dragon affinity.
- Age-up loop with death chance, heir continuation, and game-over summary.

## Deliberately Changed

- Name lists were originalized and cleaned up. The old app had several names that felt too tied to existing fantasy properties.
- `Blood of Old Valirya` became original dragon-blood framing such as Elder Flame/dragon-bonded houses.
- The React Native UI remains outside the core. The library now exposes state and rules; a future app can render them however we want.
- Randomness now uses seedable deterministic RNG instead of `Math.random`, so saves and simulations can be reproduced.
- Long-term save fields are typed in `GameWorld` instead of living inside component state.

## Next Upgrade Ideas

1. Replace simple action text with event templates that can branch by personality, relationship, age, and rank.
2. Add real family-tree generation at new-game start: mother, father, siblings, grandparent, rivals, wards.
3. Expand bloodline inheritance percentages into typed ancestry values.
4. Make pregnancy/children use fertility, health, age, secrecy, legitimacy, and politics.
5. Make dragons full NPCs with moods, wounds, hunger, rider bonds, eggs, and battle consequences.
6. Create a React Native shell that consumes this library instead of keeping game state in a component.
