import { cx } from "@/lib/cx";

export function DeleteButton({
  label = "Fshi",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { label?: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cx(
        "grid h-9 w-9 shrink-0 place-items-center rounded-xl text-[#b91c1c] hover:bg-[#fee2e2] active:bg-[#fecaca]",
        className,
      )}
      {...props}
    >
      <TrashIcon />
    </button>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4.5 w-4.5 h-[18px] w-[18px]" fill="none" aria-hidden>
      <path
        d="M5 7h14M10 7V5h4v2M8 7l.7 12h6.6L16 7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
