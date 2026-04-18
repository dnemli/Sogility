export type TrainingSessionRow = {
  firstName: string;
  lastName: string;
  genderRaw: "male" | "female";
  ageLetter: string;
  category: string;
  drill: string;
  score: number;
  sessionDate: Date;
  isoDate: string;
};

export const trainingSessionCategoryDrillKey = (r: Pick<TrainingSessionRow, "category" | "drill">) =>
  `${r.category}||${r.drill}`;

/** Parse `Data/training_session.csv` (8 columns, no header). */
export function parseTrainingSessionCsv(text: string): TrainingSessionRow[] {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  const out: TrainingSessionRow[] = [];

  for (const line of lines) {
    const p = line.split(",");
    if (p.length !== 8) continue;

    const score = parseFloat(p[6]!);
    if (Number.isNaN(score)) continue;

    const rawDate = p[7]!.trim();
    const sessionDate = new Date(rawDate.includes("T") ? rawDate : rawDate.replace(" ", "T"));

    if (Number.isNaN(sessionDate.getTime())) continue;

    const g = p[2]!.toLowerCase();
    out.push({
      firstName: p[0]!.trim(),
      lastName: p[1]!.trim(),
      genderRaw: g === "female" ? "female" : "male",
      ageLetter: p[3]!.trim(),
      category: p[4]!.trim(),
      drill: p[5]!.trim(),
      score,
      sessionDate,
      isoDate: sessionDate.toISOString().slice(0, 10),
    });
  }

  return out;
}

function percentileInSample(sample: number[], value: number): number {
  if (sample.length === 0) return 50;
  const below = sample.filter((s) => s < value).length;
  const equal = sample.filter((s) => s === value).length;
  return ((below + equal / 2) / sample.length) * 100;
}

export type TrainingSessionRowWithPct = TrainingSessionRow & { percentile: number };

/** Percentile of each score within its (category, drill) bucket — used for APS/RPS and overview bands. */
export function addPercentiles(rows: TrainingSessionRow[]): TrainingSessionRowWithPct[] {
  const byKey = new Map<string, number[]>();
  for (const r of rows) {
    const k = trainingSessionCategoryDrillKey(r);
    byKey.set(k, [...(byKey.get(k) ?? []), r.score]);
  }

  return rows.map((r) => {
    const scores = byKey.get(trainingSessionCategoryDrillKey(r)) ?? [r.score];
    return { ...r, percentile: percentileInSample(scores, r.score) };
  });
}

export function playerKey(r: Pick<TrainingSessionRow, "firstName" | "lastName" | "genderRaw">): string {
  return `${r.firstName}|${r.lastName}|${r.genderRaw}`;
}

