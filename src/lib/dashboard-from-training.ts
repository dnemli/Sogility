import type {
  AbilityName,
  ArchetypeSummary,
  AssessmentRow,
  CohortInsightCopy,
  DashboardCollection,
  PerformanceBand,
  PlayerDashboardView,
  ProgressPoint,
  SummaryMetric,
  TrendDirection,
} from "../types/dashboard";
import { ABILITY_ORDER, mapAssessmentToAbility } from "./assessment-to-ability";
import { tierLetterToAgeGroupLabel } from "./age-group-labels";
import type { TrainingSessionRowEnriched } from "./training-cohort-percentiles";
import {
  centerMatrix,
  colMeans,
  kmeans,
  pcaTwoComponents,
  scaleToCanvas,
} from "./pca-kmeans";
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
  if (pct < 20) return "Foundation";
  if (pct < 40) return "Developing";
  if (pct < 60) return "Approaching";
  if (pct < 80) return "Strong";
  return "Elite";
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
  const scaledAll = scaleToCanvas(allPts, 560, 400, 56);
  const scaledPlayers = scaledAll.slice(0, n);
  const scaledCenters = scaledAll.slice(n);

  const clusterNames = assignClusterArchetypes(km.centers);

  const clusters = clusterNames.map((label, c) => {
    const pts = scaledPlayers.filter((_, i) => km.labels[i] === c);
    if (!pts.length) {
      return {
        label,
        x: scaledCenters[c]?.x ?? 280,
        y: scaledCenters[c]?.y ?? 200,
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
      summary: `K-means (${kCl} clusters) on five ability RPS means, projected with PCA (same structure as Analysis/cluster.py).`,
      coachInsight: `Skill vector (cohort %): Drib ${vec[0]!.toFixed(0)}, Pass ${vec[1]!.toFixed(0)}, Vision ${vec[2]!.toFixed(0)}, Agility ${vec[3]!.toFixed(0)}, First Touch ${vec[4]!.toFixed(0)}.`,
      clusterPoints: clusters.map((c) => ({ label: c.label, x: c.x, y: c.y, color: c.color })),
      playerPoint: {
        label: "",
        x: pos.x,
        y: pos.y,
        color: "#0f172a",
      },
      traits: [
        { label: "Cluster", value: `Assigned to “${primary}” from RPS skill space.` },
        { label: "Projection", value: "PC1 / PC2 spread players using covariance of the five ability means." },
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

    const rps = rpsByPlayer.get(a.key) ?? 0;

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
    const compositeBand = bandFromPct(a.composite);

    const rpsOrdinal = formatOrdinal(rps);
    const rpsContextLine = (() => {
      if (rps >= 75) {
        return "This player is among the stronger performers in this cohort for overall training-session standing.";
      }
      if (rps >= 55) {
        return "This player sits above the cohort midpoint — a solid position versus same age-group peers.";
      }
      if (rps >= 35) {
        return "This player is near the middle of the cohort — typical variation with room to climb.";
      }
      return "This player is in the lower segment of the cohort distribution on this composite — a clear development focus area.";
    })();

    const summaryMetrics: SummaryMetric[] = [
      {
        label: "Performance band",
        value: compositeBand,
        description: `Overall APS band from mean within-drill percentile (${a.composite.toFixed(
          1,
        )} composite). ${
          prevMk === undefined
            ? "Only one calendar month with sessions in the extract."
            : `Latest active month averaged ${currentMonthMean.toFixed(1)} vs ${priorMonthMean.toFixed(1)} prior month (within-drill percentiles).`
        }`,
        changeText:
          prevMk === undefined
            ? "Single month on record"
            : `${apsDelta >= 0 ? "+" : ""}${apsDelta.toFixed(1)} pts vs prior month`,
        changeDirection: prevMk === undefined ? "flat" : apsTrend,
      },
      {
        label: "RPS & cohort rank",
        value: `${rpsOrdinal} percentile`,
        description: `${rpsContextLine} In ${profile.cohortName}, that is approximately the ${rpsOrdinal} percentile among peers on the composite training metric (from the training session extract).`,
        changeText: "Cohort-relative",
        changeDirection: "flat",
      },
    ];

    /** One point per calendar month (UTC) that has ≥1 session — mean cohort drill percentile (RPS-style). */
    const sortedMonthKeys = [...byMonth.keys()].sort();
    const progressPoints: ProgressPoint[] = sortedMonthKeys.map((mk) => {
      const list = byMonth.get(mk) ?? [];
      const mRps = list.reduce((s, x) => s + x.cohortPercentile, 0) / list.length;
      return {
        label: monthLabelFromKeyUtc(mk),
        rps: Math.round(mRps * 10) / 10,
      };
    }).slice(-12);

    const cohortPeers = aggs.filter((x) => x.cohortKey === a.cohortKey);
    const peerScores = cohortPeers.map((p) => p.composite);
    const binCounts = new Map<number, number>();
    for (const s of peerScores) {
      const mid = Math.max(10, Math.min(90, Math.round(s / 10) * 10));
      binCounts.set(mid, (binCounts.get(mid) ?? 0) + 1);
    }
    const bins = [10, 20, 30, 40, 50, 60, 70, 80, 90].map((score) => ({
      score,
      count: binCounts.get(score) ?? 0,
    }));

    const assessmentRows: AssessmentRow[] = [];
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
      const delta = prev ? cur.percentile - prev.percentile : 0;
      const dir: TrendDirection = !prev ? "flat" : Math.abs(delta) < 0.5 ? "flat" : delta > 0 ? "up" : "down";
      assessmentRows.push({
        assessmentName: `${cur.category} ${cur.drill}`,
        ability,
        apsScore: Math.round(cur.percentile),
        rpsScore: Math.round(cur.cohortPercentile),
        percentile: Math.round(cur.cohortPercentile),
        performanceBand: bandFromPct(cur.cohortPercentile),
        changeText: prev ? `${delta >= 0 ? "+" : ""}${delta.toFixed(1)}` : "First record",
        changeDirection: dir,
        latestSessionLabel: `Latest: ${cur.isoDate}`,
      });
    }
    assessmentRows.sort((a, b) => b.apsScore - a.apsScore);

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
      const k = r.category;
      byCat.set(k, [...(byCat.get(k) ?? []), r.percentile]);
    }
    const catMeans = [...byCat.entries()].map(([cat, pcts]) => ({
      cat,
      m: pcts.reduce((s, x) => s + x, 0) / pcts.length,
    }));
    catMeans.sort((x, y) => y.m - x.m);
    const strengths = catMeans.slice(0, 3).map(
      (c) => `${c.cat}: ${c.m.toFixed(1)} avg percentile (${rows.filter((r) => r.category === c.cat).length} sessions).`,
    );
    const improvements = catMeans
      .slice(-3)
      .reverse()
      .map((c) => `${c.cat}: ${c.m.toFixed(1)} avg percentile — room to lift vs other areas.`);

    const cohortInsight: CohortInsightCopy = {
      title: `How ${profile.playerName} compares with similar players`,
      comparisonGroup: `Compared against ${profile.cohortName} players in the training session extract.`,
      plainLanguage: `Composite standing near ${formatOrdinal(rps)} of peers in the same tier and gender (from mean drill percentiles).`,
      parentFriendly: `Numbers come only from recorded sessions: ${rows.length} rows between ${rows[0]!.isoDate} and ${latest.isoDate}.`,
      rpsDefinition:
        "RPS here is the cohort percentile of the player's average within-drill percentile — a relative standing score, not revenue.",
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
      cohortDistribution: {
        cohortLabel: profile.cohortName,
        sampleSize: cohortPeers.length,
        playerScore: Math.round(a.composite),
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
