import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { SurfaceCard } from "../ui/card";
import { SectionHeading } from "../ui/section-heading";
import type { AvgDaysByAgeRow, GenderFilter } from "../../types/academy-overview";

type AvgDaysBetweenAssessmentsProps = {
  rows: AvgDaysByAgeRow[];
  ageFilter: string;
  onAgeFilterChange: (value: string) => void;
  ageOptions: readonly string[];
  genderLabel: GenderFilter;
};

export function AvgDaysBetweenAssessments({
  rows,
  ageFilter,
  onAgeFilterChange,
  ageOptions,
  genderLabel,
}: AvgDaysBetweenAssessmentsProps) {
  const chartData = rows.map((r) => ({
    ...r,
    label: r.age_group,
  }));

  return (
    <SurfaceCard className="h-full">
      <div className="flex h-full flex-col gap-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <SectionHeading
            eyebrow="Cadence"
            title="Average time between assessments"
            description="Average days between consecutive assessments for players with repeats. Median is often more robust to outliers — both are shown for context."
          />
          <label className="flex flex-col gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
              Age focus
            </span>
            <select
              value={ageFilter}
              onChange={(e) => onAgeFilterChange(e.target.value)}
              className="h-11 min-w-[180px] rounded-2xl border border-slate-200/80 bg-white/90 px-4 text-sm font-medium text-slate-900 shadow-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            >
              {ageOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt === "All" ? "All age groups" : opt}
                </option>
              ))}
            </select>
          </label>
        </div>

        <p className="text-sm text-slate-600">
          Gender filter: <span className="font-semibold text-slate-900">{genderLabel}</span> (inherits global control).
        </p>

        <div className="h-[280px] w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={chartData}
              margin={{ top: 8, right: 24, left: 16, bottom: 8 }}
            >
              <CartesianGrid strokeDasharray="4 8" stroke="rgba(148, 163, 184, 0.28)" />
              <XAxis type="number" tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
              <YAxis
                type="category"
                dataKey="label"
                width={56}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#64748b", fontSize: 12 }}
              />
              <Tooltip
                formatter={(value: number, key: string) => {
                  if (key === "avgDays") return [`${value} days`, "Average gap"];
                  if (key === "medianDays") return [`${value} days`, "Median gap"];
                  return [value, key];
                }}
              />
              <Bar dataKey="medianDays" name="Median days" fill="#94a3b8" radius={[0, 8, 8, 0]} barSize={18} />
              <Bar dataKey="avgDays" name="Average days" fill="#1d8f5a" radius={[0, 8, 8, 0]} barSize={18} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-[20px] border border-slate-200/80 bg-white/80 p-4 text-sm text-slate-600">
          <span className="font-semibold text-slate-900">Note:</span> Rows with no repeat assessments contribute
          zero gap pairs; sample size per age group is listed to avoid over-interpreting thin segments.
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {rows.map((r) => (
            <div key={r.age_group} className="rounded-2xl border border-slate-200/70 bg-white/85 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{r.age_group}</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">{r.avgDays}d avg</p>
              <p className="text-sm text-slate-600">{r.medianDays}d median · {r.samplePlayers} players w/ repeats</p>
            </div>
          ))}
        </div>
      </div>
    </SurfaceCard>
  );
}
