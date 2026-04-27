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
import { ArrowLeft, Search } from "lucide-react";
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
import { bandTextMap, getTier, type ScoreTier } from "../lib/dashboard-helpers";
import { ScoreRing, SkillBar, SectionHeader } from "../components/visual";
import type { PlayerDashboardView } from "../types/dashboard";

type RoleView = "Trainer View" | "Parent/Player View";
type TrainerTab = "Dashboard/Home" | "Players";
type TrainerPlayersTab = "Abilities" | "Progress over time";
type ParentTab = "Overview" | "Progress";
type TrainerPlayersView = "list" | "detail" | "newAssessment";

const trainerTabs: TrainerTab[] = ["Dashboard/Home", "Players"];
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

function getOverallScore(player: PlayerDashboardView): number {
  const overall = player.summaryMetrics.find((metric) => metric.label === "Overall SGI")?.value ?? "";
  const parsed = Number.parseFloat(overall);
  return Number.isFinite(parsed) ? parsed : 30;
}

function getOverallTier(player: PlayerDashboardView): ScoreTier {
  const tier = player.summaryMetrics.find((metric) => metric.label === "SGI tier")?.value;
  if (tier && tier in bandTextMap) return tier as ScoreTier;
  return getTier(getOverallScore(player));
}

function initials(playerName: string): string {
  return playerName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function scoreBarColor(tier: ScoreTier): string {
  if (tier === "Foundation") return "#FB7185";
  if (tier === "Developing") return "#FCD34D";
  if (tier === "Approaching") return "#A3E635";
  if (tier === "Strong") return "#38BDF8";
  return "#C4B5FD";
}

function TrainerFlow({
  selectedPlayerId,
  onPlayerChange,
}: Pick<DashboardPageProps, "selectedPlayerId" | "onPlayerChange">) {
  const [trainerTab, setTrainerTab] = useState<TrainerTab>("Dashboard/Home");
  const [trainerPlayerTab, setTrainerPlayerTab] = useState<TrainerPlayersTab>("Abilities");
  const [playersView, setPlayersView] = useState<TrainerPlayersView>("list");
  const [playerQuery, setPlayerQuery] = useState("");
  const currentPlayer = resolveSelectedPlayer(selectedPlayerId);
  const visibleTrend = currentPlayer.progressTrend.slice(-PROGRESS_POINTS);
  const filteredPlayers = dashboardCollection.players.filter((player) =>
    player.profile.playerName.toLowerCase().includes(playerQuery.trim().toLowerCase()),
  );
  const shouldShowFoundationLegend = dashboardCollection.players.some((player) => getOverallScore(player) < 30);

  const openPlayerDetail = (playerId: string) => {
    onPlayerChange(playerId);
    setPlayersView("detail");
  };
  const handleTrainerTabChange = (tab: TrainerTab) => {
    setTrainerTab(tab);
    if (tab === "Players") setPlayersView("list");
  };

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <Tabs tabs={trainerTabs} activeTab={trainerTab} onChange={handleTrainerTabChange} />

      {trainerTab === "Dashboard/Home" ? (
        <AcademyOverviewPage />
      ) : null}

      {trainerTab === "Players" ? (
        <>
          {playersView === "list" ? (
            <section className="mx-auto flex w-full max-w-[800px] flex-col gap-4 pt-6">
              <h2 className="text-[36px] font-bold leading-none tracking-tight text-[#E0E8F0]">Players</h2>

              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#6A8090]" />
                <input
                  value={playerQuery}
                  onChange={(event) => setPlayerQuery(event.target.value)}
                  placeholder="Search players..."
                  className="h-14 w-full rounded-2xl border border-[#1E2D40] bg-[#131F2E] pl-12 pr-4 text-[18px] font-medium leading-none text-[#E0E8F0] placeholder:text-[#6A8090] outline-none"
                />
              </div>

              <div className="mb-1 flex flex-wrap items-center gap-5 text-[15px] font-medium text-[#9AB0C0]">
                {shouldShowFoundationLegend ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#FB7185]" />
                    Foundation
                  </span>
                ) : null}
                <span className="inline-flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#FCD34D]" />
                  Developing
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#A3E635]" />
                  Approaching
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#38BDF8]" />
                  Strong
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#C4B5FD]" />
                  Elite
                </span>
              </div>

              <div className="flex flex-col gap-4">
                {filteredPlayers.map((player) => {
                  const score = getOverallScore(player);
                  const tier = getOverallTier(player);
                  const assessmentDate = player.assessmentHistory[0]?.date ?? "No assessments yet";
                  return (
                    <button
                      key={player.id}
                      type="button"
                      onClick={() => openPlayerDetail(player.id)}
                      className="min-h-[110px] rounded-3xl border border-[#1E2D40] bg-[#102136] px-5 py-[18px] text-left transition hover:border-[#2B4360]"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex min-w-0 items-center gap-4">
                          <span
                            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-[3px] text-[19px] font-bold"
                            style={{ borderColor: scoreBarColor(tier), color: scoreBarColor(tier) }}
                          >
                            {initials(player.profile.playerName)}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-[24px] font-semibold leading-none text-[#E0E8F0]">{player.profile.playerName}</p>
                            <p className="mt-1.5 text-[16px] leading-none text-[#9AB0C0]">{assessmentDate}</p>
                          </div>
                        </div>
                        <div
                          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border text-[28px] font-bold leading-none"
                          style={{ borderColor: scoreBarColor(tier), color: scoreBarColor(tier) }}
                        >
                          {Math.round(score)}
                        </div>
                      </div>

                      <div className="ml-[72px] mt-3 h-1.5 overflow-hidden rounded-full bg-[#1E2D40]">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.max(0, Math.min(100, score))}%`,
                            backgroundColor: scoreBarColor(tier),
                          }}
                        />
                      </div>
                    </button>
                  );
                })}

                {filteredPlayers.length === 0 ? (
                  <SurfaceCard className="text-sm text-[#9AB0C0]">No players match your search.</SurfaceCard>
                ) : null}
              </div>
            </section>
          ) : null}

          {playersView === "detail" ? (
            <>
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setPlayersView("list")}
                  className="inline-flex items-center gap-2 rounded-full border border-[#1E2D40] bg-[#131F2E] px-3 py-2 text-sm font-semibold text-[#9AB0C0] hover:text-[#E0E8F0]"
                >
                  <ArrowLeft size={16} />
                  Back to Players
                </button>
                <button
                  type="button"
                  onClick={() => setPlayersView("newAssessment")}
                  className="rounded-full bg-[#3ECF8E] px-4 py-2 text-sm font-semibold text-[#0F1923]"
                >
                  Score New Assessment
                </button>
              </div>

              <DashboardHeader
                dashboardCollection={dashboardCollection}
                displayProfile={currentPlayer.profile}
                selectedPlayerId={currentPlayer.id}
                onPlayerChange={onPlayerChange}
              />

              <KpiSection metrics={currentPlayer.summaryMetrics} />

              <div className="flex flex-col gap-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6A8090]">
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
                          ? "border-[#3ECF8E] bg-[#3ECF8E] text-[#0F1923] shadow-none"
                          : "border-[#1E2D40] bg-[#131F2E] text-[#9AB0C0] hover:text-[#E0E8F0]",
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
                    title="Score over time"
                    description="Monthly SGI Score trend for each month this player has sessions. Higher values indicate stronger standing vs similar peers."
                    points={visibleTrend}
                  />
                  <DistributionChart
                    title="Cohort distribution snapshot"
                    description="Where this player's SGI Score sits within the peer distribution."
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

          {playersView === "newAssessment" ? (
            <SurfaceCard>
              <div className="flex flex-col gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#6A8090]">New Assessment</p>
                  <h2 className="text-xl font-semibold text-[#E0E8F0]">Score New Assessment</h2>
                  <p className="mt-1 text-sm text-[#9AB0C0]">Player: {currentPlayer.profile.playerName}</p>
                </div>
                <p className="text-sm text-[#9AB0C0]">
                  Assessment input flow coming next phase. This placeholder remains tied to the selected player.
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPlayersView("detail")}
                    className="rounded-full border border-[#1E2D40] bg-[#131F2E] px-4 py-2 text-sm font-semibold text-[#9AB0C0] hover:text-[#E0E8F0]"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => setPlayersView("detail")}
                    className="rounded-full bg-[#3ECF8E] px-4 py-2 text-sm font-semibold text-[#0F1923]"
                  >
                    Save Assessment
                  </button>
                </div>
              </div>
            </SurfaceCard>
          ) : null}
        </>
      ) : null}
    </section>
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
      <section className="mx-auto w-full max-w-screen-sm py-2">
        <SurfaceCard className="rounded-2xl border-[#1E2D40] bg-[#131F2E] p-4 shadow-none">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6A8090]">
            Switch Player (Demo)
          </p>
          <PlayerSearch
            players={dashboardCollection.players}
            selectedPlayerId={currentPlayer.id}
            onSelectPlayer={onPlayerChange}
            mode="darkCompact"
          />
        </SurfaceCard>
      </section>

      <div className="mx-auto w-full max-w-screen-sm">
        <div className="inline-flex w-full rounded-full border border-[#1E2D40] bg-[#131F2E] p-1">
          {parentTabs.map((tab) => {
            const isActive = tab === parentTab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setParentTab(tab)}
                className={cn(
                  "flex-1 rounded-full px-4 py-2.5 text-sm font-semibold transition",
                  isActive ? "bg-[#3ECF8E] text-[#0F1923]" : "text-[#9AB0C0] hover:text-[#E0E8F0]",
                )}
              >
                {tab}
              </button>
            );
          })}
        </div>
      </div>

      {parentTab === "Overview" ? (
        <section className="mx-auto w-full max-w-screen-sm py-2">
          <div className="flex w-full flex-col gap-4">
            <SurfaceCard className="rounded-2xl border-[#1E2D40] bg-[#131F2E] p-4 shadow-none">
              <SectionHeader
                overline="Player Profile"
                title={currentPlayer.profile.playerName}
                description={`${currentPlayer.profile.ageGroup} · ${currentPlayer.profile.gender}`}
              />
              <div className="mt-6 flex flex-col items-center gap-3">
                <ScoreRing score={Number(overallSgi)} size={178} label="Score" />
                <span
                  className={cn(
                    "inline-flex rounded-full px-3 py-1 text-xs font-semibold",
                    overallTier in bandTextMap
                      ? bandTextMap[overallTier as keyof typeof bandTextMap]
                      : "bg-[#1E2D40] text-[#9AB0C0]",
                  )}
                >
                  {overallTier}
                </span>
                <span className="inline-flex rounded-full bg-[#1E2D40] px-3 py-1 text-xs font-medium text-[#9AB0C0]">
                  Last updated: {lastUpdated}
                </span>
              </div>
            </SurfaceCard>

            <SurfaceCard className="rounded-2xl border-[#1E2D40] bg-[#131F2E] p-4 shadow-none">
              <SectionHeader overline="Skill Breakdown" title="Five core skills" />
              <div className="mt-4 grid gap-3">
                {(["Passing", "Vision", "Dribbling", "Agility", "First Touch"] as const).map((skill) => {
                  const row = currentPlayer.abilityBreakdown.find((entry) => entry.ability === skill);
                  const score = row?.avgAps ?? 30;
                  const tier = row?.aggregateBand ?? "Foundation";
                  return <SkillBar key={skill} name={skill} score={score} tier={tier} />;
                })}
              </div>
            </SurfaceCard>
          </div>
        </section>
      ) : null}

      {parentTab === "Progress" ? (
        <section className="mx-auto w-full max-w-screen-sm py-2">
          <div className="flex w-full flex-col gap-4">
            <SurfaceCard className="rounded-2xl border-[#1E2D40] bg-[#131F2E] p-4 shadow-none">
              <SectionHeader
                overline="Progress"
                title={`${currentPlayer.profile.playerName}`}
                description="Overall Score trend across recorded months."
              />
              <div className="mt-4 h-[280px]">
                {visibleTrend.length === 0 ? (
                  <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-[#1E2D40] bg-[#0F2236] px-6 text-center text-sm text-[#9AB0C0]">
                    No monthly progress data available yet.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={visibleTrend} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="4 8" stroke="rgba(148, 163, 184, 0.22)" />
                      <XAxis
                        dataKey="label"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: "#9AB0C0", fontSize: 12 }}
                      />
                      <YAxis
                        domain={[30, 99]}
                        tickCount={6}
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: "#9AB0C0", fontSize: 12 }}
                      />
                      <Tooltip formatter={(value: number) => [`${value}`, "Score"]} labelFormatter={(label) => `${label}`} />
                      <Line
                        type="monotone"
                        dataKey="rps"
                        name="Score"
                        stroke="#3ECF8E"
                        strokeWidth={3}
                        dot={{ r: 2.5, strokeWidth: 2, fill: "#ffffff" }}
                        activeDot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </SurfaceCard>

            <SurfaceCard className="rounded-2xl border-[#1E2D40] bg-[#131F2E] p-4 shadow-none">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#6A8090]">
                    Skill progress over time
                  </p>
                  <select
                    value={selectedSkill}
                    onChange={(event) => setSelectedSkill(event.target.value as (typeof ABILITY_ORDER)[number])}
                    className="rounded-xl border border-[#1E2D40] bg-[#0F2236] px-3 py-2 text-sm font-medium text-[#E0E8F0]"
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
                    <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-[#1E2D40] bg-[#0F2236] px-6 text-center text-sm text-[#9AB0C0]">
                      No monthly progress data available for {selectedSkill} yet.
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={selectedSkillProgress} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="4 8" stroke="rgba(148, 163, 184, 0.22)" />
                        <XAxis
                          dataKey="label"
                          tickLine={false}
                          axisLine={false}
                          tick={{ fill: "#9AB0C0", fontSize: 12 }}
                        />
                        <YAxis
                          domain={[30, 99]}
                          tickCount={6}
                          tickLine={false}
                          axisLine={false}
                          tick={{ fill: "#9AB0C0", fontSize: 12 }}
                        />
                        <Tooltip formatter={(value: number) => [`${value}`, "Skill Score"]} labelFormatter={(label) => `${label}`} />
                        <Line
                          type="monotone"
                          dataKey="score"
                          name="Skill Score"
                          stroke="#3ECF8E"
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

            <SurfaceCard className="rounded-2xl border-[#1E2D40] bg-[#131F2E] p-4 shadow-none">
              <div className="flex flex-col gap-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#6A8090]">
                  Assessment history
                </p>
                {currentPlayer.assessmentHistory.length === 0 ? (
                  <p className="text-sm text-[#9AB0C0]">No assessment history available.</p>
                ) : (
                  <div className="max-h-[320px] overflow-auto rounded-2xl border border-[#1E2D40]">
                    <table className="w-full border-collapse text-sm">
                      <thead className="sticky top-0 bg-[#0F2236] text-left text-xs uppercase tracking-[0.14em] text-[#9AB0C0]">
                        <tr>
                          <th className="px-3 py-2">Date</th>
                          <th className="px-3 py-2">Assessment</th>
                          <th className="px-3 py-2">Skill</th>
                          <th className="px-3 py-2">Score</th>
                          <th className="px-3 py-2">Tier</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentPlayer.assessmentHistory.map((entry) => (
                          <tr key={`${entry.date}-${entry.assessmentName}`} className="border-t border-[#1E2D40]">
                            <td className="px-3 py-2 text-[#9AB0C0]">{entry.date}</td>
                            <td className="px-3 py-2 text-[#E0E8F0]">{entry.assessmentName}</td>
                            <td className="px-3 py-2 text-[#9AB0C0]">{entry.ability}</td>
                            <td className="px-3 py-2 font-semibold text-[#E0E8F0]">{entry.score.toFixed(1)}</td>
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
          </div>
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
