import { matchProgress } from "@/lib/capacity";
import type { Match, MatchPlayer } from "@/lib/types";
import { cx } from "@/lib/cx";

export function ProgressStats({
  match,
  players,
}: {
  match: Match;
  players: MatchPlayer[];
}) {
  const p = matchProgress(match, players);
  return (
    <div className={cx("grid gap-2", p.waitlist ? "grid-cols-3" : "grid-cols-2")}>
      <Stat
        label="Lojtarë"
        value={`${p.outfield}/${p.needOutfield}`}
        ok={p.outfield >= p.needOutfield}
      />
      <Stat label="GK" value={`${p.gk}/${p.needGk}`} ok={p.gk >= p.needGk} />
      {p.waitlist ? (
        <Stat label="Pritje" value={String(p.waitlist)} ok={false} />
      ) : null}
    </div>
  );
}

function Stat({
  label,
  value,
  ok,
}: {
  label: string;
  value: string;
  ok: boolean;
}) {
  return (
    <div
      className={cx(
        "rounded-2xl px-3.5 py-3 ring-1",
        ok
          ? "bg-pitch-50 ring-pitch-700/10"
          : "bg-white ring-line",
      )}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-mute">
        {label}
      </p>
      <p className="mt-0.5 text-2xl font-semibold tracking-tight text-ink">
        {value}
      </p>
    </div>
  );
}
