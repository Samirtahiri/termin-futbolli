import { cx } from "@/lib/cx";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "soft";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "bg-[#0d5a34] !text-white shadow-sm hover:bg-[#0a4628] active:bg-[#07331c]",
  secondary:
    "bg-[#faf8f3] !text-[#14241c] ring-1 ring-[#cfc8ba] hover:bg-[#ece7dc]",
  ghost: "bg-transparent !text-[#14241c] hover:bg-black/5",
  danger: "bg-[#b91c1c] !text-white hover:bg-[#991b1b]",
  soft: "bg-[#e5f4eb] !text-[#0d5a34] hover:bg-[#bfe0cd]",
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
  ...props
}: Props) {
  return (
    <button
      type={type}
      className={cx(
        "inline-flex items-center justify-center gap-2 font-semibold tracking-tight transition-colors disabled:opacity-40 disabled:pointer-events-none",
        variants[variant],
        sizes[size],
        block && "w-full",
        className,
      )}
      {...props}
    />
  );
}
