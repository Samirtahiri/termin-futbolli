import type { FieldType, FormationId, LargeFormation, Slot, SmallFormation } from "./types";

function line(roles: Slot["role"][], y: number, startIndex: number): Slot[] {
  const n = roles.length;
  return roles.map((role, i) => ({
    index: startIndex + i,
    role,
    x: n === 1 ? 50 : 18 + (64 * i) / Math.max(1, n - 1),
    y,
  }));
}

function build(
  rows: Array<{ role: Slot["role"]; count: number; y: number }>,
): Slot[] {
  const gk: Slot = { index: 0, role: "GK", x: 50, y: 90 };
  let idx = 1;
  const rest = rows.flatMap((row) => {
    const slots = line(
      Array.from({ length: row.count }, () => row.role),
      row.y,
      idx,
    );
    idx += row.count;
    return slots;
  });
  return [gk, ...rest];
}

const SMALL: Record<SmallFormation, Slot[]> = {
  "2-2-1": build([
    { role: "DEF", count: 2, y: 68 },
    { role: "MID", count: 2, y: 42 },
    { role: "ATT", count: 1, y: 16 },
  ]),
  "2-1-2": build([
    { role: "DEF", count: 2, y: 68 },
    { role: "MID", count: 1, y: 42 },
    { role: "ATT", count: 2, y: 16 },
  ]),
  "1-2-2": build([
    { role: "DEF", count: 1, y: 68 },
    { role: "MID", count: 2, y: 42 },
    { role: "ATT", count: 2, y: 16 },
  ]),
  "3-1-1": build([
    { role: "DEF", count: 3, y: 66 },
    { role: "MID", count: 1, y: 40 },
    { role: "ATT", count: 1, y: 16 },
  ]),
  "1-3-1": build([
    { role: "DEF", count: 1, y: 68 },
    { role: "MID", count: 3, y: 42 },
    { role: "ATT", count: 1, y: 16 },
  ]),
};

const LARGE: Record<LargeFormation, Slot[]> = {
  "4-4-2": build([
    { role: "DEF", count: 4, y: 70 },
    { role: "MID", count: 4, y: 42 },
    { role: "ATT", count: 2, y: 16 },
  ]),
  "4-3-3": build([
    { role: "DEF", count: 4, y: 70 },
    { role: "MID", count: 3, y: 42 },
    { role: "ATT", count: 3, y: 16 },
  ]),
  "3-5-2": build([
    { role: "DEF", count: 3, y: 70 },
    { role: "MID", count: 5, y: 42 },
    { role: "ATT", count: 2, y: 16 },
  ]),
  "4-2-3-1": build([
    { role: "DEF", count: 4, y: 74 },
    { role: "MID", count: 2, y: 52 },
    { role: "MID", count: 3, y: 32 },
    { role: "ATT", count: 1, y: 14 },
  ]),
  "3-4-3": build([
    { role: "DEF", count: 3, y: 70 },
    { role: "MID", count: 4, y: 42 },
    { role: "ATT", count: 3, y: 16 },
  ]),
  "5-3-2": build([
    { role: "DEF", count: 5, y: 70 },
    { role: "MID", count: 3, y: 42 },
    { role: "ATT", count: 2, y: 16 },
  ]),
};

export const SMALL_FORMATIONS = Object.keys(SMALL) as SmallFormation[];
export const LARGE_FORMATIONS = Object.keys(LARGE) as LargeFormation[];

export function defaultFormation(fieldType: FieldType): FormationId {
  return fieldType === "small" ? "2-2-1" : "4-3-3";
}

export function formationsFor(fieldType: FieldType): FormationId[] {
  return fieldType === "small" ? SMALL_FORMATIONS : LARGE_FORMATIONS;
}

export function slotsFor(formation: FormationId): Slot[] {
  if (formation in SMALL) return SMALL[formation as SmallFormation];
  return LARGE[formation as LargeFormation];
}

export function roleLabel(role: Slot["role"]): string {
  if (role === "GK") return "Portier";
  if (role === "DEF") return "Mbrojtës";
  if (role === "MID") return "Mesfushë";
  return "Sulm";
}
