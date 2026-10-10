const ALPH = "abcdefghjkmnpqrstuvwxyz23456789";

export function uid(prefix = ""): string {
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  const body = Array.from(bytes, (b) => ALPH[b % ALPH.length]).join("");
  return prefix ? `${prefix}_${body}` : body;
}

export function matchCode(): string {
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => ALPH[b % ALPH.length]).join("");
}

export function normalizeName(name: string): string {
  return name.trim().replace(/\s+/g, " ");
}

export function nameKey(name: string): string {
  return normalizeName(name).toLocaleLowerCase("sq");
}

export function initials(name: string): string {
  const parts = normalizeName(name).split(" ").filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
}

export function raterKey(input: {
  organizerId?: string | null;
  deviceKey?: string | null;
}): string | null {
  if (input.organizerId) return `org:${input.organizerId}`;
  if (input.deviceKey) return `dev:${input.deviceKey}`;
  return null;
}
