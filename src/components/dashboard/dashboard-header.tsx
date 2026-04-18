import { CalendarRange, ShieldCheck, Target, Users } from "lucide-react";
import { PlayerSearch } from "./player-search";
import { SurfaceCard } from "../ui/card";
import type { DashboardCollection, PlayerProfile } from "../../types/dashboard";

type DashboardHeaderProps = {
  dashboardCollection: DashboardCollection;
  displayProfile: PlayerProfile;
  selectedPlayerId: string;
  onPlayerChange: (playerId: string) => void;
};

export function DashboardHeader({
  dashboardCollection,
  displayProfile,
  selectedPlayerId,
  onPlayerChange,
}: DashboardHeaderProps) {
  return (
    <SurfaceCard className="relative overflow-hidden bg-gradient-to-br from-panel via-white/95 to-emerald-50/70">
      <div className="absolute -right-10 top-0 h-44 w-44 rounded-full bg-emerald-300/15 blur-3xl" />
      <div className="absolute bottom-0 left-0 h-36 w-36 rounded-full bg-sky-300/15 blur-3xl" />
      <div className="relative flex flex-col gap-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-700/80">
              Soccer Academy Analytics
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              {displayProfile.playerName}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
              A clear view of how each player is performing against academy benchmarks and against similar players in their cohort.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white">
                {displayProfile.playerName}
              </span>
              <span className="rounded-full bg-white/85 px-4 py-2 text-sm font-medium text-slate-700">
                {displayProfile.ageGroup}
              </span>
              <span className="rounded-full bg-white/85 px-4 py-2 text-sm font-medium text-slate-700">
                {displayProfile.gender}
              </span>
              <span className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-medium text-emerald-800">
                {displayProfile.cohortName}
              </span>
            </div>
          </div>

          <PlayerSearch
            players={dashboardCollection.players}
            selectedPlayerId={selectedPlayerId}
            onSelectPlayer={onPlayerChange}
          />
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-[22px] border border-white/70 bg-white/70 p-4 shadow-sm backdrop-blur">
            <div className="flex items-start gap-3">
              <span className="rounded-2xl bg-emerald-100 p-2 text-emerald-700">
                <Users className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Age & history</p>
                <p className="mt-2 text-base font-semibold text-slate-900">{displayProfile.ageGroup}</p>
                <div className="mt-3 flex items-start gap-2 border-t border-slate-200/80 pt-3">
                  <CalendarRange className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Tracking window</p>
                    <p className="mt-1 text-sm font-medium text-slate-800">{displayProfile.trackingWindow}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[22px] border border-white/70 bg-white/70 p-4 shadow-sm backdrop-blur">
            <div className="flex items-start gap-3">
              <span className="rounded-2xl bg-emerald-100 p-2 text-emerald-700">
                <ShieldCheck className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Gender & cohort</p>
                <p className="mt-2 text-base font-semibold text-slate-900">{displayProfile.gender}</p>
                <div className="mt-3 flex items-start gap-2 border-t border-slate-200/80 pt-3">
                  <Target className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Cohort label</p>
                    <p className="mt-1 text-sm font-medium leading-snug text-slate-800">{displayProfile.cohortName}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SurfaceCard>
  );
}
