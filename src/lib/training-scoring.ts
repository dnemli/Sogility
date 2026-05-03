/**
 * TypeScript ports of Analysis/final_aps_new.py (APS + bands) and Analysis/final_rps.py
 * (cohort sigmoid RPS 30–99). Used by the dashboard pipeline only — no Python at runtime.
 */
import type { AbilityName, PerformanceBand } from "../types/dashboard";
import { categoryDrillAssessmentKey } from "./assessment-to-ability";
import { performanceBandFromAps } from "./dashboard-helpers";
import type { TrainingSessionRow } from "./training-session-csv";
import { playerKey } from "./training-session-csv";

const MIN_COHORT_N = 30;
const S_SPAN = 1.0986;
const RPS_MIN = 30;
const RPS_MAX = 99;
const RPS_RANGE = RPS_MAX - RPS_MIN;
const SPAN_PERCENTILE = 0.75;

/** Cohort key for scoring (matches Python age_map on letters A–F). */
export function pythonAgeGroupFromLetter(letter: string): 1 | 2 | 3 {
  const L = letter.trim().toUpperCase();
  if (L === "A" || L === "B") return 1;
  if (L === "C" || L === "D") return 2;
  if (L === "E" || L === "F") return 3;
  return 3;
}

/**
 * Player identity for APS + sigmoid groupbys — matches both notebooks’ `player_cols`
 * (first/last/gender + numeric `age_group`), not the UI `playerKey` (name + gender only).
 */
export function scoringPlayerKey(
  r: Pick<TrainingSessionRow, "firstName" | "lastName" | "genderRaw" | "ageLetter">,
): string {
  return `${playerKey(r)}|${pythonAgeGroupFromLetter(r.ageLetter)}`;
}

function genderMF(g: TrainingSessionRow["genderRaw"]): "M" | "F" {
  return g === "female" ? "F" : "M";
}

const LOG_TRANSFORM_KEYS = new Set([
  "Circuit Training Knockout",
  "Circuit Training Knockout-Obstacle",
  "Freelap 10yd Dash",
  "Freelap 10yd Dash Ball",
  "Freelap 20yd Dash",
  "Freelap 20yd Dash Ball",
  "RoxPro 5-10-5 shuttle",
  "RoxPro Sprint-10 yrd",
]);

function applyEarlyLog(categoryAssessment: string, score: number): number {
  if (!LOG_TRANSFORM_KEYS.has(categoryAssessment)) return score;
  if (score <= 0 || !Number.isFinite(score)) return NaN;
  return Math.log(score);
}

const HIGHER_IS_BETTER: Record<string, boolean> = {
  "Broad Jump 5-10-5 Shuttles": false,
  "Circuit Training Knockout": false,
  "Circuit Training Knockout-Obstacle": false,
  "Freelap 10yd Dash": false,
  "Freelap 10yd Dash Ball": false,
  "Freelap 20yd Dash": false,
  "Freelap 20yd Dash Ball": false,
  "RoxPro 5-10-5 shuttle": false,
  "RoxPro Sprint-10 yrd": false,
  "Broad Jump Horizontal": true,
  "Circuit Training Maestro": true,
  "Circuit Training Pass Find 1": true,
  "Circuit Training Vision": true,
  "Fast Feet Architect": true,
  "Fast Feet Maestro": true,
  "Fast Feet Vision": true,
  "ICON 4M Architect": true,
  "ICON 4M Maestro": true,
  "ICON 4M Vision": true,
  "ICON Q Pass Find 2": true,
  "ICON V2 Architect": true,
  "ICON V2 Maestro": true,
  "ICON V2 Vision": true,
  "Reflexion Edge Hand Eye Coordination": true,
  "Reflexion Edge Inhibition": true,
  "Reflexion Edge Prioritization": true,
  "Reflexion Edge Reaction Time": true,
  "Reflexion Edge Tracking": true,
  "Tech Touch Ground & Tech Touch Air Receive 10 Air": true,
  "Tech Touch Ground & Tech Touch Air Receive 10 Ground": true,
  "Tech Touch One Touch Pass Pass 10 Air": true,
  "Tech Touch One Touch Pass Pass 10 Ground": true,
  "Vertical Jump Vertical": true,
  "Circuit Maestro": true,
  "Circuit Vision": true,
  "Circuit Pass find 1": true,
  "ICON Q Pass find 2": true,
  "TechTouch 1st Touch - Air": true,
  "TechTouch 1st touch - ground": true,
  "Vision Wall GO 360": true,
  "Vision Wall Scan & React": true,
  "Vision Wall Large to Small": true,
  "Vision Wall Balance Reaction": true,
};

