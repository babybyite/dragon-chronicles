# Portrait Lab

The Expo app now opens through a temporary developer launcher with two choices:

- **Open Game** starts the existing Dragon Chronicles prototype unchanged.
- **Open Portrait Lab** starts the deterministic portrait alignment preview.

## Locked portrait contract

- Canvas: **250 × 350 px**
- Ratio: **5:7**
- Physical design target: **2.5 × 3.5 cm**
- Female age profiles: **0, 12, 16, 24, 30, 50**
- Ages **16 and 24 share identical layer geometry**

## What the current lab proves

- The portrait canvas remains fixed while age, origin, hairstyle, and hair colour change.
- Age 0 uses infant framing with a large head, short neck, upper body, and visible arms/hands.
- Ages 12–50 use the approved head-to-natural-waist framing.
- Developer guides show the locked head bounds and eye, chin, shoulder, and waist lines.
- Placeholder shapes can be replaced by final transparent watercolor PNGs without changing layout code.

## Asset rules for the next phase

Every exported layer must:

1. Be a transparent PNG exactly 250 × 350 px.
2. Keep all artwork on the shared canvas rather than tightly cropping around the painted pixels.
3. Match the selected age profile anchors.
4. Use the same geometry for ages 16 and 24.
5. Avoid baked-in elements belonging to another layer, such as crowns inside hair or clothing.
6. Preserve soft watercolor edges while keeping transparent pixels outside the painted region.

## Testing

From `apps/mobile` run:

```bash
npm install
npm run typecheck
npm start
```

Open the project in Expo Go and choose **Open Portrait Lab** from the developer launcher.
