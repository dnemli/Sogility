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
    <SurfaceCard className="relative overflow-hidden bg-[#131F2E]">
      <div className="relative flex flex-col gap-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#6A8090]">
              Soccer Academy Analytics
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#E0E8F0] sm:text-4xl">
              {displayProfile.playerName}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#9AB0C0] sm:text-base">
              A clear view of how each player is performing against academy benchmarks and against similar players in their cohort.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-[#3ECF8E] px-4 py-2 text-sm font-semibold text-[#0F1923]">
                {displayProfile.playerName}
              </span>
              <span className="rounded-full bg-[#1E2D40] px-4 py-2 text-sm font-medium text-[#E0E8F0]">
                {displayProfile.ageGroup}
              </span>
              <span className="rounded-full bg-[#1E2D40] px-4 py-2 text-sm font-medium text-[#E0E8F0]">
                {displayProfile.gender}
              </span>
              <span className="rounded-full bg-[#1E2D40] px-4 py-2 text-sm font-medium text-[#3ECF8E]">
                {displayProfile.cohortName}
              </span>
            </div>
          </div>

          <PlayerSearch
            players={dashboardCollection.players}
            selectedPlayerId={selectedPlayerId}
            onSelectPlayer={onPlayerChange}
            mode="darkCompact"
          />
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-[22px] border border-[#1E2D40] bg-[#0F2236] p-4 backdrop-blur">
            <div className="flex items-start gap-3">
              <span className="rounded-2xl bg-[#1E2D40] p-2 text-[#3ECF8E]">
                <Users className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#6A8090]">Age & history</p>
                <p className="mt-2 text-base font-semibold text-[#E0E8F0]">{displayProfile.ageGroup}</p>
                <div className="mt-3 flex items-start gap-2 border-t border-[#1E2D40] pt-3">
                  <CalendarRange className="mt-0.5 h-4 w-4 shrink-0 text-[#6A8090]" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6A8090]">Tracking window</p>
                    <p className="mt-1 text-sm font-medium text-[#E0E8F0]">{displayProfile.trackingWindow}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[22px] border border-[#1E2D40] bg-[#0F2236] p-4 backdrop-blur">
            <div className="flex items-start gap-3">
              <span className="rounded-2xl bg-[#1E2D40] p-2 text-[#3ECF8E]">
                <ShieldCheck className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#6A8090]">Gender & cohort</p>
                <p className="mt-2 text-base font-semibold text-[#E0E8F0]">{displayProfile.gender}</p>
                <div className="mt-3 flex items-start gap-2 border-t border-[#1E2D40] pt-3">
                  <Target className="mt-0.5 h-4 w-4 shrink-0 text-[#6A8090]" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6A8090]">Cohort label</p>
                    <p className="mt-1 text-sm font-medium leading-snug text-[#E0E8F0]">{displayProfile.cohortName}</p>
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