const DEFAULT_HIGHER_IS_BETTER = true;

/** APS / benchmark notebook category (includes Unmapped). */
export type ApsCategoryName = AbilityName | "Unmapped";

export function mapApsCategory(categoryAssessment: string): ApsCategoryName {
  const a = categoryAssessment.toLowerCase();
  if (a.includes("circuit")) return "Dribbling";
  if (a.includes("icon")) return "Passing";
  if (a.includes("tech touch") || a.includes("techtouch") || a.includes("1st touch") || a.includes("one touch")) {
    return "First Touch";
  }
  if (
    a.includes("5-10-5") ||
    a.includes("shuttle") ||
    a.includes("sprint") ||
    a.includes("10yd") ||
    a.includes("10 yd") ||
    a.includes("10yrd") ||
    a.includes("10 yrd") ||
    a.includes("dash")
  ) {
    return "Agility";
  }
  if (
    a.includes("go 360") ||
    a.includes("scan") ||
    a.includes("react") ||
    a.includes("reaction") ||
    a.includes("large to small") ||
    a.includes("small to large") ||
    a.includes("balance") ||
    a.includes("vision wall") ||
    a.includes("roxpro") ||
    a.includes("reflection edge")
  ) {
    return "Vision";
  }
  return "Unmapped";
}

function interpolateScore(x: number, x0: number, x1: number, y0: number, y1: number): number {
  if (!Number.isFinite(x0) || !Number.isFinite(x1) || x1 === x0) return NaN;
  return y0 + ((x - x0) * (y1 - y0)) / (x1 - x0);
}

function apsFromBenchmarks(
  score: number,
  q30: number,
  q50: number,
  q70: number,
  q90: number,
  higherIsBetter: boolean,
): number {
  if (![score, q30, q50, q70, q90].every((v) => Number.isFinite(v))) return NaN;

  let s = score;
  let qa = q30;
  let qb = q50;
  let qc = q70;
  let qd = q90;

  if (!higherIsBetter) {
    s = -s;
    const flipped = [-qd, -qc, -qb, -qa].sort((x, y) => x - y);
    [qa, qb, qc, qd] = flipped;
  }

  let aps: number;
  if (s <= qa) {
    aps = interpolateScore(s, qa - (qb - qa), qa, 0, 30);
  } else if (s <= qb) {
    aps = interpolateScore(s, qa, qb, 30, 50);
  } else if (s <= qc) {
    aps = interpolateScore(s, qb, qc, 50, 70);
  } else if (s <= qd) {
    aps = interpolateScore(s, qc, qd, 70, 90);
  } else {
    aps = interpolateScore(s, qd, qd + (qd - qc), 90, 100);
  }
  if (!Number.isFinite(aps)) return NaN;
  return Math.max(0, Math.min(100, aps));
}

function quantile(sorted: number[], q: number): number {
  if (sorted.length === 0) return NaN;
  if (sorted.length === 1) return sorted[0]!;
  const pos = (sorted.length - 1) * q;
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  if (lo === hi) return sorted[lo]!;
  return sorted[lo]! + (sorted[hi]! - sorted[lo]!) * (pos - lo);
}

