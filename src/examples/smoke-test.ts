import {
  advanceYear,
  ageOf,
  claimDragon,
  createRng,
  createSaveFile,
  createWorld,
  performLifeAction,
  serializeSave,
  visitLocation
} from "../index.js";

let world = createWorld({
  seed: "first-dynasty",
  playerName: "Aelira",
  playerFamilyName: "Duskblade",
  playerBirthStatus: "royal",
  startingAge: 24,
  kingdomName: "The Ember Crown"
});

const player = world.characters[world.playerCharacterId];
if (!player) {
  throw new Error("Smoke test failed: player character was not created.");
}

const firstNpc = Object.values(world.characters).find((character) => character.id !== player.id);
if (!firstNpc) {
  throw new Error("Smoke test failed: expected at least one NPC.");
}

world = visitLocation(world, player.id, "Throne Room");
world = performLifeAction(world, createRng(`${world.seed}:talk`), player.id, firstNpc.id, "Talk");
world = claimDragon(world, createRng(`${world.seed}:dragon`), player.id);
world = advanceYear(world);

const updatedPlayer = world.characters[world.playerCharacterId];
if (!updatedPlayer) {
  throw new Error("Smoke test failed: active player disappeared after advancing the year.");
}

const save = createSaveFile("smoke-slot", world, new Date("2026-07-14T00:00:00.000Z"));
const latestYear = world.yearLog[world.yearLog.length - 1];
const latestEvent = world.eventLog[world.eventLog.length - 1];

console.log("Dragon Chronicles smoke test");
console.log("--------------------------------");
console.log(`Player: ${updatedPlayer.givenName} ${updatedPlayer.familyName}, age ${ageOf(world, updatedPlayer)}`);
console.log(`Year: ${world.year}`);
console.log(`Characters: ${Object.keys(world.characters).length}`);
console.log(`Dragons: ${Object.keys(world.dragons).length}`);
console.log(`Latest chronicle year: ${latestYear?.year}`);
for (const line of latestYear?.lines ?? []) {
  console.log(`- ${line}`);
}
console.log(`Latest event: ${latestEvent?.title ?? "none"}`);
console.log(`Save bytes: ${new TextEncoder().encode(serializeSave(save)).length}`);
