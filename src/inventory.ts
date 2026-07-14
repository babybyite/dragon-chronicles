import type { CraftingRecipe, GameWorld, Id, Item } from "./types.js";
import type { Rng } from "./rng.js";
import { id } from "./rng.js";

const itemNames = ["Dragonbone Dagger", "Moonsteel Ring", "Black Salt", "Emberleaf", "Court Ledger", "Wyrmhide Harness", "Saint's Coin", "Oathbreaker Blade"];
const rarityValue = { common: 20, uncommon: 75, rare: 220, epic: 650, legendary: 1800 } as const;

export function createItem(rng: Rng, partial: Partial<Item> = {}): Item {
  const rarity = partial.rarity ?? rng.pick(["common", "uncommon", "rare", "epic", "legendary"] as const);
  return {
    id: partial.id ?? id("item", rng),
    name: partial.name ?? rng.pick(itemNames),
    kind: partial.kind ?? rng.pick(["weapon", "armor", "relic", "ingredient", "book", "dragon_gear", "trade_good"] as const),
    rarity,
    value: partial.value ?? rarityValue[rarity] + rng.int(-10, 80),
    tags: partial.tags ?? []
  };
}

export function addItemToCharacter(world: GameWorld, characterId: Id, item: Item): GameWorld {
  const character = world.characters[characterId];
  if (!character) throw new Error(`Unknown character ${characterId}`);
  return {
    ...world,
    items: { ...world.items, [item.id]: item },
    characters: { ...world.characters, [characterId]: { ...character, inventoryIds: [...character.inventoryIds, item.id] } }
  };
}

export function createRecipe(rng: Rng, output: Item, ingredientIds: Id[], difficulty = rng.int(3, 15)): CraftingRecipe {
  return {
    id: id("recipe", rng),
    output,
    ingredientIds,
    skill: rng.pick(["learning", "martial", "stewardship", "dragonAffinity"] as const),
    difficulty
  };
}

export function canCraft(world: GameWorld, characterId: Id, recipe: CraftingRecipe): boolean {
  const character = world.characters[characterId];
  if (!character) return false;
  const ownsIngredients = recipe.ingredientIds.every((ingredientId) => character.inventoryIds.includes(ingredientId));
  return ownsIngredients && character.stats[recipe.skill] >= recipe.difficulty;
}

export function craft(world: GameWorld, characterId: Id, recipe: CraftingRecipe): GameWorld {
  const character = world.characters[characterId];
  if (!character) throw new Error(`Unknown character ${characterId}`);
  if (!canCraft(world, characterId, recipe)) return world;

  const remainingInventory = character.inventoryIds.filter((itemId) => !recipe.ingredientIds.includes(itemId));
  return {
    ...world,
    items: { ...world.items, [recipe.output.id]: recipe.output },
    characters: { ...world.characters, [characterId]: { ...character, inventoryIds: [...remainingInventory, recipe.output.id] } }
  };
}

export function marketPrice(item: Item, prosperity: number, scarcity = 50): number {
  const prosperityModifier = 1 + (prosperity - 50) / 200;
  const scarcityModifier = 1 + (scarcity - 50) / 100;
  return Math.max(1, Math.round(item.value * prosperityModifier * scarcityModifier));
}
