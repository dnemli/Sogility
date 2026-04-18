import type { AcademyAssessmentRecord, AcademyPerformanceBand } from "../types/academy-overview";

const FIRST_NAMES = [
  "Jordan",
  "Riley",
  "Alex",
  "Casey",
  "Morgan",
  "Taylor",
  "Jamie",
  "Quinn",
  "Avery",
  "Skyler",
  "Reese",
  "Cameron",
  "Logan",
  "Parker",
  "Drew",
  "Emerson",
  "Rowan",
  "Finley",
  "Hayden",
  "Blake",
];

const LAST_NAMES = [
  "Nguyen",
  "Silva",
  "Patel",
  "Okafor",
  "Kim",
  "Herrera",
  "Bakker",
  "Costa",
  "Larsen",
  "Murphy",
  "Dubois",
  "Santos",
  "Yamamoto",
  "Fischer",
  "Carvalho",
  "Nielsen",
  "Kowalski",
  "Reyes",
  "Olsen",
  "Park",
];

const AGE_GROUPS = ["U9", "U11", "U13", "U15", "U17"] as const;
const GENDERS = ["Female", "Male"] as const;

function bandFromScore(score: number): AcademyPerformanceBand {
  if (score < 46) return "Foundation";
  if (score < 72) return "Developing";
  return "Elite";
}

/** Deterministic pseudo-random 0..1 */
function hash01(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h << 5) - h + seed.charCodeAt(i);
    h |= 0;
  }
  return (Math.abs(h) % 10_007) / 10_007;
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

/**
 * Realistic multi-year assessment log for academy-wide overview mocks.
 * Replace `mockAcademyAssessmentRecords` with API data; keep row shape aligned with `AcademyAssessmentRecord`.
 */
function buildRecords(): AcademyAssessmentRecord[] {
  const rows: AcademyAssessmentRecord[] = [];
  const start = new Date("2024-02-01T12:00:00");
  const end = new Date("2026-04-15T12:00:00");

  let playerIndex = 0;
  for (const ag of AGE_GROUPS) {
    for (const g of GENDERS) {
      const cohort = `${ag} ${g}`;
      const baseCount = ag === "U9" || ag === "U11" ? 14 : ag === "U13" || ag === "U15" ? 18 : 12;
      for (let p = 0; p < baseCount; p++) {
        playerIndex += 1;
        const id = `pl-${String(playerIndex).padStart(4, "0")}`;
        const fn = FIRST_NAMES[(playerIndex + p) % FIRST_NAMES.length]!;
        const ln = LAST_NAMES[(playerIndex * 3 + p) % LAST_NAMES.length]!;
        const name = `${fn} ${ln}`;

        const h = hash01(`${id}-${cohort}`);
        const assessmentCount = 1 + Math.floor(h * 9);
        const baseSkill = 38 + hash01(`${id}-skill`) * 48 + (ag === "U17" ? 4 : 0);

        let cursor = addDays(start, Math.floor(hash01(`${id}-start`) * 120));
        for (let a = 0; a < assessmentCount; a++) {
          if (cursor > end) break;
          const noise = (hash01(`${id}-a-${a}`) - 0.5) * 14;
          const score = Math.min(99, Math.max(20, Math.round(baseSkill + noise + a * 1.2)));
          rows.push({
            player_id: id,
            player_name: name,
            assessment_date: isoDate(cursor),
            age_group: ag,
            gender: g,
            cohort,
            performance_band: bandFromScore(score),
            assessment_score: score,
          });
          const gap =
            12 + Math.floor(hash01(`${id}-gap-${a}`) * 85) + (a % 3 === 0 ? 25 : 0);
          cursor = addDays(cursor, gap);
        }
      }
    }
  }

  return rows;
}

export const mockAcademyAssessmentRecords: AcademyAssessmentRecord[] = buildRecords();

export const overviewAgeGroupOptions = ["All", ...AGE_GROUPS] as const;
export const overviewGenderOptions = ["All", ...GENDERS] as const;
export const overviewDateRangeOptions = [
  "Last 30 days",
  "Last 60 days",
  "Last 90 days",
  "Last 12 months",
] as const;
