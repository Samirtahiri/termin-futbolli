import type { MatchPlayer, Rating } from "./types";

export const DEFAULT_RATING = 5;

export function averageRating(rateeId: string, ratings: Rating[]): number {
  const scores = ratings.filter((r) => r.rateeId === rateeId).map((r) => r.score);
  if (scores.length === 0) return DEFAULT_RATING;
  return scores.reduce((a, b) => a + b, 0) / scores.length;
}

export function ratingCount(rateeId: string, ratings: Rating[]): number {
  return ratings.filter((r) => r.rateeId === rateeId).length;
}

export function myScore(
  raterKey: string | null,
  rateeId: string,
  ratings: Rating[],
): number | null {
  if (!raterKey) return null;
  return ratings.find((r) => r.raterKey === raterKey && r.rateeId === rateeId)
    ?.score ?? null;
}

export function formatRating(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

export function playerRating(player: MatchPlayer, ratings: Rating[]): number {
  return averageRating(player.personId, ratings);
}

export function teamRating(players: MatchPlayer[], ratings: Rating[]): number {
  if (players.length === 0) return 0;
  const sum = players.reduce((acc, p) => acc + playerRating(p, ratings), 0);
  return sum / players.length;
}
