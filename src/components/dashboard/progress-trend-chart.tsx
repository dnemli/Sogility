import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { SurfaceCard } from "../ui/card";
import { SectionHeading } from "../ui/section-heading";
import type { ProgressPoint } from "../../types/dashboard";

type ProgressTrendChartProps = {
  title: string;
  description: string;
  points: ProgressPoint[];
  dateRangeLabel: string;
};

export function ProgressTrendChart({
  title,
  description,
  points,
  dateRangeLabel,
}: ProgressTrendChartProps) {
  return (
    <SurfaceCard className="h-full">
      <div className="flex h-full flex-col gap-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <SectionHeading
            eyebrow="Progress Over Time"
            title={title}
            description={description}
          />
          <span className="w-fit rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
            {dateRangeLabel}
          </span>
        </div>
        <div className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={points} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
              <CartesianGrid strokeDasharray="4 8" stroke="rgba(148, 163, 184, 0.28)" />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#64748b", fontSize: 12 }}
              />
              <YAxis
                domain={[0, 100]}
                tickCount={6}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#64748b", fontSize: 12 }}
              />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="aps"
                name="APS"
                stroke="#1d8f5a"
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 2, fill: "#ffffff" }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="rps"
                name="RPS"
                stroke="#0f7ac0"
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 2, fill: "#ffffff" }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="grid gap-3 rounded-[24px] border border-slate-200/80 bg-white/80 p-4 sm:grid-cols-3">
          <div>
            <p className="text-sm font-medium text-slate-500">Latest benchmark fit</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">
              {points[points.length - 1]?.aps ?? 0}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Latest cohort edge</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">
              {points[points.length - 1]?.rps ?? 0}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Latest percentile</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">
              {points[points.length - 1]?.percentile ?? 0}th
            </p>
          </div>
        </div>
      </div>
    </SurfaceCard>
  );
}
