import { useMemo, useState } from "react";
import {
  academyAssessmentRecords,
  overviewAgeGroupOptions,
  overviewDateRangeOptions,
  overviewGenderOptions,
  reportingDateEnd,
  reportingDateStart,
} from "../data/training-data";
import {
  addDays,
  daysBetween,
  getActiveAssessedPlayers,
  getAgeGenderDistribution,
  getAvgDaysByAgeGroup,
  getAverageDaysBetweenAssessments,
  getCohortBandComposition,
  getEngagementSummary,
  getParticipationSeries,
  getPresetStart,
  getRepeatAssessmentRate,
  getReturnAfterFirstSeries,
  getTotalPlayersInSystem,
  getActivitySegments,
} from "../lib/academy-overview-helpers";
import { buildOverviewInsights } from "../lib/overview-insights";
import { OverviewHeader } from "../components/overview/overview-header";
import { SummaryKpiCards } from "../components/overview/summary-kpi-cards";
import { ParticipationOverTimeChart } from "../components/overview/participation-over-time-chart";
import { EngagementRetentionSection } from "../components/overview/engagement-retention-section";
import { AvgDaysBetweenAssessments } from "../components/overview/avg-days-between-assessments";
import { AgeGroupDistributionChart } from "../components/overview/age-group-distribution-chart";
import { CohortPerformanceComposition } from "../components/overview/cohort-performance-composition";
import { InsightPanel } from "../components/overview/insight-panel";
import type {
  GenderFilter,
  OverviewDateRangePreset,
  OverviewGranularity,
} from "../types/academy-overview";

const records = academyAssessmentRecords;

function formatPctChange(current: number, prior: number): { text: string; dir: "up" | "down" | "flat" } {
  if (prior === 0 && current === 0) return { text: "No prior activity", dir: "flat" };
  if (prior === 0) return { text: "New signal vs prior window", dir: "up" };
  const delta = ((current - prior) / prior) * 100;
  const rounded = Math.abs(delta) < 0.05 ? 0 : Math.round(delta * 10) / 10;
  if (rounded === 0) return { text: "Flat vs prior window", dir: "flat" };
  const dir = delta > 0 ? "up" : "down";
  return { text: `${delta > 0 ? "+" : ""}${rounded}% vs prior window`, dir };
}

