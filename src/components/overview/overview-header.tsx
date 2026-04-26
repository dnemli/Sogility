import { ChevronDown } from "lucide-react";
import { SurfaceCard } from "../ui/card";
import type { GenderFilter, OverviewDateRangePreset } from "../../types/academy-overview";

type OverviewHeaderProps = {
  title?: string;
  subtitle?: string;
  dateRange: OverviewDateRangePreset;
  onDateRangeChange: (value: OverviewDateRangePreset) => void;
  dateRangeOptions: readonly OverviewDateRangePreset[];
  ageGroup: string;
  onAgeGroupChange: (value: string) => void;
  ageGroupOptions: readonly string[];
  gender: GenderFilter;
  onGenderChange: (value: GenderFilter) => void;
  genderOptions: readonly string[];
};

function Field({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex min-w-[140px] flex-col gap-2">
      <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#6A8090]">
        {label}
      </span>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-11 w-full min-w-[140px] appearance-none rounded-2xl border border-[#1E2D40] bg-[#131F2E] px-4 pr-10 text-sm font-medium text-[#E0E8F0] shadow-none outline-none transition focus:border-[#3ECF8E] focus:ring-2 focus:ring-[#3ECF8E]/20"
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6A8090]" />
      </div>
    </label>
  );
}

export function OverviewHeader({
  title = "Overview",
  subtitle = "Assessment activity, player engagement, and cohort performance across the academy",
  dateRange,
  onDateRangeChange,
  dateRangeOptions,
  ageGroup,
  onAgeGroupChange,
  ageGroupOptions,
  gender,
  onGenderChange,
  genderOptions,
}: OverviewHeaderProps) {
  return (
    <SurfaceCard className="relative overflow-hidden bg-[#131F2E]">
      <div className="relative flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#6A8090]">
            Academy intelligence
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#E0E8F0] sm:text-[2rem]">
            {title}
          </h1>
          <p className="mt-3 text-sm leading-6 text-[#9AB0C0] sm:text-base">{subtitle}</p>
        </div>

        <div className="flex w-full flex-col gap-3 rounded-[22px] border border-[#1E2D40] bg-[#0F2236] p-4 shadow-none backdrop-blur sm:flex-row sm:flex-wrap sm:items-end sm:justify-end lg:max-w-2xl">
          <Field
            label="Date range"
            value={dateRange}
            options={dateRangeOptions}
            onChange={(v) => onDateRangeChange(v as OverviewDateRangePreset)}
          />
          <Field label="Age group" value={ageGroup} options={ageGroupOptions} onChange={onAgeGroupChange} />
          <Field
            label="Gender"
            value={gender}
            options={genderOptions}
            onChange={(v) => onGenderChange(v as GenderFilter)}
          />
        </div>
      </div>
    </SurfaceCard>
  );
}
