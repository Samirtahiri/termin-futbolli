const DATE = new Intl.DateTimeFormat("sq-AL", {
  weekday: "short",
  day: "numeric",
  month: "short",
  timeZone: "Europe/Tirane",
});

const TIME = new Intl.DateTimeFormat("sq-AL", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "Europe/Tirane",
});

export function formatWhen(iso: string): { date: string; time: string } {
  const d = new Date(iso);
  return { date: DATE.format(d), time: TIME.format(d) };
}

export function formatWhenLong(iso: string): string {
  const { date, time } = formatWhen(iso);
  return `${date} · ${time}`;
}

export function formatClock(ms: number): string {
  return TIME.format(new Date(ms));
}

export function toLocalInputs(iso: string): { date: string; time: string } {
  const d = new Date(iso);
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  const [date, time] = local.toISOString().slice(0, 16).split("T");
  return { date: date ?? "", time: time ?? "21:00" };
}

export function fromLocalInputs(date: string, time: string): string {
  if (!date || !time) throw new Error("Zgjedh datën dhe orën.");
  const d = new Date(`${date}T${time}`);
  if (Number.isNaN(d.getTime())) throw new Error("Data ose ora s’është e saktë.");
  return d.toISOString();
}

export function todayInputs(): { date: string; time: string } {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return { date: local.toISOString().slice(0, 10), time: "21:00" };
}
