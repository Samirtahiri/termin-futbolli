import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { initials } from "@/lib/id";
import { kitAvatarClass, type Kit } from "@/lib/kits";
import { formatRating } from "@/lib/ratings";
import { cx } from "@/lib/cx";
import type { MatchPlayer } from "@/lib/types";

export function Avatar({
  name,
  isGk,
  kit,
  size = "md",
}: {
  name: string;
  isGk?: boolean;
  kit?: Kit | null;
  size?: "sm" | "md";
}) {
  return (
    <span
      className={cx(
        "grid shrink-0 place-items-center rounded-full font-semibold",
        size === "sm" ? "h-8 w-8 text-[11px]" : "h-10 w-10 text-xs",
        kit
          ? kitAvatarClass(kit, isGk)
          : isGk
            ? "bg-[#c48800] text-white"
            : "bg-[#0d5a34] text-white",
      )}
    >
      {initials(name)}
    </span>
  );
}

export function PlayerRow({
  player,
  rating,
  kit,
  right,
  onClick,
  selected,
}: {
  player: Pick<MatchPlayer, "name" | "isGk"> & { status?: MatchPlayer["status"] };
  rating?: number;
  kit?: Kit | null;
  right?: React.ReactNode;
  onClick?: () => void;
  selected?: boolean;
}) {
  const [locked, setLocked] = useState(false);

  return (
    <div
      role={onClick ? "button" : undefined}
      aria-busy={locked}
      onClick={() => {
        if (!onClick || locked) return;
        setLocked(true);
        onClick();
        window.setTimeout(() => setLocked(false), 800);
      }}
      className={cx(
        "flex items-center gap-3 px-3.5 py-2.5",
        onClick && "cursor-pointer active:bg-cream-50",
        (onClick && locked) && "pointer-events-none opacity-60",
        selected && "bg-pitch-50",
      )}
    >
      <Avatar name={player.name} isGk={player.isGk} kit={kit} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-ink">{player.name}</p>
        <div className="mt-0.5 flex items-center gap-1.5">
          {player.isGk ? <Badge tone="amber">GK</Badge> : null}
          {rating !== undefined ? (
            <span className="text-xs text-ink-mute">{formatRating(rating)}</span>
          ) : null}
        </div>
      </div>
      {locked ? <Spinner className="text-pitch-700" /> : right}
    </div>
  );
}
