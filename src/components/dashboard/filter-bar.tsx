import { ChevronDown } from "lucide-react";
import type {
  DashboardCollection,
  DateRangeOption,
  SkillFilterOption,
} from "../../types/dashboard";

type FilterBarProps = {
  dashboardCollection: DashboardCollection;
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

type SelectFilterProps = {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
};

function SelectFilter({ label, value, options, onChange }: SelectFilterProps) {
  return (
    <label className="flex min-w-[156px] flex-col gap-2">
      <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
        {label}
      </span>
      <div className="relative">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-11 w-full appearance-none rounded-2xl border border-slate-200/80 bg-white/85 px-4 pr-10 text-sm font-medium text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
      </div>
    </label>
  );
}

export function FilterBar({
  dashboardCollection,
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
}: FilterBarProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      <SelectFilter
        label="Player"
        value={selectedPlayerId}
        options={dashboardCollection.players.map((player) => player.id)}
        onChange={onPlayerChange}
      />
      <SelectFilter
        label="Age group"
        value={selectedAgeGroup}
        options={dashboardCollection.ageGroups}
        onChange={onAgeGroupChange}
      />
      <SelectFilter
        label="Gender"
        value={selectedGender}
        options={dashboardCollection.genders}
        onChange={onGenderChange}
      />
      <SelectFilter
        label="Assessment focus"
        value={selectedSkill}
        options={dashboardCollection.skillFilters}
        onChange={(value) => onSkillChange(value as SkillFilterOption)}
      />
      <SelectFilter
        label="Date range"
        value={selectedDateRange}
        options={dashboardCollection.dateRanges}
        onChange={(value) => onDateRangeChange(value as DateRangeOption)}
      />
    </div>
  );
}
