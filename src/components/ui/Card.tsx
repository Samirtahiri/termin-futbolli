import { cx } from "@/lib/cx";

export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx(
        "rounded-3xl bg-white ring-1 ring-line shadow-[0_1px_0_rgba(20,36,28,0.03)]",
        className,
      )}
      {...props}
    />
  );
}

export function SectionTitle({
  kicker,
  title,
  action,
}: {
  kicker?: string;
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-3 mb-3 px-1">
      <div>
        {kicker ? (
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-pitch-700">
            {kicker}
          </p>
        ) : null}
        <h2 className="text-lg font-semibold tracking-tight text-ink">{title}</h2>
      </div>
      {action}
    </div>
  );
}
