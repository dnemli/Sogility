import { CalendarRange, ShieldCheck, Target, Users } from "lucide-react";
import { FilterBar } from "./filter-bar";
import { SurfaceCard } from "../ui/card";
import type {
  DashboardCollection,
  DateRangeOption,
  PlayerProfile,
  SkillFilterOption,
} from "../../types/dashboard";

type DashboardHeaderProps = {
  dashboardCollection: DashboardCollection;
  displayProfile: PlayerProfile;
  selectedPlayerId: string;
  onPlayerChange: (playerId: string) => void;
  selectedAgeGroup: string;
  onAgeGroupChange: (ageGroup: string) => void;
  selectedGender: string;
  onGenderChange: (gender: string) => void;
  selectedSkill: SkillFilterOption;
  onSkillChange: (skill: SkillFilterOption) => void;
  selectedDateRange: DateRangeOption;
  onDateRangeChange: (range: DateRangeOption) => void;
};

const metaItems = [
  { icon: Users, label: "Age group", key: "ageGroup" },
  { icon: ShieldCheck, label: "Gender", key: "gender" },
  { icon: Target, label: "Selected cohort", key: "cohortName" },
  { icon: CalendarRange, label: "Tracking window", key: "trackingWindow" },
] as const;

export function DashboardHeader({
  dashboardCollection,
  displayProfile,
  selectedPlayerId,
  onPlayerChange,
  selectedAgeGroup,
  onAgeGroupChange,
  selectedGender,
  onGenderChange,
  selectedSkill,
  onSkillChange,
  selectedDateRange,
  onDateRangeChange,
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
              Player Performance Dashboard
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

          <FilterBar
            dashboardCollection={dashboardCollection}
            selectedPlayerId={selectedPlayerId}
            onPlayerChange={onPlayerChange}
            selectedAgeGroup={selectedAgeGroup}
            onAgeGroupChange={onAgeGroupChange}
            selectedGender={selectedGender}
            onGenderChange={onGenderChange}
            selectedSkill={selectedSkill}
            onSkillChange={onSkillChange}
            selectedDateRange={selectedDateRange}
            onDateRangeChange={onDateRangeChange}
          />
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {metaItems.map(({ icon: Icon, label, key }) => (
            <div
              key={label}
              className="rounded-[22px] border border-white/70 bg-white/70 p-4 shadow-sm backdrop-blur"
            >
              <div className="flex items-center gap-3">
                <span className="rounded-2xl bg-emerald-100 p-2 text-emerald-700">
                  <Icon className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    {label}
                  </p>
                  <p className="mt-1 text-base font-semibold text-slate-900">
                    {displayProfile[key]}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </SurfaceCard>
  );
}