function sortedValues(vals: number[]): number[] {
  return [...vals].filter((x) => Number.isFinite(x)).sort((a, b) => a - b);
}

function sigmoid(z: number): number {
  return 1 / (1 + Math.exp(-z));
}

function calculateRps(x: number, mid: number, span: number): number {
  const denom = Math.abs(span - mid);
  if (!Number.isFinite(x) || !Number.isFinite(mid) || !Number.isFinite(span) || denom === 0) return NaN;
  const z = S_SPAN * ((x - mid) / denom);
  const sx = sigmoid(z);
  let score = RPS_MIN + RPS_RANGE * sx;
  return Math.max(RPS_MIN, Math.min(RPS_MAX, score));
}

function getRecentWeights(n: number): number[] {
  if (n <= 1) return [1];
  if (n === 2) return [2 / 3, 1 / 3];
  return [0.5, 0.3, 0.2];
}

type InternalRow = {
  ix: number;
  pk: string;
  categoryAssessment: string;
  ageGroup: 1 | 2 | 3;
  cohort: string;
  genderLetter: "M" | "F";
  scoreForModel: number;
  higherIsBetter: boolean;
  apsCategory: ApsCategoryName;
  sessionDate: Date;
  /** Log-transformed raw where applicable (APS + sigmoid input, matching Python `df` after early log). */
  scoreLogged: number;
};

function toInternalRows(rows: TrainingSessionRow[]): InternalRow[] {
  return rows.map((r, ix) => {
    const categoryAssessment = categoryDrillAssessmentKey(r.category, r.drill);
    const ageGroup = pythonAgeGroupFromLetter(r.ageLetter);
    const genderLetter = genderMF(r.genderRaw);
    const cohort = `${ageGroup}_${genderLetter}`;
    const scoreLogged = applyEarlyLog(categoryAssessment, r.score);
    const higherIsBetter = HIGHER_IS_BETTER[categoryAssessment] ?? DEFAULT_HIGHER_IS_BETTER;
    return {
      ix,
      pk: scoringPlayerKey(r),
      categoryAssessment,
      ageGroup,
      cohort,
      genderLetter,
      scoreForModel: scoreLogged,
      higherIsBetter,
      apsCategory: mapApsCategory(categoryAssessment),
      sessionDate: r.sessionDate,
      scoreLogged,
    };
  });
}

