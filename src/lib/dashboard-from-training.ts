import type {
  ArchetypeSummary,
  AssessmentRow,
  CohortInsightCopy,
  DashboardCollection,
  PerformanceBand,
  PlayerDashboardView,
  ProgressPoint,
  SkillFilterOption,
  SummaryMetric,
  TrendDirection,
} from "../types/dashboard";
import type { TrainingSessionRowEnriched } from "./training-cohort-percentiles";
import { playerKey } from "./training-session-csv";

const SKILL_ORDER: SkillFilterOption[] = [
  "All assessments",
  "Ball Mastery",
  "Passing",
  "First Touch",
  "Decision Making",
  "Speed & Agility",
  "Explosiveness",
];

const CATEGORY_TO_SKILL: Record<string, SkillFilterOption> = {
  "Circuit Training": "Ball Mastery",
  "Tech Touch Ground & Tech Touch Air": "First Touch",
  "Tech Touch One Touch Pass": "Passing",
  "Fast Feet": "Ball Mastery",
  Freelap: "Speed & Agility",
  "ICON 4M": "Decision Making",
  "ICON Q": "Decision Making",
  "ICON V2": "Decision Making",
  "Reflexion Edge": "Decision Making",
  "Vertical Jump": "Explosiveness",
  "Broad Jump": "Explosiveness",
};

const SPEED_CATS = new Set(["Freelap", "Vertical Jump", "Broad Jump"]);
const SKILL_CATS = new Set([
  "Circuit Training",
  "Tech Touch Ground & Tech Touch Air",
  "Tech Touch One Touch Pass",
  "Fast Feet",
  "ICON 4M",
  "ICON Q",
  "ICON V2",
  "Reflexion Edge",
]);

function mapSkill(cat: string): SkillFilterOption {
  return CATEGORY_TO_SKILL[cat] ?? "Ball Mastery";
}

function bandFromPct(pct: number): PerformanceBand {
  if (pct < 20) return "Foundation";
  if (pct < 40) return "Developing";
  if (pct < 60) return "Approaching";
  if (pct < 80) return "Strong";
  return "Elite";
}

function median(vals: number[]): number {
  if (!vals.length) return 0;
  const s = [...vals].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m]! : (s[m - 1]! + s[m]!) / 2;
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

function monthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabelFromKey(key: string): string {
  const [y, m] = key.split("-").map(Number);
  const d = new Date(y!, (m ?? 1) - 1, 1);
  return d.toLocaleString("en-US", { month: "short", year: "2-digit" });
}

function addMonths(d: Date, n: number): Date {
  const x = new Date(d);
  x.setMonth(x.getMonth() + n);
  return x;
}

function percentileInSample(sample: number[], value: number): number {
  if (sample.length === 0) return 50;
  const below = sample.filter((s) => s < value).length;
  const equal = sample.filter((s) => s === value).length;
  return ((below + equal / 2) / sample.length) * 100;
}

type PlayerAgg = {
  key: string;
  rows: TrainingSessionRowEnriched[];
  composite: number;
  cohortKey: string;
};

