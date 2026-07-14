export type Rng = {
  readonly seed: string;
  next(): number;
  int(min: number, max: number): number;
  pick<T>(items: readonly T[]): T;
  chance(probability: number): boolean;
  fork(label: string): Rng;
};

function xmur3(input: string): () => number {
  let h = 1779033703 ^ input.length;
  for (let i = 0; i < input.length; i += 1) {
    h = Math.imul(h ^ input.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return (h ^= h >>> 16) >>> 0;
  };
}

function mulberry32(seedNumber: number): () => number {
  let a = seedNumber >>> 0;
  return () => {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function createRng(seed: string): Rng {
  const seedFactory = xmur3(seed);
  const nextFloat = mulberry32(seedFactory());

  return {
    seed,
    next: nextFloat,
    int(min: number, max: number): number {
      return Math.floor(nextFloat() * (max - min + 1)) + min;
    },
    pick<T>(items: readonly T[]): T {
      if (items.length === 0) {
        throw new Error("Cannot pick from an empty collection.");
      }
      return items[this.int(0, items.length - 1)]!;
    },
    chance(probability: number): boolean {
      return nextFloat() < Math.max(0, Math.min(1, probability));
    },
    fork(label: string): Rng {
      return createRng(`${seed}:${label}`);
    }
  };
}

export function id(prefix: string, rng: Rng): string {
  return `${prefix}_${Math.floor(rng.next() * 0xffffffff).toString(36).padStart(7, "0")}`;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function weightedPick<T>(rng: Rng, entries: readonly { item: T; weight: number }[]): T {
  const total = entries.reduce((sum, entry) => sum + Math.max(0, entry.weight), 0);
  if (total <= 0) {
    return rng.pick(entries.map((entry) => entry.item));
  }

  let roll = rng.next() * total;
  for (const entry of entries) {
    roll -= Math.max(0, entry.weight);
    if (roll <= 0) {
      return entry.item;
    }
  }

  return entries[entries.length - 1]!.item;
}
