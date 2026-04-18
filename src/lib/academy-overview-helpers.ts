import type {
  AcademyAssessmentRecord,
  ActivitySegment,
  AgeGenderBin,
  AvgDaysByAgeRow,
  CohortBandRow,
  EngagementSummary,
  GenderFilter,
  OverviewDateRangePreset,
  ParticipationPoint,
  ReturnCohortPoint,
} from "../types/academy-overview";

const MS_DAY = 86_400_000;

export function parseDay(iso: string): Date {
  return new Date(`${iso}T12:00:00`);
}

export function addDays(d: Date, n: number): Date {
  return new Date(d.getTime() + n * MS_DAY);
}

export function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / MS_DAY);
}

export function getPresetStart(preset: OverviewDateRangePreset, end: Date): Date {
  const map: Record<OverviewDateRangePreset, number> = {
    "Last 30 days": 30,
    "Last 60 days": 60,
    "Last 90 days": 90,
    "Last 12 months": 365,
  };
  return addDays(end, -map[preset]);
}

function matchesDemographics(
  r: AcademyAssessmentRecord,
  ageGroup: string,
  gender: GenderFilter,
): boolean {
  if (ageGroup !== "All" && r.age_group !== ageGroup) return false;
  if (gender !== "All" && r.gender !== gender) return false;
  return true;
}

function filterDemographics(
  records: AcademyAssessmentRecord[],
  ageGroup: string,
  gender: GenderFilter,
): AcademyAssessmentRecord[] {
  return records.filter((r) => matchesDemographics(r, ageGroup, gender));
}

function uniquePlayersInRange(
  records: AcademyAssessmentRecord[],
  start: Date,
  end: Date,
): Set<string> {
  const set = new Set<string>();
  for (const r of records) {
    const d = parseDay(r.assessment_date);
    if (d >= start && d <= end) set.add(r.player_id);
  }
  return set;
}

/** Roster scope: unique players matching age/gender filters (ignores date). */
export function getTotalPlayersInSystem(
  records: AcademyAssessmentRecord[],
  ageGroup: string,
  gender: GenderFilter,
): number {
  const scoped = filterDemographics(records, ageGroup, gender);
  return new Set(scoped.map((r) => r.player_id)).size;
}

export function getActiveAssessedPlayers(
  records: AcademyAssessmentRecord[],
  ageGroup: string,
  gender: GenderFilter,
  rangeStart: Date,
  rangeEnd: Date,
): number {
  const scoped = filterDemographics(records, ageGroup, gender);
  return uniquePlayersInRange(scoped, rangeStart, rangeEnd).size;
}

/**
 * Among players with ≥1 assessment in the selected window, share with ≥2 assessments
 * anywhere in the filtered demographic dataset (repeat participation proxy — not revenue retention).
 */
export function getRepeatAssessmentRate(
  records: AcademyAssessmentRecord[],
  ageGroup: string,
  gender: GenderFilter,
  rangeStart: Date,
  rangeEnd: Date,
): number {
  const scoped = filterDemographics(records, ageGroup, gender);
  const activeInWindow = uniquePlayersInRange(scoped, rangeStart, rangeEnd);
  if (activeInWindow.size === 0) return 0;

  const counts = new Map<string, number>();
  for (const r of scoped) {
    counts.set(r.player_id, (counts.get(r.player_id) ?? 0) + 1);
  }

  let repeats = 0;
  for (const id of activeInWindow) {
    if ((counts.get(id) ?? 0) >= 2) repeats += 1;
  }
  return repeats / activeInWindow.size;
}

/** Mean gap between consecutive assessments (players with 2+ rows). Median often more robust — exposed separately in UI. */
export function getAverageDaysBetweenAssessments(
  records: AcademyAssessmentRecord[],
  ageGroup: string,
  gender: GenderFilter,
): { mean: number; median: number; pairs: number } {
  const scoped = filterDemographics(records, ageGroup, gender);
  const byPlayer = new Map<string, Date[]>();
  for (const r of scoped) {
    const list = byPlayer.get(r.player_id) ?? [];
    list.push(parseDay(r.assessment_date));
    byPlayer.set(r.player_id, list);
  }

  const gaps: number[] = [];
  for (const dates of byPlayer.values()) {
    if (dates.length < 2) continue;
    const sorted = [...dates].sort((a, b) => a.getTime() - b.getTime());
    for (let i = 1; i < sorted.length; i++) {
      gaps.push(daysBetween(sorted[i - 1]!, sorted[i]!));
    }
  }

  if (gaps.length === 0) return { mean: 0, median: 0, pairs: 0 };

  const mean = gaps.reduce((a, b) => a + b, 0) / gaps.length;
  const sortedGaps = [...gaps].sort((a, b) => a - b);
  const mid = Math.floor(sortedGaps.length / 2);
  const median =
    sortedGaps.length % 2 === 0
      ? (sortedGaps[mid - 1]! + sortedGaps[mid]!) / 2
      : sortedGaps[mid]!;

  return { mean, median, pairs: gaps.length };
}

