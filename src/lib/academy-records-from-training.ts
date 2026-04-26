import type { AcademyAssessmentRecord, AcademyPerformanceBand } from "../types/academy-overview";
import { tierLetterToAgeGroupLabel } from "./age-group-labels";
import { clampDisplayedScore, getTier } from "./dashboard-helpers";
import type { TrainingSessionRowWithPct } from "./training-session-csv";

function bandFromPercentile(pct: number): AcademyPerformanceBand {
  return getTier(pct);
}

/** One academy row per training row; bands and scores come from within-(category, drill) percentiles. */
export function buildAcademyAssessmentRecords(rows: TrainingSessionRowWithPct[]): AcademyAssessmentRecord[] {
  return rows.map((r) => {
    const gender = r.genderRaw === "female" ? "Female" : "Male";
    const age_group = tierLetterToAgeGroupLabel(r.ageLetter);
    const pct = Math.round(r.percentile);
    return {
      player_id: `${r.firstName}_${r.lastName}_${gender}`.replace(/\s+/g, "_"),
      player_name: `${r.firstName} ${r.lastName}`.trim(),
      assessment_date: r.isoDate,
      age_group,
      gender,
      cohort: `${age_group} ${gender}`,
      performance_band: bandFromPercentile(r.percentile),
      assessment_score: clampDisplayedScore(pct),
    };
  });
}
