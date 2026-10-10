import type { FieldType, Match, MatchPlayer } from "./types";

export function fieldNeeds(fieldType: FieldType): {
  outfield: number;
  gk: number;
} {
  return fieldType === "small"
    ? { outfield: 10, gk: 2 }
    : { outfield: 20, gk: 2 };
}

export function fieldLabel(fieldType: FieldType): string {
  return fieldType === "small" ? "5+1" : "10+1";
}

export function inPlayers(players: MatchPlayer[]): MatchPlayer[] {
  return players
    .filter((p) => p.status === "in")
    .sort((a, b) => a.joinedAt - b.joinedAt);
}

export function waitlistPlayers(players: MatchPlayer[]): MatchPlayer[] {
  return players
    .filter((p) => p.status === "waitlist")
    .sort((a, b) => a.joinedAt - b.joinedAt);
}

export function matchProgress(match: Match, players: MatchPlayer[]) {
  const need = fieldNeeds(match.fieldType);
  const ins = inPlayers(players);
  const gk = ins.filter((p) => p.isGk).length;
  const outfield = ins.filter((p) => !p.isGk).length;
  return {
    outfield,
    gk,
    needOutfield: need.outfield,
    needGk: need.gk,
    missingOutfield: Math.max(0, need.outfield - outfield),
    missingGk: Math.max(0, need.gk - gk),
    isFull: outfield >= need.outfield && gk >= need.gk,
    waitlist: waitlistPlayers(players).length,
    totalIn: ins.length,
  };
}

export function missingLabel(match: Match, players: MatchPlayer[]): string | null {
  const p = matchProgress(match, players);
  if (p.isFull) return null;
  const bits: string[] = [];
  if (p.missingOutfield) bits.push(`${p.missingOutfield} lojtarë`);
  if (p.missingGk) bits.push(`${p.missingGk} GK`);
  return `Mungojnë ${bits.join(" · ")}`;
}

export function nextJoinStatus(
  match: Match,
  players: MatchPlayer[],
  incoming: { isGk: boolean },
): "in" | "waitlist" {
  const need = fieldNeeds(match.fieldType);
  const ins = inPlayers(players);
  const gk = ins.filter((p) => p.isGk).length;
  const outfield = ins.filter((p) => !p.isGk).length;
  const benchCap = Math.max(0, match.benchSize) * 2;
  const fieldCap = need.outfield + need.gk;

  if (incoming.isGk && gk < need.gk) return "in";
  if (!incoming.isGk && outfield < need.outfield) return "in";
  if (ins.length < fieldCap + benchCap) return "in";
  return "waitlist";
}
