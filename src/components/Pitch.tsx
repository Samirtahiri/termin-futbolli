"use client";

import { Avatar } from "@/components/PlayerRow";
import { Spinner } from "@/components/ui/Spinner";
import { useClickLock } from "@/hooks/useClickLock";
import { formationsFor, roleLabel, slotsFor } from "@/lib/formations";
import { KIT_BY_TEAM, teamKitLabel } from "@/lib/kits";
import { cx } from "@/lib/cx";
import type { FieldType, FormationId, MatchPlayer } from "@/lib/types";

export function Pitch({
  formation,
  fieldType,
  players,
  team,
  editable,
  onSelectSlot,
  onChangeFormation,
}: {
  formation: FormationId;
  fieldType: FieldType;
  players: MatchPlayer[];
  team: "A" | "B";
  editable?: boolean;
  onSelectSlot?: (slotIndex: number) => void;
  onChangeFormation?: (id: FormationId) => void;
}) {
  const slots = slotsFor(formation);
  const lock = useClickLock();

  return (
    <div className="space-y-2">
      <div className="px-1">
        <p className="text-sm font-semibold text-[#14241c]">{teamKitLabel(team)}</p>
        {editable ? (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {formationsFor(fieldType).map((id) => (
              <button
                key={id}
                type="button"
                disabled={lock.busy(`f-${id}`)}
                onClick={() =>
                  lock.run(`f-${id}`, () => onChangeFormation?.(id))
                }
                className={cx(
                  "h-8 rounded-full px-3 text-xs font-semibold ring-1",
                  formation === id
                    ? "bg-pitch-700 !text-white ring-pitch-700"
                    : "bg-white text-ink ring-line",
                )}
              >
                {id}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-xs text-ink-mute">{formation}</p>
        )}
      </div>
      <div className="relative aspect-[3/4] overflow-hidden rounded-[28px] bg-[linear-gradient(180deg,#1a8f4d_0%,#146c3a_50%,#0f5a30_100%)] ring-2 ring-white/40">
        <PitchMarks />
        {slots.map((slot) => {
          const player = players.find(
            (p) => p.slotIndex === slot.index && p.team === team,
          );
          return (
            <button
              key={slot.index}
              type="button"
              disabled={!editable || lock.busy(`s-${slot.index}`)}
              onClick={() =>
                lock.run(`s-${slot.index}`, () => onSelectSlot?.(slot.index))
              }
              className="absolute -translate-x-1/2 -translate-y-1/2 text-center disabled:opacity-60"
              style={{ left: `${slot.x}%`, top: `${slot.y}%` }}
            >
              {player ? (
                <span className="flex flex-col items-center gap-0.5">
                  <Avatar
                    name={player.name}
                    isGk={player.isGk}
                    kit={KIT_BY_TEAM[team]}
                    size="sm"
                  />
                  <span className="max-w-[72px] truncate text-[10px] font-semibold text-white drop-shadow">
                    {player.name.split(" ")[0]}
                  </span>
                </span>
              ) : (
                <span className="flex flex-col items-center gap-0.5">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-white/15 text-lg font-semibold leading-none text-white ring-1 ring-white/70">
                    {lock.busy(`s-${slot.index}`) ? (
                      <Spinner className="text-white" />
                    ) : (
                      "+"
                    )}
                  </span>
                  <span className="text-[10px] font-semibold text-white/90 drop-shadow">
                    {roleLabel(slot.role)}
                  </span>
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function PitchMarks() {
  return (
    <svg
      viewBox="0 0 100 140"
      className="absolute inset-0 h-full w-full"
      preserveAspectRatio="none"
    >
      <rect
        x="4"
        y="4"
        width="92"
        height="132"
        fill="none"
        stroke="rgba(255,255,255,0.45)"
        strokeWidth="1.2"
      />
      <line
        x1="4"
        y1="70"
        x2="96"
        y2="70"
        stroke="rgba(255,255,255,0.35)"
        strokeWidth="1"
      />
      <circle
        cx="50"
        cy="70"
        r="10"
        fill="none"
        stroke="rgba(255,255,255,0.35)"
        strokeWidth="1"
      />
      <rect
        x="28"
        y="4"
        width="44"
        height="16"
        fill="none"
        stroke="rgba(255,255,255,0.4)"
        strokeWidth="1"
      />
      <rect
        x="28"
        y="120"
        width="44"
        height="16"
        fill="none"
        stroke="rgba(255,255,255,0.4)"
        strokeWidth="1"
      />
    </svg>
  );
}

export function Bench({
  title,
  players,
  kit,
  onSelect,
}: {
  title: string;
  players: MatchPlayer[];
  kit?: "white" | "black";
  onSelect?: (id: string) => void;
}) {
  const lock = useClickLock();
  return (
    <div>
      <p className="mb-1.5 px-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-mute">
        {title}
      </p>
      <div className="flex flex-wrap gap-2">
        {players.length === 0 ? (
          <span className="text-xs text-ink-mute">Bosh</span>
        ) : (
          players.map((p) => (
            <button
              key={p.id}
              type="button"
              disabled={lock.busy(p.id)}
              onClick={() => lock.run(p.id, () => onSelect?.(p.id))}
              className="flex items-center gap-1.5 rounded-full bg-white px-2 py-1 ring-1 ring-line disabled:opacity-50"
            >
              <Avatar name={p.name} isGk={p.isGk} kit={kit} size="sm" />
              <span className="text-xs font-semibold">{p.name.split(" ")[0]}</span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