function buildApsOutputs(internal: InternalRow[]) {
  const sorted = [...internal].sort((a, b) => a.sessionDate.getTime() - b.sessionDate.getTime());

  const benchmarkBase = (() => {
    const seen = new Map<string, InternalRow>();
    for (const r of sorted) {
      const k = `${r.pk}||${r.categoryAssessment}`;
      seen.set(k, r);
    }
    return [...seen.values()];
  })();

  const cohortCounts = new Map<string, number>();
  for (const r of benchmarkBase) {
    const k = `${r.categoryAssessment}||${r.cohort}`;
    cohortCounts.set(k, (cohortCounts.get(k) ?? 0) + 1);
  }

  type BenchMeta = {
    benchmarkCohort: string;
    nOriginalCohort: number;
  };

  const metaByPlayerAssessment = new Map<string, BenchMeta>();
  for (const r of benchmarkBase) {
    const nOrig = cohortCounts.get(`${r.categoryAssessment}||${r.cohort}`) ?? 0;
    const useAgeOnly = nOrig < MIN_COHORT_N;
    const benchmarkCohort = useAgeOnly ? String(r.ageGroup) : r.cohort;
    metaByPlayerAssessment.set(`${r.pk}||${r.categoryAssessment}`, {
      benchmarkCohort,
      nOriginalCohort: nOrig,
    });
  }

  type BenchKey = string;
  /** Matches `pd.concat` of age_gender + age_group benchmark sources in final_aps_new.py. */
  const benchmarkRows: { categoryAssessment: string; benchmarkCohort: string; score: number }[] = [];
  for (const r of benchmarkBase) {
    benchmarkRows.push({
      categoryAssessment: r.categoryAssessment,
      benchmarkCohort: r.cohort,
      score: r.scoreLogged,
    });
    benchmarkRows.push({
      categoryAssessment: r.categoryAssessment,
      benchmarkCohort: String(r.ageGroup),
      score: r.scoreLogged,
    });
  }

  const quantileTable = new Map<BenchKey, { q30: number; q50: number; q70: number; q90: number }>();
  const byBench = new Map<BenchKey, number[]>();
  for (const br of benchmarkRows) {
    const bk = `${br.categoryAssessment}|||${br.benchmarkCohort}`;
    const arr = byBench.get(bk) ?? [];
    arr.push(br.score);
    byBench.set(bk, arr);
  }
  for (const [bk, vals] of byBench) {
    const s = sortedValues(vals);
    quantileTable.set(bk, {
      q30: quantile(s, 0.3),
      q50: quantile(s, 0.5),
      q70: quantile(s, 0.7),
      q90: quantile(s, 0.9),
    });
  }

  const rowAps = new Map<number, number>();

  for (const r of internal) {
    const m = metaByPlayerAssessment.get(`${r.pk}||${r.categoryAssessment}`);
    if (!m) continue;
    const bk = `${r.categoryAssessment}|||${m.benchmarkCohort}`;
    const q = quantileTable.get(bk);
    if (!q) continue;
    const aps = apsFromBenchmarks(
      r.scoreLogged,
      q.q30,
      q.q50,
      q.q70,
      q.q90,
      r.higherIsBetter,
    );
    rowAps.set(r.ix, aps);
  }

  type WeightedAgg = {
    weightedAps: number;
    band: PerformanceBand;
    nRecent: number;
  };

  const weightedByPlayerSkill = new Map<string, WeightedAgg>();

  const validForWeight = internal.filter(
    (r) =>
      Number.isFinite(rowAps.get(r.ix) ?? NaN) &&
      r.apsCategory !== "Unmapped" &&
      !Number.isNaN(r.sessionDate.getTime()),
  );

  const groups = new Map<string, InternalRow[]>();
  for (const r of validForWeight) {
    const gk = `${r.pk}||${r.apsCategory}||${r.categoryAssessment}`;
    const list = groups.get(gk) ?? [];
    list.push(r);
    groups.set(gk, list);
  }

  for (const [gk, groupRows] of groups) {
    const ordered = [...groupRows].sort((a, b) => b.sessionDate.getTime() - a.sessionDate.getTime()).slice(0, 3);
    const weights = getRecentWeights(ordered.length);
    const apsVals = ordered.map((x) => rowAps.get(x.ix)!);
    const wAps =
      apsVals.reduce((s, v, i) => s + v * (weights[i] ?? 0), 0) /
      weights.slice(0, ordered.length).reduce((a, b) => a + b, 0);
    const rounded = Math.round(wAps * 10) / 10;
    weightedByPlayerSkill.set(gk, {
      weightedAps: rounded,
      band: performanceBandFromAps(rounded),
      nRecent: ordered.length,
    });
  }

  const categoryMeans = new Map<string, { score: number; band: PerformanceBand }>();
  const catGroups = new Map<string, number[]>();
  for (const [gk, agg] of weightedByPlayerSkill) {
    const parts = gk.split("||");
    if (parts.length < 3) continue;
    const pk = parts[0]!;
    const apsCategory = parts[1]!;
    const ck = `${pk}||${apsCategory}`;
    const list = catGroups.get(ck) ?? [];
    list.push(agg.weightedAps);
    catGroups.set(ck, list);
  }
  for (const [ck, list] of catGroups) {
    const mean = list.reduce((s, x) => s + x, 0) / list.length;
    const rounded = Math.round(mean * 10) / 10;
    categoryMeans.set(ck, { score: rounded, band: performanceBandFromAps(rounded) });
  }

  const finalByPlayer = new Map<string, { score: number; band: PerformanceBand }>();
  const byPlayerCatScores = new Map<string, number[]>();
  for (const [ck, v] of categoryMeans) {
    const pk = ck.split("||")[0]!;
    const list = byPlayerCatScores.get(pk) ?? [];
    list.push(v.score);
    byPlayerCatScores.set(pk, list);
  }
  for (const [pk, scores] of byPlayerCatScores) {
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const rounded = Math.round(mean * 10) / 10;
    finalByPlayer.set(pk, { score: rounded, band: performanceBandFromAps(rounded) });
  }

  return { rowAps, weightedByPlayerSkill, categoryMeans, finalByPlayer };
}

