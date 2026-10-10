"use client";

import { PlayerRow } from "@/components/PlayerRow";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { kitOf } from "@/lib/kits";
import { averageRating } from "@/lib/ratings";
import type { MatchPlayer, Rating } from "@/lib/types";

function placeLabel(player: MatchPlayer): string {
  if (player.team === "A") return "Të bardha";
  if (player.team === "B") return "Të zeza";
  if (player.team === "bench_a") return "Stoli bardhë";
  if (player.team === "bench_b") return "Stoli zezë";
  return "Pa ekip";
}

export function PlayerPickerSheet({
  title,
  players,
  ratings,
  currentId,
  onPick,
  onClear,
  onClose,
}: {
  title: string;
  players: MatchPlayer[];
  ratings: Rating[];
  currentId?: string | null;
  onPick: (playerId: string) => void;
  onClear?: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-40 flex flex-col justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-ink/40"
        aria-label="Mbyll"
        onClick={onClose}
      />
      <div className="relative z-10 max-h-[78dvh] overflow-y-auto rounded-t-[28px] bg-cream px-4 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-3">
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-line" />
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-pitch-700">
              Pozita
            </p>
            <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
            <p className="text-sm text-ink-soft">Zgjidh lojtarin që është In.</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Mbyll
          </Button>
        </div>
        {currentId && onClear ? (
          <Button variant="secondary" block className="mb-3" onClick={onClear}>
            Hiq nga pozita
          </Button>
        ) : null}
        <Card className="divide-y divide-line overflow-hidden">
          {players.length === 0 ? (
            <p className="p-4 text-sm text-ink-soft">Nuk ka lojtarë In.</p>
          ) : (
            players.map((p) => (
              <PlayerRow
                key={p.id}
                player={p}
                rating={averageRating(p.personId, ratings)}
                kit={kitOf(p.team)}
                selected={p.id === currentId}
                onClick={() => onPick(p.id)}
                right={
                  <span className="text-[11px] font-semibold text-ink-mute">
                    {placeLabel(p)}
                  </span>
                }
              />
            ))
          )}
        </Card>
      </div>
    </div>
  );
}