export function buildDashboardCollectionFromTraining(allRows: TrainingSessionRowEnriched[]): DashboardCollection {
  const maxDate = allRows.reduce((a, r) => (r.sessionDate > a ? r.sessionDate : a), allRows[0]!.sessionDate);

  const byPlayer = new Map<string, TrainingSessionRowEnriched[]>();
  for (const r of allRows) {
    const k = playerKey(r);
    byPlayer.set(k, [...(byPlayer.get(k) ?? []), r]);
  }

  const cohortComposites = new Map<string, number[]>();
  const aggs: PlayerAgg[] = [];

  for (const [key, rows] of byPlayer) {
    if (rows.length < 5) continue;
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

  const archetypeCoords = new Map<string, { sx: number; sy: number }>();
  for (const a of aggs) {
    const speedRows = a.rows.filter((r) => SPEED_CATS.has(r.category));
    const skillRows = a.rows.filter((r) => SKILL_CATS.has(r.category));
    const sx =
      speedRows.length === 0
        ? a.composite
        : speedRows.reduce((s, r) => s + r.percentile, 0) / speedRows.length;
    const sy =
      skillRows.length === 0
        ? a.composite
        : skillRows.reduce((s, r) => s + r.percentile, 0) / skillRows.length;
    archetypeCoords.set(a.key, { sx, sy });
  }

  const allSx = [...archetypeCoords.values()].map((c) => c.sx);
  const allSy = [...archetypeCoords.values()].map((c) => c.sy);
  const medSpeed = median(allSx);
  const medSkill = median(allSy);

  const clusterColors = ["#f97316", "#facc15", "#10b981", "#38bdf8"];

  const quadDefs: {
    label: string;
    test: (v: { sx: number; sy: number }) => boolean;
    color: string;
  }[] = [
    { label: "Attacker", test: (v) => v.sx >= medSpeed && v.sy < medSkill, color: clusterColors[0]! },
    { label: "Playmaker", test: (v) => v.sx >= medSpeed && v.sy >= medSkill, color: clusterColors[2]! },
    { label: "Control / Possession", test: (v) => v.sx < medSpeed && v.sy >= medSkill, color: clusterColors[3]! },
    { label: "Ball Carrier", test: (v) => v.sx < medSpeed && v.sy < medSkill, color: clusterColors[1]! },
  ];

  function archetypeForPlayer(pk: string): ArchetypeSummary {
    const c = archetypeCoords.get(pk) ?? { sx: 50, sy: 50 };
    const plotX = 70 + c.sx * 1.65;
    const plotY = 70 + c.sy * 1.65;

    const clusters = quadDefs.map((def) => {
      const pts = [...archetypeCoords.entries()]
        .filter(([, v]) => def.test(v))
        .map(([, v]) => ({ x: 70 + v.sx * 1.65, y: 70 + v.sy * 1.65 }));
      const mx = pts.length ? pts.reduce((s, p) => s + p.x, 0) / pts.length : plotX;
      const my = pts.length ? pts.reduce((s, p) => s + p.y, 0) / pts.length : plotY;
      return { label: def.label, x: mx, y: my, color: def.color };
    });

    const primary =
      quadDefs.find((d) => d.test(c))?.label ?? "Playmaker";

    return {
      primaryArchetype: primary,
      summary: `Derived from speed-focused vs skill-focused drill percentiles (medians ${medSpeed.toFixed(1)} / ${medSkill.toFixed(
        1,
      )}).`,
      coachInsight: `Plot uses cohort-normalized drill percentiles: x ≈ speed/load drills (${c.sx.toFixed(
        1,
      )}), y ≈ technical/cognitive drills (${c.sy.toFixed(1)}).`,
      clusterPoints: clusters.map((cl) => ({ label: cl.label, x: cl.x, y: cl.y, color: cl.color })),
      playerPoint: {
        label: "",
        x: plotX,
        y: plotY,
        color: "#0f172a",
      },
      traits: [
        {
          label: "Speed index",
          value: `${c.sx.toFixed(1)} avg percentile on Freelap / jump assessments.`,
        },
        {
          label: "Skill index",
          value: `${c.sy.toFixed(1)} avg percentile on technical & cognitive assessments.`,
        },
      ],
    };
  }

  const usedSkills = new Set<SkillFilterOption>();
  for (const r of allRows) {
    usedSkills.add(mapSkill(r.category));
  }
  const skillFilters: SkillFilterOption[] = SKILL_ORDER.filter((s) => s === "All assessments" || usedSkills.has(s));

  const ageSet = new Set<string>();
  for (const r of allRows) ageSet.add(`Tier ${r.ageLetter}`);
  const ageGroups = [...ageSet].sort();

  const players: PlayerDashboardView[] = aggs.map((a) => {
    const rows = [...a.rows].sort((x, y) => x.sessionDate.getTime() - y.sessionDate.getTime());
    const latest = rows[rows.length - 1]!;
    const profile = {
      playerName: `${latest.firstName} ${latest.lastName}`.trim(),
      ageGroup: `Tier ${latest.ageLetter}`,
      gender: latest.genderRaw === "female" ? "Female" : "Male",
      cohortName: `Tier ${latest.ageLetter} ${latest.genderRaw === "female" ? "Female" : "Male"}`,
      trackingWindow: `${rows[0]!.isoDate.slice(0, 4)}–${latest.isoDate.slice(0, 4)}`,
    };

    const rps = rpsByPlayer.get(a.key) ?? 0;

    const byMonth = new Map<string, TrainingSessionRowEnriched[]>();
    for (const r of rows) {
      const mk = monthKey(r.sessionDate);
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

    const summaryMetrics: SummaryMetric[] = [
      {
        label: "APS Score",
        value: currentMonthMean.toFixed(1),
        description: "Mean within-drill percentile across assessments in the latest calendar month with activity.",
        changeText:
          prevMk === undefined
            ? "Single month on record"
            : `${apsDelta >= 0 ? "+" : ""}${apsDelta.toFixed(1)} vs prior active month`,
        changeDirection: prevMk === undefined ? "flat" : apsTrend,
      },
      {
        label: "RPS Score",
        value: rps.toFixed(1),
        description: "Standing vs peers in the same age tier and gender (percentile of overall mean drill percentile).",
        changeText: "Cohort-relative",
        changeDirection: "flat",
      },
      {
        label: "Percentile Rank",
        value: formatOrdinal(rps),
        description: "Approximate cohort percentile from the composite score distribution.",
        changeText: "Based on full training log",
        changeDirection: "flat",
      },
      {
        label: "Performance Band",
        value: bandFromPct(a.composite),
        description: "Mapped from overall mean within-drill percentile (academy-wide, not financial).",
        changeText: "Composite window",
        changeDirection: "flat",
      },
    ];

    const progressPoints: ProgressPoint[] = [];
    for (let i = -11; i <= 0; i++) {
      const d = addMonths(maxDate, i);
      const mk = monthKey(d);
      const list = byMonth.get(mk) ?? [];
      const m = meanPct(list);
      const mRps =
        list.length === 0 ? 0 : list.reduce((s, x) => s + x.cohortPercentile, 0) / list.length;
      progressPoints.push({
        label: monthLabelFromKey(mk),
        aps: Math.round(m * 10) / 10,
        rps: Math.round(mRps * 10) / 10,
        percentile: Math.round(mRps),
      });
    }

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
      const skill = mapSkill(cur.category) as Exclude<SkillFilterOption, "All assessments">;
      const delta = prev ? cur.percentile - prev.percentile : 0;
      const dir: TrendDirection = !prev ? "flat" : Math.abs(delta) < 0.5 ? "flat" : delta > 0 ? "up" : "down";
      assessmentRows.push({
        assessmentName: `${cur.category} ${cur.drill}`,
        category: skill,
        apsScore: Math.round(cur.percentile),
        rpsScore: Math.round(cur.cohortPercentile),
        percentile: Math.round(cur.cohortPercentile),
        performanceBand: bandFromPct(cur.cohortPercentile),
        changeText: prev ? `${delta >= 0 ? "+" : ""}${delta.toFixed(1)}` : "First record",
        changeDirection: dir,
        latestSessionLabel: `Latest: ${cur.isoDate}`,
      });
    }
    assessmentRows.sort((x, y) => y.apsScore - x.apsScore);

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
    const strengths = catMeans.slice(0, 3).map((c) => `${c.cat}: ${c.m.toFixed(1)} avg percentile (${rows.filter((r) => r.category === c.cat).length} sessions).`);
    const improvements = catMeans.slice(-3).reverse().map((c) => `${c.cat}: ${c.m.toFixed(1)} avg percentile — room to lift vs other areas.`);

    const cohortInsight: CohortInsightCopy = {
      title: `How ${profile.playerName} compares with similar players`,
      comparisonGroup: `Compared against ${profile.cohortName} players in the training session extract.`,
      plainLanguage: `Composite standing near ${formatOrdinal(rps)} of peers in the same tier and gender (from mean drill percentiles).`,
      parentFriendly: `Numbers come only from recorded sessions: ${rows.length} rows between ${rows[0]!.isoDate} and ${latest.isoDate}.`,
      rpsDefinition:
        "RPS here is the cohort percentile of the player's average within-drill percentile — a relative standing score, not revenue.",
    };

    const arch = archetypeForPlayer(a.key);
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
      archetype: arch,
      strengths,
      improvements,
      cohortInsight,
    };
  });

  players.sort((a, b) => a.profile.playerName.localeCompare(b.profile.playerName));

  return {
    ageGroups,
    genders: ["Female", "Male"],
    skillFilters,
    dateRanges: ["Last 6 sessions", "Last 12 months", "Full history"],
    players,
  };
}
