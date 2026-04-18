/**
 * Single source of truth: `Data/training_session.csv` (bundled at build time).
 * All dashboard figures derive from parsed rows + percentile transforms — no hand-entered KPIs.
 */
import trainingCsv from "../../Data/training_session.csv?raw";
import { buildAcademyAssessmentRecords } from "../lib/academy-records-from-training";
import { buildDashboardCollectionFromTraining } from "../lib/dashboard-from-training";
import { addCohortDrillPercentiles } from "../lib/training-cohort-percentiles";
import { addPercentiles, parseTrainingSessionCsv } from "../lib/training-session-csv";
import { parseDay } from "../lib/academy-overview-helpers";

const rawRows = parseTrainingSessionCsv(trainingCsv);
const rowsWithPct = addPercentiles(rawRows);
export const trainingSessionRows = addCohortDrillPercentiles(rowsWithPct);

export const academyAssessmentRecords = buildAcademyAssessmentRecords(rowsWithPct);

export const dashboardCollection = buildDashboardCollectionFromTraining(trainingSessionRows);

/** Latest session date in the extract — drives date-range presets on the Overview. */
export const reportingDateEnd = trainingSessionRows.reduce(
  (max, r) => (r.sessionDate > max ? r.sessionDate : max),
  trainingSessionRows[0]!.sessionDate,
);

/** Earliest session date in `training_session.csv` — used for the “Full data (CSV)” overview range. */
export const reportingDateStart = trainingSessionRows.reduce(
  (min, r) => (r.sessionDate < min ? r.sessionDate : min),
  trainingSessionRows[0]!.sessionDate,
);

export const reportingDateEndLabel = reportingDateEnd.toLocaleDateString("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

const tierSet = new Set<string>();
for (const r of academyAssessmentRecords) {
  tierSet.add(r.age_group);
}
export const overviewAgeGroupOptions = ["All", ...[...tierSet].sort()] as const;

export const overviewGenderOptions = ["All", "Female", "Male"] as const;

export const overviewDateRangeOptions = [
  "Full data (CSV)",
  "Last 30 days",
  "Last 60 days",
  "Last 90 days",
  "Last 12 months",
] as const;

/** Useful for sanity checks or future exports. */
export function getAssessmentDateBounds() {
  let min = parseDay(academyAssessmentRecords[0]!.assessment_date);
  let max = min;
  for (const r of academyAssessmentRecords) {
    const d = parseDay(r.assessment_date);
    if (d < min) min = d;
    if (d > max) max = d;
  }
  return { min, max };
}
