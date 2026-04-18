import type { bandOrder } from "../lib/dashboard-helpers";

export type PerformanceBand = (typeof bandOrder)[number];

export type TrendDirection = "up" | "down" | "flat";
export type SkillFilterOption =
  | "All assessments"
  | "Ball Mastery"
  | "Passing"
  | "First Touch"
  | "Decision Making"
  | "Speed & Agility"
  | "Explosiveness";

export type DateRangeOption = "Last 6 sessions" | "Last 12 months" | "Full history";
export type DashboardTab =
  | "Overview"
  | "Assessment Breakdown"
  | "Cohort Comparison"
  | "Progress Over Time";

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

export type ProgressPoint = {
  label: string;
  aps: number;
  rps: number;
  percentile: number;
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
  category: Exclude<SkillFilterOption, "All assessments">;
  apsScore: number;
  rpsScore: number;
  percentile: number;
  performanceBand: PerformanceBand;
  changeText: string;
  changeDirection: TrendDirection;
  latestSessionLabel: string;
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
  summaryMetrics: SummaryMetric[];
  progressTrend: ProgressPoint[];
  cohortDistribution: CohortDistribution;
  assessmentBreakdown: AssessmentRow[];
  archetype: ArchetypeSummary;
  strengths: string[];
  improvements: string[];
  cohortInsight: CohortInsightCopy;
};

export type DashboardCollection = {
  ageGroups: string[];
  genders: string[];
  skillFilters: SkillFilterOption[];
  dateRanges: DateRangeOption[];
  players: PlayerDashboardView[];
};
