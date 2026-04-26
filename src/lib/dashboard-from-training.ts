import type {
  AbilityName,
  AssessmentHistoryItem,
  ArchetypeSummary,
  AssessmentRow,
  CohortInsightCopy,
  DashboardCollection,
  PerformanceBand,
  PlayerDashboardView,
  ProgressPoint,
  SkillProgressPoint,
  SummaryMetric,
  TrendDirection,
} from "../types/dashboard";
import { ABILITY_ORDER, mapAssessmentToAbility } from "./assessment-to-ability";
import { tierLetterToAgeGroupLabel } from "./age-group-labels";
import { clampDisplayedScore, getScoreChange, getTier } from "./dashboard-helpers";
import type { TrainingSessionRowEnriched } from "./training-cohort-percentiles";
import {
  centerMatrix,
  colMeans,
  kmeans,
  pcaTwoComponents,
  scaleToCanvas,
} from "./pca-kmeans";
import { ARCHETYPE_CHART_HEIGHT, ARCHETYPE_CHART_PAD, ARCHETYPE_CHART_WIDTH } from "./archetype-chart-layout";
import { playerKey } from "./training-session-csv";

const ARCHETYPE_COLS = [
  "Playmaker",
  "Explosive Athlete",
  "Attacker",
  "Control / Possession",
] as const;

const CLUSTER_COLORS = ["#10b981", "#f97316", "#ef4444", "#38bdf8"];

function archetypeMixFromVector(v: number[]): Record<(typeof ARCHETYPE_COLS)[number], number> {
  const [D, P, Vi, A, F] = v;
  return {
    Playmaker: 0.3 * P + 0.3 * Vi + 0.25 * F + 0.1 * D + 0.05 * A,
    "Explosive Athlete": 0.4 * A + 0.35 * D + 0.15 * F + 0.1 * Vi,
    Attacker: 0.4 * D + 0.3 * A + 0.2 * F + 0.1 * Vi,
    "Control / Possession": 0.35 * F + 0.35 * P + 0.2 * Vi + 0.1 * D,
  };
}

/** Matches Analysis/cluster.py: for each cluster index in order, take highest archetype score not yet used. */
function recommendationsForArchetype(primary: string): string {
  switch (primary) {
    case "Playmaker":
      return "Lean into small-sided play that rewards scanning and quick combinations; schedule extra passing and vision reps so choices stay sharp when the game speeds up.";
    case "Explosive Athlete":
      return "Keep jump/sprint exposure in the weekly plan, then chain into 1v1 and transition drills so athleticism shows up with the ball.";
    case "Attacker":
      return "Prioritize finishing, 1v1 duels, and direct runs; use sessions that pair first touch with acceleration and end with shots or box entries.";
    case "Control / Possession":
      return "Use rondos and receive-to-play progressions; reward patience in tight spaces and cue when to break lines versus reset the rhythm.";
    default:
      return "Rotate emphasis across dribbling, passing, vision, agility, and first touch each week so the profile reflects balanced, intentional work.";
  }
}

function assignClusterArchetypes(centers: number[][]): string[] {
  const k = centers.length;
  const names: string[] = [];
  const used = new Set<string>();
  for (let i = 0; i < k; i++) {
    const mix = archetypeMixFromVector(centers[i]!);
    const entries = ARCHETYPE_COLS.map((label) => ({ label, score: mix[label] })).sort((a, b) => b.score - a.score);
    const pick = entries.find((e) => !used.has(e.label));
    if (pick) {
      names.push(pick.label);
      used.add(pick.label);
    } else {
      const fallback = ARCHETYPE_COLS.find((a) => !used.has(a)) ?? "Playmaker";
      names.push(fallback);
      used.add(fallback);
    }
  }
  return names;
}

function bandFromPct(pct: number): PerformanceBand {
  return getTier(pct);
}

function formatOrdinal(n: number): string {
  const r = Math.round(n);
  const j = r % 10;
  const k = r % 100;
  if (k >= 11 && k <= 13) return `${r}th`;
  if (j === 1) return `${r}st`;
  if (j === 2) return `${r}nd`;
  if (j === 3) return `${r}rd`;
  return `${r}th`;
}

/** Calendar month in UTC — matches `Date` parsing for ISO date-only strings from the CSV. */
function monthKeyUtc(d: Date): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

function monthLabelFromKeyUtc(key: string): string {
  const [y, m] = key.split("-").map(Number);
  const d = new Date(Date.UTC(y!, (m ?? 1) - 1, 1));
  return d.toLocaleString("en-US", { month: "short", year: "2-digit", timeZone: "UTC" });
}

