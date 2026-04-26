import { useState } from "react";
import { AcademyOverviewPage } from "./academy-overview-page";
import { DashboardHeader } from "../components/dashboard/dashboard-header";
import { KpiSection } from "../components/dashboard/kpi-section";
import { ProgressTrendChart } from "../components/dashboard/progress-trend-chart";
import { DistributionChart } from "../components/dashboard/distribution-chart";
import { AssessmentBreakdown } from "../components/dashboard/assessment-breakdown";
import { ArchetypeInsightCard } from "../components/dashboard/archetype-insight-card";
import { SurfaceCard } from "../components/ui/card";
import { Tabs } from "../components/ui/tabs";
import { dashboardCollection } from "../data/training-data";
import { cn } from "../lib/utils";
import { PlayerSearch } from "../components/dashboard/player-search";
import type { PlayerDashboardView } from "../types/dashboard";

type RoleView = "Trainer View" | "Parent/Player View";
type TrainerTab = "Dashboard/Home" | "Players" | "New Assessment";
type TrainerPlayersTab = "Abilities" | "Progress over time";
type ParentTab = "Overview" | "Progress";

const trainerTabs: TrainerTab[] = ["Dashboard/Home", "Players", "New Assessment"];
const trainerPlayerTabs: TrainerPlayersTab[] = ["Abilities", "Progress over time"];
const parentTabs: ParentTab[] = ["Overview", "Progress"];

/** Trailing window on the monthly SGI series (each point is a month with sessions). */
const PROGRESS_POINTS = 6;

type DashboardPageProps = {
  role: RoleView;
  selectedPlayerId: string;
  onPlayerChange: (playerId: string) => void;
};

function resolveSelectedPlayer(selectedPlayerId: string): PlayerDashboardView {
  return (
    dashboardCollection.players.find((player) => player.id === selectedPlayerId) ??
    dashboardCollection.players[0]
  );
}

