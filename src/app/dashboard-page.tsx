import { useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
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
import { ABILITY_ORDER } from "../lib/assessment-to-ability";
import { bandTextMap } from "../lib/dashboard-helpers";
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
  const [selectedSkill, setSelectedSkill] = useState<(typeof ABILITY_ORDER)[number]>("Passing");
  const currentPlayer = resolveSelectedPlayer(selectedPlayerId);
  const visibleTrend = currentPlayer.progressTrend.slice(-PROGRESS_POINTS);
  const overallSgi =
    currentPlayer.summaryMetrics.find((metric) => metric.label === "Overall SGI")?.value ?? "—";
  const overallTier =
    currentPlayer.summaryMetrics.find((metric) => metric.label === "SGI tier")?.value ?? "—";
  const lastUpdated = currentPlayer.assessmentHistory[0]?.date ?? "No assessment date available";
  const selectedSkillProgress = currentPlayer.skillProgress[selectedSkill] ?? [];

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
            <div className="grid gap-4 md:grid-cols-3">
              <div className="md:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Selected player
                </p>
                <h2 className="mt-2 text-3xl font-semibold text-slate-900">
                  {currentPlayer.profile.playerName}
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  {currentPlayer.profile.ageGroup} · {currentPlayer.profile.gender}
                </p>
                <p className="mt-1 text-sm text-slate-600">Last updated: {lastUpdated}</p>
              </div>
              <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Overall SGI</p>
                <p className="mt-2 text-4xl font-semibold text-slate-900">{overallSgi}</p>
                <span
                  className={cn(
                    "mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold",
                    overallTier in bandTextMap
                      ? bandTextMap[overallTier as keyof typeof bandTextMap]
                      : "bg-slate-100 text-slate-700",
                  )}
                >
                  {overallTier}
                </span>
              </div>
            </div>
          </SurfaceCard>
          <SurfaceCard>
            <div className="flex flex-col gap-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Skill breakdown</p>
              <div className="grid gap-3">
                {ABILITY_ORDER.map((skill) => {
                  const row = currentPlayer.abilityBreakdown.find((entry) => entry.ability === skill);
                  const score = row?.avgAps ?? 30;
                  const tier = row?.aggregateBand ?? "Foundation";
                  return (
                    <div key={skill} className="rounded-2xl border border-slate-200/80 bg-white/70 p-3">
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-slate-900">{skill}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-slate-900">{score.toFixed(1)}</span>
                          <span
                            className={cn(
                              "rounded-full px-2.5 py-0.5 text-xs font-semibold",
                              bandTextMap[tier],
                            )}
                          >
                            {tier}
                          </span>
                        </div>
                      </div>
                      <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
                        <div
                          className="h-full rounded-full bg-slate-900"
                          style={{ width: `${Math.max(0, Math.min(100, score))}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </SurfaceCard>
        </>
      ) : null}

      {parentTab === "Progress" ? (
        <>
          <ProgressTrendChart
            title={`${currentPlayer.profile.playerName} progress`}
            description="Overall SGI trend across recorded months."
            points={visibleTrend}
          />

          <SurfaceCard>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Skill progress over time
                </p>
                <select
                  value={selectedSkill}
                  onChange={(event) => setSelectedSkill(event.target.value as (typeof ABILITY_ORDER)[number])}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900"
                >
                  {ABILITY_ORDER.map((skill) => (
                    <option key={skill} value={skill}>
                      {skill}
                    </option>
                  ))}
                </select>
              </div>
              <div className="h-[260px]">
                {selectedSkillProgress.length === 0 ? (
                  <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-6 text-center text-sm text-slate-600">
                    No monthly progress data available for {selectedSkill} yet.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={selectedSkillProgress} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="4 8" stroke="rgba(148, 163, 184, 0.28)" />
                      <XAxis
                        dataKey="label"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: "#64748b", fontSize: 12 }}
                      />
                      <YAxis
                        domain={[30, 99]}
                        tickCount={6}
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: "#64748b", fontSize: 12 }}
                      />
                      <Tooltip
                        formatter={(value: number) => [`${value}`, "SGI"]}
                        labelFormatter={(label) => `${label}`}
                      />
                      <Line
                        type="monotone"
                        dataKey="score"
                        name="SGI"
                        stroke="#0f172a"
                        strokeWidth={3}
                        dot={{ r: 2.5, strokeWidth: 2, fill: "#ffffff" }}
                        activeDot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </SurfaceCard>

          <SurfaceCard>
            <div className="flex flex-col gap-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Assessment history
              </p>
              {currentPlayer.assessmentHistory.length === 0 ? (
                <p className="text-sm text-slate-600">No assessment history available.</p>
              ) : (
                <div className="max-h-[320px] overflow-auto rounded-2xl border border-slate-200/80">
                  <table className="w-full border-collapse text-sm">
                    <thead className="sticky top-0 bg-slate-50 text-left text-xs uppercase tracking-[0.14em] text-slate-500">
                      <tr>
                        <th className="px-3 py-2">Date</th>
                        <th className="px-3 py-2">Assessment</th>
                        <th className="px-3 py-2">Skill</th>
                        <th className="px-3 py-2">SGI</th>
                        <th className="px-3 py-2">Tier</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentPlayer.assessmentHistory.map((entry) => (
                        <tr key={`${entry.date}-${entry.assessmentName}`} className="border-t border-slate-100">
                          <td className="px-3 py-2 text-slate-700">{entry.date}</td>
                          <td className="px-3 py-2 text-slate-900">{entry.assessmentName}</td>
                          <td className="px-3 py-2 text-slate-700">{entry.ability}</td>
                          <td className="px-3 py-2 font-semibold text-slate-900">{entry.score.toFixed(1)}</td>
                          <td className="px-3 py-2">
                            <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold", bandTextMap[entry.tier])}>
                              {entry.tier}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </SurfaceCard>
        </>
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
