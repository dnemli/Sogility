import type { AcademyAssessmentRecord, AcademyPerformanceBand } from "../types/academy-overview";
import type { TrainingSessionRowWithPct } from "./training-session-csv";

function bandFromPercentile(pct: number): AcademyPerformanceBand {
  if (pct < 33.34) return "Foundation";
  if (pct < 66.67) return "Developing";
  return "Elite";
}

/** One academy row per training row; bands and scores come from within-(category, drill) percentiles. */
export function buildAcademyAssessmentRecords(rows: TrainingSessionRowWithPct[]): AcademyAssessmentRecord[] {
  return rows.map((r) => {
    const gender = r.genderRaw === "female" ? "Female" : "Male";
    const age_group = `Tier ${r.ageLetter}`;
    const pct = Math.round(r.percentile);
    return {
      player_id: `${r.firstName}_${r.lastName}_${gender}`.replace(/\s+/g, "_"),
      player_name: `${r.firstName} ${r.lastName}`.trim(),
      assessment_date: r.isoDate,
      age_group,
      gender,
      cohort: `${age_group} ${gender}`,
      performance_band: bandFromPercentile(r.percentile),
      assessment_score: pct,
    };
  });
}