/**
 * Cohort RPS aligned with Analysis/final_rps.py `compare_global_vs_cohort_sigmoid_rps`:
 * log + direction on modeling scores match `score_model` / `score_oriented`; small cohorts use
 * age-group-only mids/spans (`same_age_group_gender_combined`), not smoothing toward global;
 * NaN / mid===span benchmarks fall back to global.
 */
function buildSigmoidOutputs(internal: InternalRow[]) {
  type SigmoidRow = InternalRow & { scoreOriented: number };

  /** `score_logged` matches Python score_model inputs (early log via LOG_TRANSFORM_KEYS); orient like `score_oriented`. */
  const data: SigmoidRow[] = [];
  for (const r of internal) {
    const scoreModel = r.scoreLogged;
    if (!Number.isFinite(scoreModel)) continue;
    const scoreOriented = r.higherIsBetter ? scoreModel : -scoreModel;
    if (!Number.isFinite(scoreOriented)) continue;
    data.push({ ...r, scoreOriented });
  }

  const globalParams = new Map<string, { globalMid: number; globalSpan: number }>();
  const bySkill = new Map<string, SigmoidRow[]>();
  for (const r of data) {
    const arr = bySkill.get(r.categoryAssessment) ?? [];
    arr.push(r);
    bySkill.set(r.categoryAssessment, arr);
  }
  for (const [skill, arr] of bySkill) {
    const oriented = sortedValues(arr.map((x) => x.scoreOriented));
    if (!oriented.length) continue;
    globalParams.set(skill, {
      globalMid: quantile(oriented, 0.5),
      globalSpan: quantile(oriented, SPAN_PERCENTILE),
    });
  }

  const cohortStats = new Map<string, { cohortN: number; mid: number; span: number }>();
  const bySkillCohort = new Map<string, SigmoidRow[]>();
  for (const r of data) {
    const k = `${r.categoryAssessment}|||${r.cohort}`;
    const arr = bySkillCohort.get(k) ?? [];
    arr.push(r);
    bySkillCohort.set(k, arr);
  }
  for (const [k, arr] of bySkillCohort) {
    const oriented = sortedValues(arr.map((x) => x.scoreOriented));
    cohortStats.set(k, {
      cohortN: oriented.length,
      mid: quantile(oriented, 0.5),
      span: quantile(oriented, SPAN_PERCENTILE),
    });
  }

  const ageGroupStats = new Map<string, { n: number; mid: number; span: number }>();
  const bySkillAge = new Map<string, SigmoidRow[]>();
  for (const r of data) {
    const k = `${r.categoryAssessment}|||${r.ageGroup}`;
    const arr = bySkillAge.get(k) ?? [];
    arr.push(r);
    bySkillAge.set(k, arr);
  }
  for (const [k, arr] of bySkillAge) {
    const oriented = sortedValues(arr.map((x) => x.scoreOriented));
    ageGroupStats.set(k, {
      n: oriented.length,
      mid: quantile(oriented, 0.5),
      span: quantile(oriented, SPAN_PERCENTILE),
    });
  }

  function pickRpsMidSpan(r: SigmoidRow): { mid: number; span: number } | null {
    const skill = r.categoryAssessment;
    const g = globalParams.get(skill);
    if (!g) return null;

    const cohortKey = `${skill}|||${r.cohort}`;
    const cohort = cohortStats.get(cohortKey);
    const ageKey = `${skill}|||${r.ageGroup}`;
    const ageGrp = ageGroupStats.get(ageKey);

    let mid: number;
    let span: number;
    if (cohort && cohort.cohortN >= MIN_COHORT_N) {
      mid = cohort.mid;
      span = cohort.span;
    } else if (ageGrp) {
      mid = ageGrp.mid;
      span = ageGrp.span;
    } else {
      mid = NaN;
      span = NaN;
    }

    const invalid =
      !Number.isFinite(mid) || !Number.isFinite(span) || mid === span;
    if (invalid) {
      mid = g.globalMid;
      span = g.globalSpan;
    }
    if (!Number.isFinite(mid) || !Number.isFinite(span) || mid === span) return null;
    return { mid, span };
  }

  const rowRps = new Map<number, number>();
  for (const r of data) {
    const bench = pickRpsMidSpan(r);
    if (!bench) continue;
    const rpsCohort = calculateRps(r.scoreOriented, bench.mid, bench.span);
    if (Number.isFinite(rpsCohort)) rowRps.set(r.ix, rpsCohort);
  }

  /** Newest-first per player×assessment (matches Python sort for recency rank). */
  const timeSortedNewestFirst = [...data].sort((a, b) => {
    const t = b.sessionDate.getTime() - a.sessionDate.getTime();
    if (t !== 0) return t;
    return b.ix - a.ix;
  });

  const attemptRank = new Map<string, number[]>();
  for (const r of timeSortedNewestFirst) {
    const sk = `${r.pk}|||${r.categoryAssessment}`;
    const ranks = attemptRank.get(sk) ?? [];
    ranks.push(r.ix);
    attemptRank.set(sk, ranks);
  }

  const rankByIx = new Map<number, number>();
  const countByIx = new Map<number, number>();
  for (const [, ixs] of attemptRank) {
    const n = ixs.length;
    ixs.forEach((ix, idx) => {
      rankByIx.set(ix, idx + 1);
      countByIx.set(ix, n);
    });
  }

  const assessmentCohortRps = new Map<string, number>();
  const groups = new Map<string, SigmoidRow[]>();
  for (const r of data) {
    const gk = `${r.pk}|||${r.categoryAssessment}`;
    const list = groups.get(gk) ?? [];
    list.push(r);
    groups.set(gk, list);
  }

  for (const [gk, groupRows] of groups) {
    const ordered = [...groupRows].sort((a, b) => b.sessionDate.getTime() - a.sessionDate.getTime());
    const n = countByIx.get(ordered[0]!.ix) ?? ordered.length;
    let sum = 0;
    let wsum = 0;
    for (const r of ordered) {
      const rank = rankByIx.get(r.ix) ?? 99;
      if (rank > 3) continue;
      let w = 0;
      if (n === 1) w = 1;
      else if (n === 2) w = rank === 1 ? 2 / 3 : 1 / 3;
      else {
        if (rank === 1) w = 0.5;
        else if (rank === 2) w = 0.3;
        else if (rank === 3) w = 0.2;
      }
      const rps = rowRps.get(r.ix);
      if (!Number.isFinite(rps)) continue;
      sum += rps! * w;
      wsum += w;
    }
    const val = wsum > 0 ? sum / wsum : NaN;
    if (Number.isFinite(val)) assessmentCohortRps.set(gk, val);
  }

  const overallCohortRps = new Map<string, number>();
  const playerAssessments = new Map<string, Set<string>>();
  for (const [gk, val] of assessmentCohortRps) {
    const [pk] = gk.split("|||");
    const set = playerAssessments.get(pk!) ?? new Set();
    const assess = gk.split("|||")[1]!;
    set.add(assess);
    playerAssessments.set(pk!, set);
  }
  for (const [pk, assessSet] of playerAssessments) {
    let s = 0;
    let c = 0;
    for (const assess of assessSet) {
      const v = assessmentCohortRps.get(`${pk}|||${assess}`);
      if (Number.isFinite(v)) {
        s += v!;
        c += 1;
      }
    }
    if (c > 0) overallCohortRps.set(pk, s / c);
  }

  return { rowRps, assessmentCohortRps, overallCohortRps };
}

