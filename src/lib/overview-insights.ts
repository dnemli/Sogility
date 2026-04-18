import type { AgeGenderBin, ParticipationPoint, ReturnCohortPoint } from "../types/academy-overview";

export type InsightContext = {
  participation: ParticipationPoint[];
  returnByAge: ReturnCohortPoint[];
  ageDistribution: AgeGenderBin[];
  repeatRatePct: number;
  activePlayers: number;
  /** Selected date span + filters — keeps copy aligned with the chart and KPIs. */
  periodLabel: string;
  filterLabel: string;
};

/** Conservative copy tied to displayed aggregates — replace with LLM or rules engine later if desired. */
export function buildOverviewInsights(ctx: InsightContext): string[] {
  const insights: string[] = [];

  insights.push(
    `Using ${ctx.periodLabel} · ${ctx.filterLabel}. Figures below match these filters.`,
  );

  if (ctx.participation.length >= 2) {
    const peak = [...ctx.participation].sort((a, b) => b.uniquePlayers - a.uniquePlayers)[0];
    if (peak) {
      insights.push(
        `Busiest period on the chart: ${peak.label} (${peak.uniquePlayers} unique players).`,
      );
    }
  }

  if (ctx.returnByAge.length) {
    const sorted = [...ctx.returnByAge].filter((r) => r.sampleSize >= 3).sort((a, b) => b.pctReturned - a.pctReturned);
    const top = sorted[0];
    const bottom = sorted[sorted.length - 1];
    if (top && bottom && top.label !== bottom.label) {
      insights.push(
        `Within 90 days of a first visit, ${top.label} shows a higher follow-up rate (${top.pctReturned}%) than ${bottom.label} (${bottom.pctReturned}%) — directional; samples differ.`,
      );
    }
  }

  const ranked = [...ctx.ageDistribution].sort((a, b) => b.total - a.total);
  if (ranked.length >= 2) {
    const [first, second] = ranked;
    insights.push(
      `Largest groups: ${first?.age_group} (${first?.total} players), then ${second?.age_group} (${second?.total}).`,
    );
  }

  insights.push(
    `${ctx.activePlayers.toLocaleString()} players had at least one session in this period; about ${ctx.repeatRatePct.toFixed(1)}% of them have two or more assessments on record overall.`,
  );

  return insights.slice(0, 6);
}
