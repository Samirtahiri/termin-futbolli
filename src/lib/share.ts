import { fieldLabel } from "./capacity";
import { formatWhen } from "./format";
import type { Match } from "./types";

export function matchUrl(code: string): string {
  if (typeof window === "undefined") return `/t/${code}`;
  return `${window.location.origin}/t/${code}`;
}

export function organizerUrl(code: string, token: string): string {
  return `${matchUrl(code)}?org=${token}`;
}

export function shareText(match: Match): string {
  const { date, time } = formatWhen(match.startsAt);
  const title = match.title.trim() || "Termin";
  return [
    title,
    `${date} · ${time}`,
    match.location,
    `${fieldLabel(match.fieldType)} · kush In`,
    matchUrl(match.code),
  ]
    .filter(Boolean)
    .join("\n");
}

export function viberHref(text: string): string {
  return `viber://forward?text=${encodeURIComponent(text)}`;
}

export function whatsappHref(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}
