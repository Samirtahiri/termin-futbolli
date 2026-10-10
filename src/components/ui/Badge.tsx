import { cx } from "@/lib/cx";

type Tone = "green" | "amber" | "red" | "blue" | "ink" | "mute";

const tones: Record<Tone, string> = {
  green: "bg-[#e5f4eb] text-[#0d5a34]",
  amber: "bg-[#fff4d6] text-[#8a5a00]",
  red: "bg-[#fee2e2] text-[#b91c1c]",
  blue: "bg-[#dbeafe] text-[#1d4ed8]",
  ink: "bg-[#14241c]/5 text-[#14241c]",
  mute: "bg-[#ece7dc] text-[#3d5248]",
};

export function Badge({
  tone = "mute",
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cx(
        "inline-flex items-center h-6 px-2 rounded-full text-[11px] font-semibold",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