export type TrainingScoringSnapshot = {
  /** Cohort sigmoid RPS (30–99) per input row index. */
  rowRpsCohortByIndex: (number | null)[];
  overallCohortRpsByPlayer: Map<string, number>;
  finalApsByPlayer: Map<string, { score: number; band: PerformanceBand }>;
  categoryApsByPlayer: Map<string, { score: number; band: PerformanceBand }>;
  /** Key: `${playerKey}|||${categoryAssessment}` -> weighted cohort RPS for that drill. */
  assessmentCohortRpsByPlayer: Map<string, number>;
  /** Key: `${playerKey}||${apsCategory}||${categoryAssessment}` -> weighted APS + band. */
  weightedApsByPlayerSkill: Map<string, { weightedAps: number; band: PerformanceBand }>;
};

/**
 * Builds APS bands + cohort RPS from the same session ordering as `rows` (parallel indices).
 */
export function buildTrainingScoringSnapshot(rows: TrainingSessionRow[]): TrainingScoringSnapshot {
  const n = rows.length;
  const internal = toInternalRows(rows);
  const aps = buildApsOutputs(internal);
  const sig = buildSigmoidOutputs(internal);

  const rowRpsCohortByIndex: (number | null)[] = Array(n).fill(null);
  for (const r of internal) {
    const v = sig.rowRps.get(r.ix);
    rowRpsCohortByIndex[r.ix] = Number.isFinite(v!) ? v! : null;
  }

  return {
    rowRpsCohortByIndex,
    overallCohortRpsByPlayer: sig.overallCohortRps,
    finalApsByPlayer: aps.finalByPlayer,
    categoryApsByPlayer: new Map(aps.categoryMeans),
    assessmentCohortRpsByPlayer: sig.assessmentCohortRps,
    weightedApsByPlayerSkill: new Map(
      [...aps.weightedByPlayerSkill.entries()].map(([k, v]) => [k, { weightedAps: v.weightedAps, band: v.band }]),
    ),
  };
}