export function getParticipationSeries(
  records: AcademyAssessmentRecord[],
  ageGroup: string,
  gender: GenderFilter,
  rangeStart: Date,
  rangeEnd: Date,
  granularity: "weekly" | "monthly",
): ParticipationPoint[] {
  const scoped = filterDemographics(records, ageGroup, gender).filter((r) => {
    const d = parseDay(r.assessment_date);
    return d >= rangeStart && d <= rangeEnd;
  });

  const bucketKey = (d: Date): string => {
    if (granularity === "monthly") {
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    }
    const start = new Date(d);
    const day = start.getDay();
    const diff = (day + 6) % 7;
    start.setDate(start.getDate() - diff);
    return start.toISOString().slice(0, 10);
  };

  const labelFor = (key: string): string => {
    if (granularity === "monthly") {
      const [y, m] = key.split("-");
      const month = new Date(Number(y), Number(m) - 1, 1);
      return month.toLocaleString("en-US", { month: "short", year: "2-digit" });
    }
    const d = parseDay(key);
    const end = addDays(d, 6);
    const a = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const b = end.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    return `${a}–${b}`;
  };

  const buckets = new Map<string, Set<string>>();
  for (const r of scoped) {
    const d = parseDay(r.assessment_date);
    const key = bucketKey(d);
    const set = buckets.get(key) ?? new Set<string>();
    set.add(r.player_id);
    buckets.set(key, set);
  }

  const keys = [...buckets.keys()].sort();
  return keys.map((k) => ({
    label: labelFor(k),
    uniquePlayers: buckets.get(k)?.size ?? 0,
  }));
}

export function getEngagementSummary(
  records: AcademyAssessmentRecord[],
  ageGroup: string,
  gender: GenderFilter,
  recentEnd: Date,
): EngagementSummary {
  const recentStart = addDays(recentEnd, -60);
  const scoped = filterDemographics(records, ageGroup, gender);
  const totalUniquePlayers = new Set(scoped.map((r) => r.player_id)).size;

  const last60 = uniquePlayersInRange(scoped, recentStart, recentEnd);
  const counts = new Map<string, number>();
  for (const r of scoped) {
    counts.set(r.player_id, (counts.get(r.player_id) ?? 0) + 1);
  }

  let multi = 0;
  for (const id of last60) {
    if ((counts.get(id) ?? 0) > 1) multi += 1;
  }

  const repeatAssessmentRate = last60.size === 0 ? 0 : multi / last60.size;

  return {
    totalUniquePlayers,
    assessedLast60Days: last60.size,
    assessedMoreThanOnce: multi,
    repeatAssessmentRate,
  };
}

/** % who took a second assessment within 90 days of first (by age group cohort). */
export function getReturnAfterFirstSeries(
  records: AcademyAssessmentRecord[],
  ageGroup: string,
  gender: GenderFilter,
): ReturnCohortPoint[] {
  const scoped = filterDemographics(records, ageGroup, gender);
  const byPlayer = new Map<string, Date[]>();
  for (const r of scoped) {
    const list = byPlayer.get(r.player_id) ?? [];
    list.push(parseDay(r.assessment_date));
    byPlayer.set(r.player_id, list);
  }

  const byAge = new Map<string, { returned: number; eligible: number }>();
  const ageGroups = [...new Set(scoped.map((r) => r.age_group))].sort();

  for (const ag of ageGroups) {
    byAge.set(ag, { returned: 0, eligible: 0 });
  }

  for (const [playerId, dates] of byPlayer) {
    if (dates.length < 2) continue;
    const sorted = [...dates].sort((a, b) => a.getTime() - b.getTime());
    const first = sorted[0]!;
    const sample = scoped.find((r) => r.player_id === playerId);
    if (!sample) continue;
    const bucket = byAge.get(sample.age_group);
    if (!bucket) continue;
    bucket.eligible += 1;
    const second = sorted[1]!;
    if (daysBetween(first, second) <= 90) bucket.returned += 1;
  }

  return ageGroups.map((ag) => {
    const b = byAge.get(ag) ?? { returned: 0, eligible: 0 };
    const pct = b.eligible === 0 ? 0 : (b.returned / b.eligible) * 100;
    return { label: ag, pctReturned: Math.round(pct * 10) / 10, sampleSize: b.eligible };
  });
}

