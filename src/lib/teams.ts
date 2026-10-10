import { inPlayers } from "./capacity";
import { slotsFor } from "./formations";
import { playerRating } from "./ratings";
import type { FormationId, MatchPlayer, Rating, TeamSide } from "./types";

function shuffle<T>(list: T[]): T[] {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy;
}

function splitGks(players: MatchPlayer[]): {
  gks: MatchPlayer[];
  rest: MatchPlayer[];
} {
  const gks = players.filter((p) => p.isGk);
  const rest = players.filter((p) => !p.isGk);
  return { gks, rest };
}

function applyTeams(
  all: MatchPlayer[],
  a: MatchPlayer[],
  b: MatchPlayer[],
  formationA: FormationId,
  formationB: FormationId,
): MatchPlayer[] {
  const aSlots = assignSlots(a, formationA);
  const bSlots = assignSlots(b, formationB);
  const placed = new Map(
    [...aSlots, ...bSlots].map((p) => [p.id, p] as const),
  );
  return all.map((p) => placed.get(p.id) ?? { ...p, team: "unassigned", slotIndex: null });
}

export function assignSlots(players: MatchPlayer[], formation: FormationId): MatchPlayer[] {
  const slots = slotsFor(formation);
  const side: TeamSide = players[0]?.team === "B" ? "B" : "A";
  const gkSlot = slots.find((s) => s.role === "GK");
  const otherSlots = slots.filter((s) => s.role !== "GK");
  const gk = players.find((p) => p.isGk);
  const rest = players.filter((p) => p.id !== gk?.id);
  const used = new Set<string>();
  const result: MatchPlayer[] = [];

  if (gk && gkSlot) {
    result.push({ ...gk, team: side, slotIndex: gkSlot.index });
    used.add(gk.id);
  }

  rest.forEach((p, i) => {
    const slot = otherSlots[i];
    result.push({
      ...p,
      team: slot ? side : side === "A" ? "bench_a" : "bench_b",
      slotIndex: slot ? slot.index : null,
    });
    used.add(p.id);
  });

  players.forEach((p) => {
    if (!used.has(p.id)) result.push({ ...p, team: side, slotIndex: null });
  });

  return result;
}

export function splitRandom(
  players: MatchPlayer[],
  formationA: FormationId,
  formationB: FormationId,
): MatchPlayer[] {
  const ins = inPlayers(players);
  const { gks, rest } = splitGks(shuffle(ins));
  const a: MatchPlayer[] = [];
  const b: MatchPlayer[] = [];
  gks.forEach((gk, i) => (i % 2 === 0 ? a : b).push({ ...gk, team: i % 2 === 0 ? "A" : "B" }));
  shuffle(rest).forEach((p, i) => {
    const toA = a.length <= b.length;
    (toA ? a : b).push({ ...p, team: toA ? "A" : "B" });
  });
  return applyTeams(players, a, b, formationA, formationB);
}

export function splitByRating(
  players: MatchPlayer[],
  ratings: Rating[],
  formationA: FormationId,
  formationB: FormationId,
): MatchPlayer[] {
  const ins = inPlayers(players);
  const { gks, rest } = splitGks(ins);
  const rankedGks = [...gks].sort(
    (x, y) => playerRating(y, ratings) - playerRating(x, ratings),
  );
  const ranked = [...rest].sort(
    (x, y) => playerRating(y, ratings) - playerRating(x, ratings),
  );
  const a: MatchPlayer[] = [];
  const b: MatchPlayer[] = [];

  rankedGks.forEach((gk, i) => {
    (i % 2 === 0 ? a : b).push({ ...gk, team: i % 2 === 0 ? "A" : "B" });
  });

  ranked.forEach((p, i) => {
    const snakeToA = i % 4 === 0 || i % 4 === 3;
    (snakeToA ? a : b).push({ ...p, team: snakeToA ? "A" : "B" });
  });

  return applyTeams(players, a, b, formationA, formationB);
}

export function movePlayer(
  players: MatchPlayer[],
  playerId: string,
  team: TeamSide,
  slotIndex: number | null = null,
): MatchPlayer[] {
  return players.map((p) => {
    if (p.id !== playerId) {
      if (
        slotIndex !== null &&
        p.team === team &&
        p.slotIndex === slotIndex &&
        (team === "A" || team === "B")
      ) {
        return { ...p, slotIndex: null };
      }
      return p;
    }
    return { ...p, team, slotIndex };
  });
}

export function clearTeams(players: MatchPlayer[]): MatchPlayer[] {
  return players.map((p) =>
    p.status === "in" ? { ...p, team: "unassigned", slotIndex: null } : p,
  );
}

export function sidePlayers(
  players: MatchPlayer[],
  side: TeamSide,
): MatchPlayer[] {
  return inPlayers(players).filter((p) => p.team === side);
}

export function relayoutTeam(
  players: MatchPlayer[],
  team: "A" | "B",
  formation: FormationId,
): MatchPlayer[] {
  const field = inPlayers(players).filter((p) => p.team === team);
  if (field.length === 0) return players;
  const laid = assignSlots(
    field.map((p) => ({ ...p, team })),
    formation,
  );
  const map = new Map(laid.map((p) => [p.id, p] as const));
  return players.map((p) => map.get(p.id) ?? p);
}
