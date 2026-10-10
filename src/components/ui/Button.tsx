import { useState } from "react";
import { Spinner } from "@/components/ui/Spinner";
import { cx } from "@/lib/cx";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "soft" | "inverse";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary: "shadow-sm hover:bg-[#0a4628] active:bg-[#07331c]",
  secondary: "ring-1 ring-[#cfc8ba] hover:bg-[#ece7dc]",
  ghost: "hover:bg-black/5",
  danger: "hover:bg-[#991b1b]",
  soft: "hover:bg-[#bfe0cd]",
  inverse: "hover:bg-[#f4f1ea]",
};

const paint: Record<Variant, { backgroundColor: string; color: string }> = {
  primary: { backgroundColor: "#0d5a34", color: "#ffffff" },
  secondary: { backgroundColor: "#faf8f3", color: "#0d5a34" },
  ghost: { backgroundColor: "transparent", color: "#0d5a34" },
  danger: { backgroundColor: "#b91c1c", color: "#ffffff" },
  soft: { backgroundColor: "#e5f4eb", color: "#0d5a34" },
  inverse: { backgroundColor: "#ffffff", color: "#0d5a34" },
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3 text-sm rounded-xl",
  md: "h-11 px-4 text-sm rounded-2xl",
  lg: "h-12 px-5 text-base rounded-2xl",
};

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  block?: boolean;
};

export function Button({
  variant = "primary",
  size = "md",
  block,
  className,
  type = "button",
  style,
  disabled,
  onClick,
  children,
  ...props
}: Props) {
  const [locked, setLocked] = useState(false);
  const waiting = Boolean(disabled || locked);

  return (
    <button
      type={type}
      disabled={waiting}
      aria-busy={locked}
      onClick={(event) => {
        if (waiting) return;
        setLocked(true);
        onClick?.(event);
        window.setTimeout(() => setLocked(false), 800);
      }}
      className={cx(
        "inline-flex items-center justify-center gap-2 font-semibold tracking-tight transition-colors disabled:opacity-40 disabled:pointer-events-none",
        variants[variant],
        sizes[size],
        block && "w-full",
        className,
      )}
      style={{ ...paint[variant], ...style }}
      {...props}
    >
      {locked ? <Spinner /> : null}
      {children}
    </button>
  );
}
