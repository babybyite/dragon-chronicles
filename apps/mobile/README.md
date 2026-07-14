# Dragon Chronicles Mobile

First playable Expo shell for Dragon Chronicles.

## What Works

- Main menu.
- New game flow.
- Character builder step 1: name, sex, birth status, bloodline.
- Character builder step 2: age, origin, appearance seed.
- Chronicle screen with year log, stats, generated sample portrait card, locations, dragon claim, and age-up.
- Load Game screen for living active stories.
- Past Games screen for finished stories and deleting reports.
- Settings screen with dark story book and pastel story book themes.

This is still in-memory only. Closing the app clears stories until local save storage is added.

## Test On iPhone With Expo Go

```bash
cd apps/mobile
npm install
npm run start
```

Then scan the Expo QR code with Expo Go on your iPhone.

## Notes

- Portraits are generated sample portrait cards for now.
- Real portrait folder selection will come after you upload the portrait folders.
- Local save/load will be the next practical upgrade.
- The game currently uses the mobile shell's temporary in-memory state; the next integration pass should connect screens directly to the core library save model.