function isoDayUtc(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function percentileInSample(sample: number[], value: number): number {
  if (sample.length === 0) return 50;
  const below = sample.filter((s) => s < value).length;
  const equal = sample.filter((s) => s === value).length;
  return ((below + equal / 2) / sample.length) * 100;
}

function imputeSkillMatrix(X: (number | null)[][]): number[][] {
  const n = X.length;
  const d = X[0]?.length ?? 0;
  const colMeans: number[] = [];
  for (let j = 0; j < d; j++) {
    const vals = X.map((row) => row[j]).filter((v): v is number => v !== null && !Number.isNaN(v));
    colMeans[j] = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 50;
  }
  return X.map((row) => row.map((x, j) => (x === null || Number.isNaN(x!) ? colMeans[j]! : x!)));
}

function skillVectorForPlayer(rows: TrainingSessionRowEnriched[]): (number | null)[] {
  const buckets: Record<AbilityName, number[]> = {
    Dribbling: [],
    Passing: [],
    Vision: [],
    Agility: [],
    "First Touch": [],
  };
  for (const r of rows) {
    const ab = mapAssessmentToAbility(r.category, r.drill);
    if (!ab) continue;
    buckets[ab].push(r.cohortPercentile);
  }
  return ABILITY_ORDER.map((k) => {
    const arr = buckets[k];
    if (!arr.length) return null;
    return arr.reduce((s, x) => s + x, 0) / arr.length;
  });
}

function dot(a: number[], b: number[]): number {
  return a.reduce((s, x, i) => s + x * (b[i] ?? 0), 0);
}

type PlayerAgg = {
  key: string;
  rows: TrainingSessionRowEnriched[];
  composite: number;
  cohortKey: string;
};

type ArchetypeLayout = {
  byPlayer: Map<string, ArchetypeSummary>;
};

function buildArchetypeLayout(aggs: PlayerAgg[]): ArchetypeLayout {
  const byPlayer = new Map<string, ArchetypeSummary>();
  const n = aggs.length;
  if (n === 0) return { byPlayer };

  const raw: (number | null)[][] = aggs.map((a) => skillVectorForPlayer(a.rows));
  const X = imputeSkillMatrix(raw);
  const kCl = Math.min(4, Math.max(1, n));

  const km = kmeans(X, kCl, 42);
  const mu = colMeans(X);
  const Xc = centerMatrix(X, mu);
  const { v1, v2, scores } = pcaTwoComponents(Xc);

  const centerPCs: [number, number][] = km.centers.map((ctr) => {
    const xc = ctr.map((v, i) => v - (mu[i] ?? 0));
    return [dot(xc, v1), dot(xc, v2)];
  });

  const allPts: [number, number][] = [...scores, ...centerPCs];
  const scaledAll = scaleToCanvas(allPts, ARCHETYPE_CHART_WIDTH, ARCHETYPE_CHART_HEIGHT, ARCHETYPE_CHART_PAD);
  const scaledPlayers = scaledAll.slice(0, n);
  const scaledCenters = scaledAll.slice(n);

  const clusterNames = assignClusterArchetypes(km.centers);

  const clusters = clusterNames.map((label, c) => {
    const pts = scaledPlayers.filter((_, i) => km.labels[i] === c);
    if (!pts.length) {
      return {
        label,
        x: scaledCenters[c]?.x ?? ARCHETYPE_CHART_WIDTH / 2,
        y: scaledCenters[c]?.y ?? ARCHETYPE_CHART_HEIGHT / 2,
        color: CLUSTER_COLORS[c % CLUSTER_COLORS.length]!,
      };
    }
    const mx = pts.reduce((s, p) => s + p.x, 0) / pts.length;
    const my = pts.reduce((s, p) => s + p.y, 0) / pts.length;
    return {
      label,
      x: mx,
      y: my,
      color: CLUSTER_COLORS[c % CLUSTER_COLORS.length]!,
    };
  });

  for (let i = 0; i < n; i++) {
    const a = aggs[i]!;
    const pk = a.key;
    const ci = km.labels[i] ?? 0;
    const primary = clusterNames[ci] ?? "Playmaker";
    const pos = scaledPlayers[i]!;
    const vec = X[i]!;

    byPlayer.set(pk, {
      primaryArchetype: primary,
      summary: `K-means (${kCl} clusters) on five skill signals, projected with PCA (same structure as Analysis/cluster.py).`,
      coachInsight: `Skill vector (cohort %): Drib ${vec[0]!.toFixed(0)}, Pass ${vec[1]!.toFixed(0)}, Vision ${vec[2]!.toFixed(0)}, Agility ${vec[3]!.toFixed(0)}, First Touch ${vec[4]!.toFixed(0)}.`,
      clusterPoints: clusters.map((c) => ({ label: c.label, x: c.x, y: c.y, color: c.color })),
      playerPoint: {
        label: "",
        x: pos.x,
        y: pos.y,
        color: "#0f172a",
      },
      traits: [
        { label: "Cluster", value: `Assigned to "${primary}" from the five-skill scoring space.` },
        { label: "Recommendations", value: recommendationsForArchetype(primary) },
      ],
    });
  }

  return { byPlayer };
}

export function buildDashboardCollectionFromTraining(allRows: TrainingSessionRowEnriched[]): DashboardCollection {
  const byPlayer = new Map<string, TrainingSessionRowEnriched[]>();
  for (const r of allRows) {
    const k = playerKey(r);
    byPlayer.set(k, [...(byPlayer.get(k) ?? []), r]);
  }

  const cohortComposites = new Map<string, number[]>();
  const aggs: PlayerAgg[] = [];

  for (const [key, rows] of byPlayer) {
    if (rows.length < 1) continue;
    const latestRow = rows.reduce((a, b) => (a.sessionDate >= b.sessionDate ? a : b));
    const cohortKey = `${latestRow.ageLetter}|${latestRow.genderRaw}`;
    const composite = rows.reduce((s, x) => s + x.percentile, 0) / rows.length;
    aggs.push({ key, rows, composite, cohortKey });
    cohortComposites.set(cohortKey, [...(cohortComposites.get(cohortKey) ?? []), composite]);
  }

  const rpsByPlayer = new Map<string, number>();
  for (const a of aggs) {
    const peers = cohortComposites.get(a.cohortKey) ?? [a.composite];
    rpsByPlayer.set(a.key, percentileInSample(peers, a.composite));
  }

  const archetypeLayout = buildArchetypeLayout(aggs);

  const players: PlayerDashboardView[] = aggs.map((a) => {
    const rows = [...a.rows].sort((x, y) => x.sessionDate.getTime() - y.sessionDate.getTime());
    const latest = rows[rows.length - 1]!;
    const ageGroupLabel = tierLetterToAgeGroupLabel(latest.ageLetter);
    const genderLabel = latest.genderRaw === "female" ? "Female" : "Male";
    const profile = {
      playerName: `${latest.firstName} ${latest.lastName}`.trim(),
      ageGroup: ageGroupLabel,
      gender: genderLabel,
      cohortName: `${ageGroupLabel} ${genderLabel}`,
      trackingWindow: `${rows[0]!.isoDate.slice(0, 4)}–${latest.isoDate.slice(0, 4)}`,
    };

    const rpsRaw = rpsByPlayer.get(a.key) ?? 0;
    const sgi = clampDisplayedScore(rpsRaw);

    const byMonth = new Map<string, TrainingSessionRowEnriched[]>();
    for (const r of rows) {
      const mk = monthKeyUtc(r.sessionDate);
      byMonth.set(mk, [...(byMonth.get(mk) ?? []), r]);
    }

    const monthKeys = [...byMonth.keys()].sort();
    const lastMk = monthKeys[monthKeys.length - 1]!;
    const prevMk = monthKeys[monthKeys.length - 2];

    const meanPct = (list: TrainingSessionRowEnriched[]) =>
      list.length === 0 ? 0 : list.reduce((s, x) => s + x.percentile, 0) / list.length;

    const currentMonthMean = meanPct(byMonth.get(lastMk) ?? []);
    const priorMonthMean = prevMk ? meanPct(byMonth.get(prevMk) ?? []) : currentMonthMean;

    const apsDelta = currentMonthMean - priorMonthMean;
    const apsTrend: TrendDirection = Math.abs(apsDelta) < 0.5 ? "flat" : apsDelta > 0 ? "up" : "down";
    const compositeBand = bandFromPct(rpsRaw);

    const rpsOrdinal = formatOrdinal(rpsRaw);
    const rpsContextLine = (() => {
      if (rpsRaw >= 75) {
        return "This player is among the stronger performers in this cohort for overall training-session standing.";
      }
      if (rpsRaw >= 55) {
        return "This player sits above the cohort midpoint — a solid position versus same age-group peers.";
      }
      if (rpsRaw >= 35) {
        return "This player is near the middle of the cohort — typical variation with room to climb.";
      }
      return "This player is in the lower segment of the cohort distribution on this composite — a clear development focus area.";
    })();

    const summaryMetrics: SummaryMetric[] = [
      {
        label: "SGI tier",
        value: compositeBand,
        description: `Overall SGI tier from cohort-relative standing (SGI ${sgi.toFixed(
          1,
        )}). ${
          prevMk === undefined
            ? "Only one calendar month with sessions in the extract."
            : `Latest active month averaged SGI ${clampDisplayedScore(currentMonthMean).toFixed(1)} vs ${clampDisplayedScore(priorMonthMean).toFixed(1)} prior month.`
        }`,
        changeText:
          prevMk === undefined
            ? "Single month on record"
            : getScoreChange(clampDisplayedScore(currentMonthMean), clampDisplayedScore(priorMonthMean)),
        changeDirection: prevMk === undefined ? "flat" : apsTrend,
      },
      {
        label: "Overall SGI",
        value: `${sgi.toFixed(1)}`,
        description: `${rpsContextLine} In ${profile.cohortName}, this sits near the ${rpsOrdinal} cohort percentile (source: training session extract).`,
        changeText: "Cohort-relative",
        changeDirection: "flat",
      },
    ];

    /** One point per calendar month (UTC) that has >=1 session — displayed as SGI. */
    const sortedMonthKeys = [...byMonth.keys()].sort();
    const progressPoints: ProgressPoint[] = sortedMonthKeys.map((mk) => {
      const list = byMonth.get(mk) ?? [];
      const mRps = list.reduce((s, x) => s + x.cohortPercentile, 0) / list.length;
      return {
        label: monthLabelFromKeyUtc(mk),
        rps: Math.round(clampDisplayedScore(mRps) * 10) / 10,
      };
    }).slice(-12);

    const skillProgress = ABILITY_ORDER.reduce(
      (acc, ability) => {
        const bySkillMonth = new Map<string, number[]>();
        for (const r of rows) {
          const mapped = mapAssessmentToAbility(r.category, r.drill);
          if (mapped !== ability) continue;
          const mk = monthKeyUtc(r.sessionDate);
          const existing = bySkillMonth.get(mk) ?? [];
          existing.push(clampDisplayedScore(r.cohortPercentile));
          bySkillMonth.set(mk, existing);
        }
        const points: SkillProgressPoint[] = [...bySkillMonth.entries()]
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([mk, scores]) => ({
            label: monthLabelFromKeyUtc(mk),
            score: Math.round((scores.reduce((sum, s) => sum + s, 0) / scores.length) * 10) / 10,
          }));
        acc[ability] = points.slice(-12);
        return acc;
      },
      {} as Record<AbilityName, SkillProgressPoint[]>,
    );

    const cohortPeers = aggs.filter((x) => x.cohortKey === a.cohortKey);
    const peerScores = cohortPeers.map((p) => p.composite);
    const binCounts = new Map<number, number>();
    for (const s of peerScores) {
      const sgiScore = clampDisplayedScore(s);
      const mid = Math.max(30, Math.min(90, Math.round(sgiScore / 10) * 10));
      binCounts.set(mid, (binCounts.get(mid) ?? 0) + 1);
    }
    const bins = [30, 40, 50, 60, 70, 80, 90].map((score) => ({
      score,
      count: binCounts.get(score) ?? 0,
    }));

    const assessmentRows: AssessmentRow[] = [];
    const assessmentHistory: AssessmentHistoryItem[] = [];
    const byDrill = new Map<string, TrainingSessionRowEnriched[]>();
    for (const r of rows) {
      const dk = `${r.category}||${r.drill}`;
      byDrill.set(dk, [...(byDrill.get(dk) ?? []), r]);
    }
    for (const [, list] of byDrill) {
      const sorted = [...list].sort((x, y) => y.sessionDate.getTime() - x.sessionDate.getTime());
      const cur = sorted[0]!;
      const prev = sorted[1];
      const ability = mapAssessmentToAbility(cur.category, cur.drill);
      if (!ability) continue;
      const currentSgi = clampDisplayedScore(cur.cohortPercentile);
      const previousSgi = prev ? clampDisplayedScore(prev.cohortPercentile) : currentSgi;
      const delta = prev ? currentSgi - previousSgi : 0;
      const dir: TrendDirection = !prev ? "flat" : Math.abs(delta) < 0.5 ? "flat" : delta > 0 ? "up" : "down";
      assessmentRows.push({
        assessmentName: `${cur.category} ${cur.drill}`,
        ability,
        apsScore: Math.round(currentSgi),
        rpsScore: Math.round(currentSgi),
        percentile: Math.round(currentSgi),
        performanceBand: bandFromPct(cur.cohortPercentile),
        changeText: prev ? getScoreChange(currentSgi, previousSgi) : "First record",
        changeDirection: dir,
        latestSessionLabel: `Latest: ${cur.isoDate}`,
      });
      assessmentHistory.push({
        date: isoDayUtc(cur.sessionDate),
        assessmentName: `${cur.category} ${cur.drill}`,
        ability,
        score: Math.round(currentSgi),
        tier: bandFromPct(cur.cohortPercentile),
      });
    }
    assessmentRows.sort((a, b) => b.apsScore - a.apsScore);
    assessmentHistory.sort((a, b) => b.date.localeCompare(a.date));

    const testsByAbility = new Map<AbilityName, AssessmentRow[]>();
    for (const row of assessmentRows) {
      const list = testsByAbility.get(row.ability) ?? [];
      list.push(row);
      testsByAbility.set(row.ability, list);
    }

    const abilityBreakdown = ABILITY_ORDER.map((ability) => {
      const tests = testsByAbility.get(ability) ?? [];
      const avgAps =
        tests.length === 0 ? 0 : tests.reduce((s, t) => s + t.apsScore, 0) / tests.length;
      return {
        ability,
        avgAps: Math.round(avgAps * 10) / 10,
        aggregateBand: tests.length === 0 ? ("Foundation" as PerformanceBand) : bandFromPct(avgAps),
        tests: [...tests].sort((x, y) => y.apsScore - x.apsScore),
      };
    });

    const byCat = new Map<string, number[]>();
    for (const r of rows) {
      const ability = mapAssessmentToAbility(r.category, r.drill);
      if (!ability) continue;
      byCat.set(ability, [...(byCat.get(ability) ?? []), clampDisplayedScore(r.cohortPercentile)]);
    }
    const catMeans = [...byCat.entries()].map(([cat, pcts]) => ({
      cat,
      m: pcts.reduce((s, x) => s + x, 0) / pcts.length,
    }));
    catMeans.sort((x, y) => y.m - x.m);
    const strengths = catMeans.slice(0, 3).map(
      (c) =>
        `${c.cat}: ${c.m.toFixed(1)} average SGI (${rows.filter((r) => mapAssessmentToAbility(r.category, r.drill) === c.cat).length} sessions).`,
    );
    const improvements = catMeans
      .slice(-3)
      .reverse()
      .map((c) => `${c.cat}: ${c.m.toFixed(1)} average SGI — room to lift vs other areas.`);

    const cohortInsight: CohortInsightCopy = {
      title: `How ${profile.playerName} compares with similar players`,
      comparisonGroup: `Compared against ${profile.cohortName} players in the training session extract.`,
      plainLanguage: `Current SGI is ${sgi.toFixed(1)}, around the ${formatOrdinal(rpsRaw)} cohort percentile among similar players.`,
      parentFriendly: `Numbers come only from recorded sessions: ${rows.length} rows between ${rows[0]!.isoDate} and ${latest.isoDate}.`,
      rpsDefinition:
        "SGI is displayed on a 30–99 range and reflects cohort-relative standing by age and gender.",
    };

    const arch = archetypeLayout.byPlayer.get(a.key) ?? {
      primaryArchetype: "Playmaker",
      summary: "",
      coachInsight: "",
      clusterPoints: [],
      playerPoint: { label: "", x: 280, y: 200, color: "#0f172a" },
      traits: [],
    };
    arch.playerPoint.label = profile.playerName;

    return {
      id: profile.playerName,
      profile,
      summaryMetrics,
      progressTrend: progressPoints,
      skillProgress,
      assessmentHistory,
      cohortDistribution: {
        cohortLabel: profile.cohortName,
        sampleSize: cohortPeers.length,
        playerScore: Math.round(sgi),
        bins,
      },
      assessmentBreakdown: assessmentRows,
      abilityBreakdown,
      archetype: arch,
      strengths,
      improvements,
      cohortInsight,
    };
  });

  players.sort((a, b) => a.profile.playerName.localeCompare(b.profile.playerName));

  return { players };
}