export function snapshotRowRps(snapshot: TrainingScoringSnapshot, rowIndex: number): number | null {
  return snapshot.rowRpsCohortByIndex[rowIndex] ?? null;
}

export function snapshotAssessmentRps(
  snapshot: TrainingScoringSnapshot,
  pk: string,
  category: string,
  drill: string,
): number | null {
  return snapshot.assessmentCohortRpsByPlayer.get(`${pk}|||${categoryDrillAssessmentKey(category, drill)}`) ?? null;
}

export function snapshotWeightedAps(
  snapshot: TrainingScoringSnapshot,
  pk: string,
  category: string,
  drill: string,
): { weightedAps: number; band: PerformanceBand } | null {
  const cat = mapApsCategory(categoryDrillAssessmentKey(category, drill));
  const k = `${pk}||${cat}||${categoryDrillAssessmentKey(category, drill)}`;
  return snapshot.weightedApsByPlayerSkill.get(k) ?? null;
}

export function snapshotCategoryBand(
  snapshot: TrainingScoringSnapshot,
  pk: string,
  ability: AbilityName,
): PerformanceBand | null {
  const v = snapshot.categoryApsByPlayer.get(`${pk}||${ability}`);
  return v?.band ?? null;
}

export function snapshotCategoryApsScore(
  snapshot: TrainingScoringSnapshot,
  pk: string,
  ability: AbilityName,
): number | null {
  return snapshot.categoryApsByPlayer.get(`${pk}||${ability}`)?.score ?? null;
}