export function getActivitySegments(
  records: AcademyAssessmentRecord[],
  ageGroup: string,
  gender: GenderFilter,
): ActivitySegment[] {
  const scoped = filterDemographics(records, ageGroup, gender);
  const counts = new Map<string, number>();
  for (const r of scoped) {
    counts.set(r.player_id, (counts.get(r.player_id) ?? 0) + 1);
  }

  let one = 0;
  let ret = 0;
  let high = 0;
  for (const n of counts.values()) {
    if (n === 1) one += 1;
    else if (n >= 2 && n <= 4) ret += 1;
    else high += 1;
  }

  const total = one + ret + high;
  const pct = (x: number) => (total === 0 ? 0 : Math.round((x / total) * 1000) / 10);

  return [
    { segment: "One-time", count: one, pct: pct(one) },
    { segment: "Returning", count: ret, pct: pct(ret) },
    { segment: "Highly active", count: high, pct: pct(high) },
  ];
}

export function getAvgDaysByAgeGroup(
  records: AcademyAssessmentRecord[],
  ageGroupFilter: string,
  gender: GenderFilter,
): AvgDaysByAgeRow[] {
  const base = filterDemographics(records, "All", gender);
  const scoped =
    ageGroupFilter === "All" ? base : base.filter((r) => r.age_group === ageGroupFilter);

  const ages =
    ageGroupFilter === "All"
      ? [...new Set(base.map((r) => r.age_group))].sort()
      : [ageGroupFilter];

  return ages.map((ag) => {
    const slice = scoped.filter((r) => r.age_group === ag);
    const { mean, median } = getAverageDaysBetweenAssessments(slice, "All", "All");
    const assessmentCounts = new Map<string, number>();
    for (const r of slice) {
      assessmentCounts.set(r.player_id, (assessmentCounts.get(r.player_id) ?? 0) + 1);
    }
    let samplePlayers = 0;
    for (const n of assessmentCounts.values()) {
      if (n >= 2) samplePlayers += 1;
    }

    return {
      age_group: ag,
      avgDays: Math.round(mean * 10) / 10,
      medianDays: Math.round(median * 10) / 10,
      samplePlayers,
    };
  });
}

export function getAgeGenderDistribution(
  records: AcademyAssessmentRecord[],
  ageGroup: string,
  gender: GenderFilter,
): AgeGenderBin[] {
  const scoped = filterDemographics(records, ageGroup, gender);
  const byAge = new Map<string, { f: Set<string>; m: Set<string> }>();
  for (const r of scoped) {
    const slot = byAge.get(r.age_group) ?? { f: new Set<string>(), m: new Set<string>() };
    if (r.gender === "Female") slot.f.add(r.player_id);
    if (r.gender === "Male") slot.m.add(r.player_id);
    byAge.set(r.age_group, slot);
  }

  const ages = [...byAge.keys()].sort();
  return ages.map((ag) => {
    const slot = byAge.get(ag)!;
    const female = slot.f.size;
    const male = slot.m.size;
    return { age_group: ag, female, male, total: female + male };
  });
}

export function getCohortBandComposition(
  records: AcademyAssessmentRecord[],
  ageGroup: string,
  gender: GenderFilter,
): CohortBandRow[] {
  const scoped = filterDemographics(records, ageGroup, gender);
  const latestByPlayer = new Map<string, AcademyAssessmentRecord>();

  for (const r of scoped) {
    const prev = latestByPlayer.get(r.player_id);
    if (!prev || parseDay(r.assessment_date) > parseDay(prev.assessment_date)) {
      latestByPlayer.set(r.player_id, r);
    }
  }

  const cohortMap = new Map<string, CohortBandRow>();
  for (const r of latestByPlayer.values()) {
    const row =
      cohortMap.get(r.cohort) ??
      ({
        cohort: r.cohort,
        Foundation: 0,
        Developing: 0,
        Elite: 0,
        total: 0,
      } satisfies CohortBandRow);

    row[r.performance_band] += 1;
    row.total += 1;
    cohortMap.set(r.cohort, row);
  }

  return [...cohortMap.values()].sort((a, b) => a.cohort.localeCompare(b.cohort));
}
