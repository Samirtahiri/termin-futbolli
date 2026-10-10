import { useClickLock } from "@/hooks/useClickLock";
import { cx } from "@/lib/cx";

export function RatingScale({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (score: number) => void;
}) {
  const lock = useClickLock();
  return (
    <div className="space-y-1.5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-mute">
        Nota 1–10
      </p>
      <div className="grid grid-cols-5 gap-1.5">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            type="button"
            disabled={lock.busy(String(n))}
            onClick={() => lock.run(String(n), () => onChange(n))}
            className={cx(
              "grid h-11 place-items-center rounded-xl text-sm font-bold ring-1 disabled:opacity-50",
              value === n
                ? "bg-pitch-700 !text-white ring-pitch-700"
                : "bg-white text-ink ring-line",
            )}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}
