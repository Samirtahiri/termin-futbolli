import type { TeamSide } from "./types";

export type Kit = "white" | "black";

export const KIT_BY_TEAM: Record<"A" | "B", Kit> = {
  A: "white",
  B: "black",
};

export function kitOf(team: TeamSide): Kit | null {
  if (team === "A" || team === "bench_a") return "white";
  if (team === "B" || team === "bench_b") return "black";
  return null;
}

export function kitLabel(kit: Kit): string {
  return kit === "white" ? "Të bardha" : "Të zeza";
}

export function teamKitLabel(team: "A" | "B"): string {
  return team === "A" ? "Ekipi A · Të bardha" : "Ekipi B · Të zeza";
}

export function kitAvatarClass(kit: Kit, isGk?: boolean): string {
  if (kit === "white") {
    return isGk
      ? "bg-white text-[#8a5a00] ring-2 ring-[#c48800]"
      : "bg-white text-[#14241c] ring-1 ring-[#cfc8ba]";
  }
  return isGk
    ? "bg-[#111] text-[#f5c518] ring-2 ring-[#f5c518]"
    : "bg-[#111] text-white ring-1 ring-[#111]";
}
