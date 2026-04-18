import type { AgeGenderBin, ParticipationPoint, ReturnCohortPoint } from "../types/academy-overview";

export type InsightContext = {
  participation: ParticipationPoint[];
  returnByAge: ReturnCohortPoint[];
  ageDistribution: AgeGenderBin[];
  repeatRatePct: number;
  activePlayers: number;
};

/** Conservative copy tied to displayed aggregates — replace with LLM or rules engine later if desired. */
export function buildOverviewInsights(ctx: InsightContext): string[] {
  const insights: string[] = [];

  if (ctx.participation.length >= 2) {
    const peak = [...ctx.participation].sort((a, b) => b.uniquePlayers - a.uniquePlayers)[0];
    if (peak) {
      insights.push(
        `Assessment participation is strongest in ${peak.label} (${peak.uniquePlayers} unique players in period), based on the current filters.`,
      );
    }
  }

  if (ctx.returnByAge.length) {
    const sorted = [...ctx.returnByAge].filter((r) => r.sampleSize >= 3).sort((a, b) => b.pctReturned - a.pctReturned);
    const top = sorted[0];
    const bottom = sorted[sorted.length - 1];
    if (top && bottom && top.label !== bottom.label) {
      insights.push(
        `Within 90 days of a first assessment, ${top.label} cohorts show a higher share of players booking a follow-up (${top.pctReturned}%) than ${bottom.label} (${bottom.pctReturned}%) — directional only; sample sizes vary.`,
      );
    }
  }

  const ranked = [...ctx.ageDistribution].sort((a, b) => b.total - a.total);
  if (ranked.length >= 2) {
    const [first, second] = ranked;
    insights.push(
      `Most roster volume sits in ${first?.age_group} (${first?.total} players) and ${second?.age_group} (${second?.total}), using latest filtered records.`,
    );
  }

  insights.push(
    `Roughly ${ctx.repeatRatePct.toFixed(1)}% of players active in the selected window have more than one assessment on file — a participation proxy, not financial retention.`,
  );

  insights.push(
    `Active assessed players in view: ${ctx.activePlayers}. Narrow age or gender filters to compare segments with similar denominators.`,
  );

  return insights.slice(0, 5);
}
