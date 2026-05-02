import { PlayerSearch } from "./player-search";
import { SurfaceCard } from "../ui/card";
import type { DashboardCollection, PlayerProfile } from "../../types/dashboard";

type DashboardHeaderProps = {
  dashboardCollection: DashboardCollection;
  displayProfile: PlayerProfile;
  selectedPlayerId: string;
  onPlayerChange: (playerId: string) => void;
  forceMobileLayout?: boolean;
};

export function DashboardHeader({
  dashboardCollection,
  displayProfile,
  selectedPlayerId,
  onPlayerChange,
  forceMobileLayout = false,
}: DashboardHeaderProps) {
  return (
    <SurfaceCard className="relative overflow-hidden bg-[#131F2E]">
      <div className="relative flex flex-col gap-6">
        <div
          className={
            forceMobileLayout
              ? "flex flex-col gap-4"
              : "flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between"
          }
        >
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
            </div>
          </div>

          <PlayerSearch
            players={dashboardCollection.players}
            selectedPlayerId={selectedPlayerId}
            onSelectPlayer={onPlayerChange}
            mode="darkCompact"
          />
        </div>
      </div>
    </SurfaceCard>
  );
}
