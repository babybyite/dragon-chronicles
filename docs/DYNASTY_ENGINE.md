# Dragon Chronicles Dynasty Engine

## Core identity

Dragon Chronicles is both a character life simulator and a dynasty simulator. Individual lives generate the history of houses, kingdoms, bloodlines, and future playable descendants.

## Portrait rules

- Approved art direction: refined fantasy watercolor, painterly texture, characteristic faces, soft edges, semi-realistic proportions.
- Origins currently used for facial structure: Northlands, Eastern Courts, Western Marches, Steppe, and Deep Cities.
- Clothing should communicate social tier and fantasy setting without copying real-world cultural dress.
- Portrait stages change at ages 0, 12, 16, 24, 30, and 50.
- Age 0 ignores normal hairstyle, clothing style, and clothing color. It uses a highborn or lowborn swaddle.
- Crowns are overlays, never baked into base portraits. Only a current Ruling King or Ruling Queen receives the crown overlay.
- Scars, burns, and blind eyes are visible, persistent overlays acquired through gameplay.

## Genetics

DNA is permanent. Current appearance is changeable.

Inherited DNA includes facial structure, skin tone, hair texture and thickness, natural hair and eye color, height, build, freckles, vitiligo, bloodline percentages, and house signature traits.

Children inherit traits probabilistically from both parents with small natural variation. House signatures bias inheritance without guaranteeing it.

### Atlantis expression

Atlantis gene percentage controls the probability and intensity of magical portrait effects:

- subtle glow whose opacity scales with the gene percentage;
- a probability equal to Atlantis percentage of overriding eye color with bright blue, light purple, or grey;
- a probability equal to Atlantis percentage of adding a white hair strand that follows the selected hairstyle;
- no white strand when the selected hair color is Platinum Blonde or Ash White.

Witch Blood and Wolf Blood currently affect gameplay rather than base portrait appearance.

## World simulation

Every yearly tick may update:

- age, health, mortality, and cause of death;
- births and inherited descendants;
- house membership, extinction, prestige, land, alliances, rivalries, and treasury;
- kingdom population, treasury, army, food, prestige, magic, technology, stability, war, and unrest;
- relationship memories and long-term NPC goals;
- historical events stored for chronicles and newspapers.

The initial implementation is intentionally deterministic-friendly: simulation functions accept injectable random and ID functions so later tests and saved games can reproduce results.

## Next integration steps

1. Add DNA, portrait identity, and injury fields to player, family, royal-family, and relationship character records.
2. Create founding DNA when a new game starts.
3. Use `inheritDNA` when births create children.
4. Store the chosen portrait identity in saves so it never rerolls.
5. Replace the temporary letter portrait with a layered portrait renderer.
6. Adapt the existing `ageUp` flow to call the world simulation engine.
7. Add seeded random generation and automated tests before enabling large NPC populations.
