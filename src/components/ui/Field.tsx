import { cx } from "@/lib/cx";

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-ink-soft">{label}</span>
      {children}
      {hint ? <span className="text-xs text-ink-mute">{hint}</span> : null}
    </label>
  );
}

const box =
  "w-full h-12 rounded-2xl border border-line bg-white px-3.5 text-base text-ink outline-none transition focus:border-pitch-600 focus:ring-4 focus:ring-pitch-700/10";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cx(box, props.className)} {...props} />;
}

export function Textarea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement>,
) {
  return (
    <textarea
      className={cx(box, "h-24 py-3 resize-none", props.className)}
      {...props}
    />
  );
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cx(box, props.className)} {...props} />;
}