function TrainerFlow({
  selectedPlayerId,
  onPlayerChange,
}: Pick<DashboardPageProps, "selectedPlayerId" | "onPlayerChange">) {
  const [trainerTab, setTrainerTab] = useState<TrainerTab>("Dashboard/Home");
  const [trainerPlayerTab, setTrainerPlayerTab] = useState<TrainerPlayersTab>("Abilities");
  const currentPlayer = resolveSelectedPlayer(selectedPlayerId);
  const visibleTrend = currentPlayer.progressTrend.slice(-PROGRESS_POINTS);

  return (
    <div className="flex flex-col gap-6">
      <Tabs tabs={trainerTabs} activeTab={trainerTab} onChange={setTrainerTab} />

      {trainerTab === "Dashboard/Home" ? (
        <AcademyOverviewPage />
      ) : null}

      {trainerTab === "Players" ? (
        <>
          <DashboardHeader
            dashboardCollection={dashboardCollection}
            displayProfile={currentPlayer.profile}
            selectedPlayerId={currentPlayer.id}
            onPlayerChange={onPlayerChange}
          />

          <KpiSection metrics={currentPlayer.summaryMetrics} />

          <div className="flex flex-col gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
              Player detail views
            </p>
            <div className="flex flex-wrap gap-2">
              {trainerPlayerTabs.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setTrainerPlayerTab(tab)}
                  className={cn(
                    "rounded-full border px-3.5 py-2 text-xs font-semibold transition sm:text-sm",
                    trainerPlayerTab === tab
                      ? "border-slate-900 bg-slate-900 text-white shadow-md shadow-slate-900/15"
                      : "border-slate-200/90 bg-white/80 text-slate-600 hover:border-slate-300 hover:text-slate-900",
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {trainerPlayerTab === "Progress over time" ? (
            <section className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
              <ProgressTrendChart
                title="SGI over time"
                description="Monthly SGI trend for each month this player has sessions. Higher values indicate stronger standing vs similar peers."
                points={visibleTrend}
              />
              <DistributionChart
                title="Cohort distribution snapshot"
                description="Where this player's SGI sits within the peer distribution."
                distribution={{
                  ...currentPlayer.cohortDistribution,
                  cohortLabel: currentPlayer.profile.cohortName,
                }}
              />
            </section>
          ) : null}

          {trainerPlayerTab === "Abilities" ? (
            <section className="grid gap-6 xl:grid-cols-[1.45fr_0.95fr]">
              <AssessmentBreakdown
                abilities={currentPlayer.abilityBreakdown}
                playerName={currentPlayer.profile.playerName}
              />
              <ArchetypeInsightCard archetype={currentPlayer.archetype} />
            </section>
          ) : null}
        </>
      ) : null}

      {trainerTab === "New Assessment" ? (
        <SurfaceCard>
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              New Assessment
            </p>
            <h2 className="text-xl font-semibold text-slate-900">Assessment input flow coming next phase</h2>
            <p className="text-sm text-slate-600">
              Placeholder only for now. Existing scoring and player data remain unchanged in this phase.
            </p>
          </div>
        </SurfaceCard>
      ) : null}
    </div>
  );
}

function ParentPlayerFlow({
  selectedPlayerId,
  onPlayerChange,
}: Pick<DashboardPageProps, "selectedPlayerId" | "onPlayerChange">) {
  const [parentTab, setParentTab] = useState<ParentTab>("Overview");
  const currentPlayer = resolveSelectedPlayer(selectedPlayerId);
  const visibleTrend = currentPlayer.progressTrend.slice(-PROGRESS_POINTS);

  return (
    <div className="flex flex-col gap-6">
      <SurfaceCard>
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Parent / Player View
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-slate-900">Viewing: {currentPlayer.profile.playerName}</h1>
            <p className="mt-1 text-sm text-slate-600">
              {currentPlayer.profile.ageGroup} · {currentPlayer.profile.gender} · {currentPlayer.profile.cohortName}
            </p>
          </div>
          <PlayerSearch
            players={dashboardCollection.players}
            selectedPlayerId={currentPlayer.id}
            onSelectPlayer={onPlayerChange}
          />
        </div>
      </SurfaceCard>

      <Tabs tabs={parentTabs} activeTab={parentTab} onChange={setParentTab} />

      {parentTab === "Overview" ? (
        <>
          <SurfaceCard>
            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Selected player</p>
              <h2 className="text-3xl font-semibold text-slate-900">{currentPlayer.profile.playerName}</h2>
              <p className="text-sm text-slate-600">
                Last updated window: {currentPlayer.profile.trackingWindow}
              </p>
            </div>
          </SurfaceCard>
          <KpiSection metrics={currentPlayer.summaryMetrics} />
          <AssessmentBreakdown
            abilities={currentPlayer.abilityBreakdown}
            playerName={currentPlayer.profile.playerName}
          />
        </>
      ) : null}

      {parentTab === "Progress" ? (
        <section className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
          <ProgressTrendChart
            title={`${currentPlayer.profile.playerName} progress`}
            description="SGI trend for this selected player across recorded months."
            points={visibleTrend}
          />
          <DistributionChart
            title="Current SGI position"
            description="Current selected player position in their cohort."
            distribution={{
              ...currentPlayer.cohortDistribution,
              cohortLabel: currentPlayer.profile.cohortName,
            }}
          />
        </section>
      ) : null}
    </div>
  );
}

export function DashboardPage({ role, selectedPlayerId, onPlayerChange }: DashboardPageProps) {
  return (
    <>
      {role === "Trainer View" ? (
        <TrainerFlow selectedPlayerId={selectedPlayerId} onPlayerChange={onPlayerChange} />
      ) : (
        <ParentPlayerFlow selectedPlayerId={selectedPlayerId} onPlayerChange={onPlayerChange} />
      )}
    </>
  );
}
