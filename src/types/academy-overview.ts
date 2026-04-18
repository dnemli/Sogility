/** Raw assessment rows — connect API / scoring pipeline here later. */
export type AcademyAssessmentRecord = {
  player_id: string;
  player_name: string;
  assessment_date: string;
  age_group: string;
  gender: string;
  cohort: string;
  performance_band: AcademyPerformanceBand;
  assessment_score: number;
};

export type AcademyPerformanceBand = "Foundation" | "Developing" | "Elite";

export type OverviewDateRangePreset =
  | "Last 30 days"
  | "Last 60 days"
  | "Last 90 days"
  | "Last 12 months";

export type OverviewGranularity = "weekly" | "monthly";

export type AgeGroupFilter = "All" | string;

export type GenderFilter = "All" | "Female" | "Male";

export type OverviewKpiMetric = {
  label: string;
  value: string;
  description: string;
  changeText?: string;
  changeDirection?: "up" | "down" | "flat";
};

export type ParticipationPoint = {
  label: string;
  uniquePlayers: number;
};

export type EngagementSummary = {
  totalUniquePlayers: number;
  assessedLast60Days: number;
  assessedMoreThanOnce: number;
  repeatAssessmentRate: number;
};

export type ReturnCohortPoint = {
  label: string;
  pctReturned: number;
  sampleSize: number;
};

export type ActivitySegment = {
  segment: "One-time" | "Returning" | "Highly active";
  count: number;
  pct: number;
};

export type AvgDaysByAgeRow = {
  age_group: string;
  avgDays: number;
  medianDays: number;
  samplePlayers: number;
};

export type AgeGenderBin = {
  age_group: string;
  female: number;
  male: number;
  total: number;
};

export type CohortBandRow = {
  cohort: string;
  Foundation: number;
  Developing: number;
  Elite: number;
  total: number;
};
