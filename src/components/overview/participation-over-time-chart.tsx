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
import type { OverviewGranularity, ParticipationPoint } from "../../types/academy-overview";

type ParticipationOverTimeChartProps = {
  data: ParticipationPoint[];
  granularity: OverviewGranularity;
  onGranularityChange: (value: OverviewGranularity) => void;
};

export function ParticipationOverTimeChart({
  data,
  granularity,
  onGranularityChange,
}: ParticipationOverTimeChartProps) {
  return (
    <SurfaceCard className="h-full">
      <div className="flex h-full flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <SectionHeading
            eyebrow="Participation"
            title="Assessment participation over time"
            description="Tracks how many unique players are engaging with the assessment system in each period (at least one assessment)."
          />
          <label className="flex flex-col gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#6A8090]">
              Granularity
            </span>
            <select
              value={granularity}
              onChange={(e) => onGranularityChange(e.target.value as OverviewGranularity)}
              className="h-11 min-w-[160px] rounded-2xl border border-[#1E2D40] bg-[#0F2236] px-4 text-sm font-medium text-[#E0E8F0] shadow-none outline-none focus:border-[#3ECF8E] focus:ring-2 focus:ring-[#3ECF8E]/20"
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </label>
        </div>

        <div className="h-[360px] w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 8 }}>
              <CartesianGrid strokeDasharray="4 8" stroke="rgba(148, 163, 184, 0.22)" />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                angle={-45}
                textAnchor="end"
                height={72}
                interval={granularity === "weekly" ? "preserveStartEnd" : 0}
                tick={{ fill: "#9AB0C0", fontSize: 11 }}
              />
              <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#9AB0C0", fontSize: 12 }}
              />
              <Tooltip
                cursor={{ fill: "rgba(62, 207, 142, 0.12)" }}
                formatter={(value: number) => [`${value} players`, "Unique players"]}
              />
              <Bar dataKey="uniquePlayers" name="Unique players" fill="#3ECF8E" radius={[10, 10, 0, 0]} maxBarSize={48} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </SurfaceCard>
  );
}
