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
};

export function ProgressTrendChart({ title, description, points }: ProgressTrendChartProps) {
  const latest = points[points.length - 1]?.rps ?? 0;

  return (
    <SurfaceCard className="h-full">
      <div className="flex h-full flex-col gap-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <SectionHeading eyebrow="Progress Over Time" title={title} description={description} />
          <span className="w-fit rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-800">
            {points.length === 0
              ? "No monthly points"
              : `Showing ${points.length} month${points.length === 1 ? "" : "s"}`}
          </span>
        </div>
        <div className="h-[320px]">
          {points.length === 0 ? (
            <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-6 text-center text-sm text-slate-600">
              No session months in the training extract for this player.
            </div>
          ) : null}
          {points.length === 0 ? null : (
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
                domain={[30, 99]}
                tickCount={6}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#64748b", fontSize: 12 }}
                label={{
                  value: "SGI",
                  angle: -90,
                  position: "insideLeft",
                  fill: "#64748b",
                  fontSize: 11,
                }}
              />
              <Tooltip
                formatter={(value: number) => [`${value}`, "SGI"]}
                labelFormatter={(label) => `${label}`}
              />
              <Line
                type="monotone"
                dataKey="rps"
                name="SGI"
                stroke="#0f7ac0"
                strokeWidth={3}
                dot={{ r: 2.5, strokeWidth: 2, fill: "#ffffff" }}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
          )}
        </div>
        <div className="rounded-[24px] border border-slate-200/80 bg-white/80 p-4">
          <p className="text-sm font-medium text-slate-500">Latest month (SGI)</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{latest.toFixed(1)}</p>
          <p className="mt-2 text-xs leading-5 text-slate-500">
            SGI is shown on a 30-99 scale and is derived from cohort-relative standing for that month.
          </p>
        </div>
      </div>
    </SurfaceCard>
  );
}
