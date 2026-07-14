import type { Faction, GameWorld, Id, Kingdom, War } from "./types.js";
import type { Rng } from "./rng.js";
import { clamp, id } from "./rng.js";

export function createFaction(rng: Rng, name: string, leaderId: Id, memberIds: Id[] = []): Faction {
  return {
    id: id("faction", rng),
    name,
    leaderId,
    memberIds: [...new Set([leaderId, ...memberIds])],
    treasury: rng.int(100, 1500),
    influence: rng.int(10, 90),
    grievance: rng.int(0, 60)
  };
}

export function createKingdom(rng: Rng, name: string, rulerId: Id, capital: string, factions: Faction[]): Kingdom {
  return {
    id: id("kingdom", rng),
    name,
    rulerId,
    capital,
    laws: {
      succession: rng.int(0, 100),
      nobleRights: rng.int(0, 100),
      dragonRegulation: rng.int(0, 100),
      taxation: rng.int(0, 100)
    },
    factions,
    stability: rng.int(35, 80),
    dread: rng.int(0, 45),
    prosperity: rng.int(25, 85)
  };
}

export function councilPressure(kingdom: Kingdom): number {
  const factionPressure = kingdom.factions.reduce((sum, faction) => sum + faction.influence * (faction.grievance / 100), 0);
  return clamp(factionPressure / Math.max(1, kingdom.factions.length) - kingdom.stability * 0.35 + kingdom.dread * 0.15, 0, 100);
}

export function passLaw(world: GameWorld, kingdomId: Id, law: string, delta: number): GameWorld {
  const kingdom = world.kingdoms[kingdomId];
  if (!kingdom) throw new Error(`Unknown kingdom ${kingdomId}`);

  const nextKingdom: Kingdom = {
    ...kingdom,
    laws: { ...kingdom.laws, [law]: clamp((kingdom.laws[law] ?? 50) + delta, 0, 100) },
    stability: clamp(kingdom.stability - Math.abs(delta) * 0.2, 0, 100)
  };

  return { ...world, kingdoms: { ...world.kingdoms, [kingdomId]: nextKingdom } };
}

export function startWar(world: GameWorld, rng: Rng, name: string, attackerFactionId: Id, defenderFactionId: Id): GameWorld {
  const war: War = {
    id: id("war", rng),
    name,
    attackerFactionId,
    defenderFactionId,
    startedYear: world.year,
    score: 0,
    status: "preparing"
  };
  return { ...world, wars: { ...world.wars, [war.id]: war } };
}

export function advanceWar(world: GameWorld, rng: Rng, warId: Id): GameWorld {
  const war = world.wars[warId];
  if (!war || war.status === "ended") return world;

  const swing = rng.int(-22, 22);
  const nextScore = clamp(war.score + swing, -100, 100);
  const status = Math.abs(nextScore) >= 100 ? "ended" : "active";
  return {
    ...world,
    wars: {
      ...world.wars,
      [warId]: { ...war, score: nextScore, status }
    }
  };
}

export function factionMood(faction: Faction): "loyal" | "restless" | "rebellious" {
  if (faction.grievance > 75 && faction.influence > 45) return "rebellious";
  if (faction.grievance > 40) return "restless";
  return "loyal";
}
