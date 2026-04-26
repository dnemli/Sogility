export const bandOrder = [
  "Foundation",
  "Developing",
  "Approaching",
  "Strong",
  "Elite",
] as const;
export type ScoreTier = (typeof bandOrder)[number];

const DISPLAY_MIN = 30;
const DISPLAY_MAX = 99;

export const bandColorMap = {
  Foundation: "bg-rose-400",
  Developing: "bg-amber-300",
  Approaching: "bg-lime-300",
  Strong: "bg-sky-400",
  Elite: "bg-violet-300",
} as const;

export const bandTextMap = {
  Foundation: "bg-rose-100 text-rose-700",
  Developing: "bg-amber-100 text-amber-700",
  Approaching: "bg-lime-100 text-lime-700",
  Strong: "bg-sky-100 text-sky-700",
  Elite: "bg-violet-100 text-violet-700",
} as const;

/** SGI display range (per scope): 30-99. */
export function clampDisplayedScore(score: number): number {
  if (!Number.isFinite(score)) return DISPLAY_MIN;
  return Math.max(DISPLAY_MIN, Math.min(DISPLAY_MAX, score));
}

/** Finalized SGI tiers from PRODUCT_SCOPE.md. */
export function getTier(score: number): ScoreTier {
  if (!Number.isFinite(score)) return "Foundation";
  if (score <= 30) return "Foundation";
  if (score <= 49) return "Developing";
  if (score <= 69) return "Approaching";
  if (score <= 89) return "Strong";
  return "Elite";
}

export function getTierColor(score: number): string {
  return bandColorMap[getTier(score)];
}

export function getScoreChange(current: number, previous: number): string {
  if (!Number.isFinite(current) || !Number.isFinite(previous)) return "No prior score";
  const delta = current - previous;
  if (Math.abs(delta) < 0.05) return "No change";
  const rounded = Math.round(delta * 10) / 10;
  return `${rounded > 0 ? "+" : ""}${rounded.toFixed(1)} vs previous`;
}
