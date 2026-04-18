import { useState } from "react";
import { AcademyOverviewPage } from "./academy-overview-page";
import { DashboardHeader } from "../components/dashboard/dashboard-header";
import { KpiSection } from "../components/dashboard/kpi-section";
import { ProgressTrendChart } from "../components/dashboard/progress-trend-chart";
import { DistributionChart } from "../components/dashboard/distribution-chart";
import { AssessmentBreakdown } from "../components/dashboard/assessment-breakdown";
import { ArchetypeInsightCard } from "../components/dashboard/archetype-insight-card";
import { CohortInsight } from "../components/dashboard/cohort-insight";
import { StrengthsWeaknesses } from "../components/dashboard/strengths-weaknesses";
import { SurfaceCard } from "../components/ui/card";
import { Tabs } from "../components/ui/tabs";
import { dashboardCollection } from "../data/training-data";
import { cn } from "../lib/utils";
import type { AssessmentSubTab, DashboardMainTab, PlayerProfile } from "../types/dashboard";

const mainTabs: DashboardMainTab[] = ["Overview", "Assessment Breakdown"];

const assessmentSubTabs: AssessmentSubTab[] = [
  "Abilities",
  "Cohort comparison",
  "Progress over time",
];

/** Trailing window on the monthly RPS series (each point is a month with sessions). */
const PROGRESS_POINTS = 6;

export function DashboardPage() {
  const initialPlayer = dashboardCollection.players[0];

  const [selectedPlayerId, setSelectedPlayerId] = useState(initialPlayer.id);
  const [mainTab, setMainTab] = useState<DashboardMainTab>("Overview");
  const [assessmentSub, setAssessmentSub] = useState<AssessmentSubTab>("Abilities");

  const currentPlayer =
    dashboardCollection.players.find((player) => player.id === selectedPlayerId) ??
    dashboardCollection.players[0];

  const displayProfile: PlayerProfile = currentPlayer.profile;

  const handlePlayerChange = (playerId: string) => {
    const next =
      dashboardCollection.players.find((player) => player.id === playerId) ??
      dashboardCollection.players[0];
    setSelectedPlayerId(next.id);
  };

  const visibleTrend = currentPlayer.progressTrend.slice(-PROGRESS_POINTS);
  const latestRps =
    currentPlayer.progressTrend.length > 0
      ? (currentPlayer.progressTrend[currentPlayer.progressTrend.length - 1]?.rps ?? 0)
      : 0;
  const derivedInsight = {
    ...currentPlayer.cohortInsight,
    comparisonGroup: `${displayProfile.playerName} is being compared against ${displayProfile.ageGroup} ${displayProfile.gender.toLowerCase()} players who completed the same academy assessment set.`,
    plainLanguage: `This player’s latest monthly cohort-relative standing (RPS-style) is near ${latestRps.toFixed(1)} on the 0–100 scale vs peers in the same tier and gender.`,
  };

  return (
    <main className="min-h-screen px-4 py-6 text-ink sm:px-6 lg:px-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <Tabs tabs={mainTabs} activeTab={mainTab} onChange={setMainTab} />

        {mainTab === "Assessment Breakdown" ? (
          <div className="flex flex-col gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
              Assessment views
            </p>
            <div className="flex flex-wrap gap-2">
              {assessmentSubTabs.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setAssessmentSub(t)}
                  className={cn(
                    "rounded-full border px-3.5 py-2 text-xs font-semibold transition sm:text-sm",
                    assessmentSub === t
                      ? "border-slate-900 bg-slate-900 text-white shadow-md shadow-slate-900/15"
                      : "border-slate-200/90 bg-white/80 text-slate-600 hover:border-slate-300 hover:text-slate-900",
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {mainTab === "Overview" ? (
          <AcademyOverviewPage />
        ) : (
          <>
            <DashboardHeader
              dashboardCollection={dashboardCollection}
              displayProfile={displayProfile}
              selectedPlayerId={selectedPlayerId}
              onPlayerChange={handlePlayerChange}
            />

            <KpiSection metrics={currentPlayer.summaryMetrics} />

            {assessmentSub === "Progress over time" ? (
              <section className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
                <ProgressTrendChart
                  title="Cohort-relative standing over time"
                  description="Mean cohort drill percentile by month (RPS-style), for each month this player has sessions. Higher values indicate stronger standing vs same-tier peers in that month."
                  points={visibleTrend}
                />
                <DistributionChart
                  title="Cohort distribution snapshot"
                  description="Where this player’s composite mean percentile sits within the peer distribution."
                  distribution={{
                    ...currentPlayer.cohortDistribution,
                    cohortLabel: displayProfile.cohortName,
                  }}
                />
              </section>
            ) : null}

            {assessmentSub === "Abilities" ? (
              <>
                <section className="grid gap-6 xl:grid-cols-[1.45fr_0.95fr]">
                  <AssessmentBreakdown
                    abilities={currentPlayer.abilityBreakdown}
                    playerName={currentPlayer.profile.playerName}
                  />
                  <ArchetypeInsightCard archetype={currentPlayer.archetype} />
                </section>
                <StrengthsWeaknesses
                  strengths={currentPlayer.strengths}
                  improvements={currentPlayer.improvements}
                />
              </>
            ) : null}

            {assessmentSub === "Cohort comparison" ? (
              <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                <CohortInsight insight={derivedInsight} />
                <SurfaceCard className="overflow-hidden">
                  <div className="flex flex-col gap-4">
                    <div>
                      <p className="text-sm font-medium uppercase tracking-[0.24em] text-emerald-700/70">
                        Cohort context
                      </p>
                      <h3 className="mt-2 text-xl font-semibold text-slate-900">
                        Reading the scores with confidence
                      </h3>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-white/80 bg-white/80 p-4">
                        <p className="text-sm font-medium text-slate-500">Selected cohort</p>
                        <p className="mt-2 text-lg font-semibold text-slate-900">
                          {displayProfile.cohortName}
                        </p>
                        <p className="mt-1 text-sm text-slate-600">
                          {displayProfile.ageGroup} players, {displayProfile.gender}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-white/80 bg-white/80 p-4">
                        <p className="text-sm font-medium text-slate-500">Benchmark lens</p>
                        <p className="mt-2 text-lg font-semibold text-slate-900">
                          APS uses cohort-specific benchmark cutoffs
                        </p>
                        <p className="mt-1 text-sm text-slate-600">
                          The colored band tells you whether performance is foundational, developing, approaching, strong, or elite.
                        </p>
                      </div>
                    </div>
                  </div>
                </SurfaceCard>
              </section>
            ) : null}
          </>
        )}
      </div>
    </main>
  );
}
