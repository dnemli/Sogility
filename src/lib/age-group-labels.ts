/**
 * Academy age groups (1–3) derived from CSV tier letters.
 * Used everywhere we show cohort age so player + overview stay consistent.
 *
 * Mapping: younger tiers (B–C) → 1, middle (D–E) → 2, oldest (F+) → 3.
 * Unknown letters default to group 3 so they still bucket cleanly.
 */
const GROUP_1 = new Set(["A", "B", "C"]);
const GROUP_2 = new Set(["D", "E"]);

export function tierLetterToAgeGroupLabel(letter: string): "Age group 1" | "Age group 2" | "Age group 3" {
  const L = letter.trim().toUpperCase();
  if (GROUP_1.has(L)) return "Age group 1";
  if (GROUP_2.has(L)) return "Age group 2";
  return "Age group 3";
}
