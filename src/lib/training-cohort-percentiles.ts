import { trainingSessionCategoryDrillKey, type TrainingSessionRowWithPct } from "./training-session-csv";

export type TrainingSessionRowEnriched = TrainingSessionRowWithPct & { cohortPercentile: number };

/** Percentile of raw score within the same age tier + gender + (category, drill) slice. */
export function addCohortDrillPercentiles(rows: TrainingSessionRowWithPct[]): TrainingSessionRowEnriched[] {
  const by = new Map<string, number[]>();
  for (const r of rows) {
    const k = `${r.ageLetter}|${r.genderRaw}|${trainingSessionCategoryDrillKey(r)}`;
    by.set(k, [...(by.get(k) ?? []), r.score]);
  }

  return rows.map((r) => {
    const k = `${r.ageLetter}|${r.genderRaw}|${trainingSessionCategoryDrillKey(r)}`;
    const scores = by.get(k) ?? [r.score];
    const below = scores.filter((s) => s < r.score).length;
    const equal = scores.filter((s) => s === r.score).length;
    const cohortPercentile = scores.length === 0 ? 50 : ((below + equal / 2) / scores.length) * 100;
    return { ...r, cohortPercentile };
  });
}