export function AcademyOverviewPage() {
  const [dateRange, setDateRange] = useState<OverviewDateRangePreset>("Full data (CSV)");
  const [ageGroup, setAgeGroup] = useState<string>("All");
  const [gender, setGender] = useState<GenderFilter>("All");
  const [granularity, setGranularity] = useState<OverviewGranularity>("monthly");
  const [cadenceAgeFilter, setCadenceAgeFilter] = useState<string>("All");

  const rangeEnd = reportingDateEnd;
  const rangeStart = getPresetStart(dateRange, rangeEnd, reportingDateStart);

  const periodLabel = useMemo(
    () =>
      `${rangeStart.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} – ${rangeEnd.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`,
    [rangeStart, rangeEnd],
  );

  const filterLabel = useMemo(() => {
    const parts: string[] = [];
    parts.push(ageGroup === "All" ? "All age groups" : ageGroup);
    parts.push(gender === "All" ? "All genders" : gender);
    return parts.join(" · ");
  }, [ageGroup, gender]);

  const kpis = useMemo(() => {
    const totalPlayers = getTotalPlayersInSystem(records, ageGroup, gender);

    const lenInclusive = daysBetween(rangeStart, rangeEnd) + 1;
    const priorRangeEnd = addDays(rangeStart, -1);
    const priorRangeStart = addDays(priorRangeEnd, -(lenInclusive - 1));

    const activeInRange = getActiveAssessedPlayers(records, ageGroup, gender, rangeStart, rangeEnd);
    const activePrior = getActiveAssessedPlayers(records, ageGroup, gender, priorRangeStart, priorRangeEnd);
    const activeTrend = formatPctChange(activeInRange, activePrior);

    const repeatRate = getRepeatAssessmentRate(records, ageGroup, gender, rangeStart, rangeEnd);
    const repeatPrior = getRepeatAssessmentRate(records, ageGroup, gender, priorRangeStart, priorRangeEnd);
    const repeatTrend = formatPctChange(repeatRate * 100, repeatPrior * 100);

    const avg = getAverageDaysBetweenAssessments(records, ageGroup, gender);

    return [
      {
        label: "Total players in system",
        value: totalPlayers.toLocaleString(),
        description: "Players in the roster for your age and gender filters (all dates).",
        changeText: "Full roster scope",
        changeDirection: "flat" as const,
      },
      {
        label: "Players active this period",
        value: activeInRange.toLocaleString(),
        description: "Had at least one assessment in the selected date range (matches the chart).",
        changeText: activeTrend.text,
        changeDirection: activeTrend.dir,
      },
      {
        label: "Share with 2+ assessments",
        value: `${(repeatRate * 100).toFixed(1)}%`,
        description:
          "Of players active this period, percent who have more than one assessment on file anywhere in history.",
        changeText: repeatTrend.text,
        changeDirection: repeatTrend.dir,
      },
      {
        label: "Average days between assessments",
        value: avg.pairs === 0 ? "—" : `${avg.mean.toFixed(1)} days`,
        description:
          "Mean gap between consecutive assessments for players with repeats. Median is often less sensitive to outliers.",
        changeText: avg.pairs === 0 ? "Needs repeat assessments" : "Cadence metric",
        changeDirection: "flat" as const,
      },
    ];
  }, [ageGroup, gender, dateRange, rangeEnd, rangeStart]);

  const participation = useMemo(
    () => getParticipationSeries(records, ageGroup, gender, rangeStart, rangeEnd, granularity),
    [ageGroup, gender, rangeStart, rangeEnd, granularity],
  );

  const engagement = useMemo(
    () => getEngagementSummary(records, ageGroup, gender, rangeStart, rangeEnd),
    [ageGroup, gender, rangeStart, rangeEnd],
  );

  const returnSeries = useMemo(() => getReturnAfterFirstSeries(records, ageGroup, gender), [ageGroup, gender]);

  const segments = useMemo(() => getActivitySegments(records, ageGroup, gender), [ageGroup, gender]);

  const cadenceRows = useMemo(
    () => getAvgDaysByAgeGroup(records, cadenceAgeFilter, gender),
    [cadenceAgeFilter, gender],
  );

  const ageDistribution = useMemo(
    () => getAgeGenderDistribution(records, ageGroup, gender),
    [ageGroup, gender],
  );

  const cohortBands = useMemo(
    () => getCohortBandComposition(records, ageGroup, gender),
    [ageGroup, gender],
  );

  const insights = useMemo(() => {
    const activePlayers = getActiveAssessedPlayers(records, ageGroup, gender, rangeStart, rangeEnd);
    const repeatRate = getRepeatAssessmentRate(records, ageGroup, gender, rangeStart, rangeEnd);
    return buildOverviewInsights({
      participation,
      returnByAge: returnSeries,
      ageDistribution,
      repeatRatePct: repeatRate * 100,
      activePlayers,
      periodLabel,
      filterLabel,
    });
  }, [
    ageDistribution,
    ageGroup,
    filterLabel,
    gender,
    participation,
    periodLabel,
    returnSeries,
    rangeEnd,
    rangeStart,
  ]);

  return (
    <div className="flex flex-col gap-6">
      <OverviewHeader
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        dateRangeOptions={overviewDateRangeOptions}
        ageGroup={ageGroup}
        onAgeGroupChange={setAgeGroup}
        ageGroupOptions={overviewAgeGroupOptions}
        gender={gender}
        onGenderChange={setGender}
        genderOptions={overviewGenderOptions}
      />

      <SummaryKpiCards metrics={kpis} />

      <div className="grid gap-6 xl:grid-cols-[1.55fr_0.95fr]">
        <ParticipationOverTimeChart
          data={participation}
          granularity={granularity}
          onGranularityChange={setGranularity}
        />
        <InsightPanel insights={insights} />
      </div>

      <EngagementRetentionSection
        summary={engagement}
        returnSeries={returnSeries}
        segments={segments}
        periodLabel={periodLabel}
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <AvgDaysBetweenAssessments
          rows={cadenceRows}
          ageFilter={cadenceAgeFilter}
          onAgeFilterChange={setCadenceAgeFilter}
          ageOptions={overviewAgeGroupOptions}
          genderLabel={gender}
        />
        <AgeGroupDistributionChart data={ageDistribution} />
      </div>

      <CohortPerformanceComposition rows={cohortBands} />
    </div>
  );
}
