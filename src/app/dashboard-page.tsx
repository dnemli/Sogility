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
import type {
  DashboardTab,
  DateRangeOption,
  PlayerProfile,
  SkillFilterOption,
} from "../types/dashboard";

const dashboardTabs: DashboardTab[] = [
  "Overview",
  "Assessment Breakdown",
  "Cohort Comparison",
  "Progress Over Time",
];

export function DashboardPage() {
  const initialPlayer = dashboardCollection.players[0];

  const [selectedPlayerId, setSelectedPlayerId] = useState(initialPlayer.id);
  const [selectedAgeGroup, setSelectedAgeGroup] = useState(initialPlayer.profile.ageGroup);
  const [selectedGender, setSelectedGender] = useState(initialPlayer.profile.gender);
  const [selectedSkill, setSelectedSkill] = useState<SkillFilterOption>("All assessments");
  const [selectedDateRange, setSelectedDateRange] = useState<DateRangeOption>("Last 6 sessions");
  const [activeTab, setActiveTab] = useState<DashboardTab>("Overview");

  const currentPlayer =
    dashboardCollection.players.find((player) => player.id === selectedPlayerId) ??
    dashboardCollection.players[0];

  const selectedCohortName = `${selectedAgeGroup} ${selectedGender} Cohort`;
  const displayProfile: PlayerProfile = {
    ...currentPlayer.profile,
    ageGroup: selectedAgeGroup,
    gender: selectedGender,
    cohortName: selectedCohortName,
  };

  const handlePlayerChange = (playerId: string) => {
    const nextPlayer =
      dashboardCollection.players.find((player) => player.id === playerId) ??
      dashboardCollection.players[0];

    setSelectedPlayerId(nextPlayer.id);
    setSelectedAgeGroup(nextPlayer.profile.ageGroup);
    setSelectedGender(nextPlayer.profile.gender);
  };

  const filteredAssessments =
    selectedSkill === "All assessments"
      ? currentPlayer.assessmentBreakdown
      : currentPlayer.assessmentBreakdown.filter(
          (assessment) => assessment.category === selectedSkill,
        );

  const trendPointCount = selectedDateRange === "Last 6 sessions" ? 6 : currentPlayer.progressTrend.length;
  const visibleTrend = currentPlayer.progressTrend.slice(-trendPointCount);
  const latestPercentile =
    currentPlayer.progressTrend[currentPlayer.progressTrend.length - 1]?.percentile ?? 0;
  const derivedInsight = {
    ...currentPlayer.cohortInsight,
    comparisonGroup: `${displayProfile.playerName} is being compared against ${displayProfile.ageGroup} ${displayProfile.gender.toLowerCase()} players who completed the same academy assessment set.`,
    plainLanguage: `This player is currently performing above ${latestPercentile}% of players in the same age and gender cohort.`,
  };

  return (
    <main className="min-h-screen px-4 py-6 text-ink sm:px-6 lg:px-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <Tabs tabs={dashboardTabs} activeTab={activeTab} onChange={setActiveTab} />

        {activeTab === "Overview" ? (
          <AcademyOverviewPage />
        ) : (
          <>
            <DashboardHeader
              dashboardCollection={dashboardCollection}
              displayProfile={displayProfile}
              selectedPlayerId={selectedPlayerId}
              onPlayerChange={handlePlayerChange}
              selectedAgeGroup={selectedAgeGroup}
              onAgeGroupChange={setSelectedAgeGroup}
              selectedGender={selectedGender}
              onGenderChange={setSelectedGender}
              selectedSkill={selectedSkill}
              onSkillChange={setSelectedSkill}
              selectedDateRange={selectedDateRange}
              onDateRangeChange={setSelectedDateRange}
            />

            <KpiSection metrics={currentPlayer.summaryMetrics} />

            {activeTab === "Progress Over Time" && (
              <section className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
                <ProgressTrendChart
                  title="Score progression across recent sessions"
                  description="Track how benchmark fit and cohort standing are trending over repeated training sessions."
                  points={visibleTrend}
                  dateRangeLabel={selectedDateRange}
                />
                <DistributionChart
                  title="Cohort distribution snapshot"
                  description="See where this player sits inside the current peer distribution."
                  distribution={{
                    ...currentPlayer.cohortDistribution,
                    cohortLabel: displayProfile.cohortName,
                  }}
                  selectedAssessment={selectedSkill}
                />
              </section>
            )}

            {activeTab === "Assessment Breakdown" && (
              <section className="grid gap-6 xl:grid-cols-[1.45fr_0.95fr]">
                <AssessmentBreakdown
                  assessments={filteredAssessments}
                  selectedSkill={selectedSkill}
                  playerName={currentPlayer.profile.playerName}
                />
                <ArchetypeInsightCard archetype={currentPlayer.archetype} />
              </section>
            )}

            {activeTab === "Assessment Breakdown" && (
              <StrengthsWeaknesses
                strengths={currentPlayer.strengths}
                improvements={currentPlayer.improvements}
              />
            )}

            {activeTab === "Cohort Comparison" && (
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
            )}
          </>
        )}
      </div>
    </main>
  );
}
