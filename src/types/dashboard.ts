import type { bandOrder } from "../lib/dashboard-helpers";

export type PerformanceBand = (typeof bandOrder)[number];

export type TrendDirection = "up" | "down" | "flat";
export type SkillFilterOption =
  | "All assessments"
  | "Dribbling"
  | "Passing"
  | "Vision"
  | "First Touch"
  | "Agility";

/** Five academy abilities (Analysis/preprocessing_scoring_archetype.ipynb + cluster.py). */
export type AbilityName = "Dribbling" | "Passing" | "Vision" | "Agility" | "First Touch";

export type DateRangeOption = "Last 6 sessions" | "Last 12 months" | "Full history";

export type DashboardMainTab = "Overview" | "Assessment Breakdown";

/** Shown only when the main tab is Assessment Breakdown. */
export type AssessmentSubTab = "Abilities" | "Cohort comparison" | "Progress over time";

export type PlayerScoreRecord = {
  player_name: string;
  session_date: string;
  assessment_name: string;
  category: string;
  aps_score: number;
  rps_score: number;
  percentile: number;
  performance_band: PerformanceBand;
  age_group: string;
  gender: string;
  cohort_name: string;
};

export type PlayerProfile = {
  playerName: string;
  ageGroup: string;
  gender: string;
  cohortName: string;
  trackingWindow: string;
};

export type SummaryMetric = {
  label: string;
  value: string;
  description: string;
  changeText: string;
  changeDirection: TrendDirection;
};

/** Monthly trend shown as SGI (30-99 display range). */
export type ProgressPoint = {
  label: string;
  rps: number;
};

export type DistributionBin = {
  score: number;
  count: number;
};

export type CohortDistribution = {
  cohortLabel: string;
  sampleSize: number;
  playerScore: number;
  bins: DistributionBin[];
};

export type AssessmentRow = {
  assessmentName: string;
  ability: AbilityName;
  apsScore: number;
  rpsScore: number;
  percentile: number;
  performanceBand: PerformanceBand;
  changeText: string;
  changeDirection: TrendDirection;
  latestSessionLabel: string;
};

export type AbilityBreakdownRow = {
  ability: AbilityName;
  avgAps: number;
  aggregateBand: PerformanceBand;
  tests: AssessmentRow[];
};

export type SkillProgressPoint = {
  label: string;
  score: number;
};

export type AssessmentHistoryItem = {
  /** Sort key (ISO day); not shown in assessment history table. */
  date: string;
  assessmentName: string;
  ability: AbilityName;
  /** Displayed cohort RPS / overall score on 30–99 scale. */
  sgiScore: number;
  tier: PerformanceBand;
};

/** Trainer-entered raw drill assessment (prototype local state; not merged into CSV pipeline). */
export type TrainerSavedAssessment = {
  id: string;
  playerId: string;
  category: AbilityName;
  equipment: string;
  assessmentName: string;
  skillFocus: string;
  description: string;
  duration: string;
  rawScore: number;
  scoreUnit?: string;
  timestamp: string;
  notes?: string;
  drillId: string;
};

export type ArchetypePoint = {
  label: string;
  x: number;
  y: number;
  color: string;
};

export type ArchetypeSummary = {
  primaryArchetype: string;
  summary: string;
  coachInsight: string;
  clusterPoints: ArchetypePoint[];
  playerPoint: ArchetypePoint;
  traits: {
    label: string;
    value: string;
  }[];
};

export type CohortInsightCopy = {
  title: string;
  comparisonGroup: string;
  plainLanguage: string;
  parentFriendly: string;
  rpsDefinition: string;
};

export type PlayerDashboardView = {
  id: string;
  profile: PlayerProfile;
  /** Trainer players list accent: 1 = ages 0–10 (tier letters A–B), 2 = 11–15 (C–D), 3 = 16+ (E–F+). */
  trainerAgeBracketGroup: 1 | 2 | 3;
  summaryMetrics: SummaryMetric[];
  progressTrend: ProgressPoint[];
  skillProgress: Record<AbilityName, SkillProgressPoint[]>;
  assessmentHistory: AssessmentHistoryItem[];
  cohortDistribution: CohortDistribution;
  /** Per-test rows (derived from CSV); nested under abilities in the UI. */
  assessmentBreakdown: AssessmentRow[];
  abilityBreakdown: AbilityBreakdownRow[];
  archetype: ArchetypeSummary;
  strengths: string[];
  improvements: string[];
  cohortInsight: CohortInsightCopy;
};

export type DashboardCollection = {
  players: PlayerDashboardView[];
};
