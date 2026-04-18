import {
  Bar,
  CartesianGrid,
  ComposedChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { SurfaceCard } from "../ui/card";
import { SectionHeading } from "../ui/section-heading";
import type { CohortDistribution } from "../../types/dashboard";

type DistributionChartProps = {
  title: string;
  description: string;
  distribution: CohortDistribution;
  selectedAssessment: string;
};

export function DistributionChart({
  title,
  description,
  distribution,
  selectedAssessment,
}: DistributionChartProps) {
  return (
    <SurfaceCard className="h-full">
      <div className="flex h-full flex-col gap-6">
        <div className="flex flex-col gap-3">
          <SectionHeading
            eyebrow="Peer Distribution"
            title={title}
            description={description}
          />
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
            <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">
              Focus: {selectedAssessment}
            </span>
            <span className="rounded-full bg-emerald-50 px-3 py-1 font-medium text-emerald-700">
              Player marker: {distribution.playerScore}
            </span>
          </div>
        </div>
        <div className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={distribution.bins} margin={{ top: 12, right: 18, left: -22, bottom: 4 }}>
              <CartesianGrid strokeDasharray="4 8" stroke="rgba(148, 163, 184, 0.28)" />
              <XAxis
                dataKey="score"
                type="number"
                domain={[0, 100]}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#64748b", fontSize: 12 }}
              />
              <YAxis
                dataKey="count"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#64748b", fontSize: 12 }}
              />
              <Tooltip
                formatter={(value: number) => [`${value} players`, "Cohort count"]}
                labelFormatter={(label) => `Score bucket midpoint: ${label}`}
              />
              <Bar dataKey="count" barSize={18} fill="#bfd7ca" radius={[12, 12, 0, 0]} />
              <ReferenceLine
                x={distribution.playerScore}
                stroke="#d9485f"
                strokeWidth={2.5}
                label={{
                  value: "Player",
                  position: "insideTopRight",
                  fill: "#d9485f",
                  fontSize: 12,
                }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div className="grid gap-3 rounded-[24px] border border-slate-200/80 bg-white/80 p-4 sm:grid-cols-3">
          <div>
            <p className="text-sm font-medium text-slate-500">Comparison group</p>
            <p className="mt-1 text-base font-semibold text-slate-900">{distribution.cohortLabel}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Peer sample</p>
            <p className="mt-1 text-base font-semibold text-slate-900">{distribution.sampleSize} players</p>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">What this shows</p>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              The red marker shows where the player sits compared with the current cohort spread.
            </p>
          </div>
        </div>
      </div>
    </SurfaceCard>
  );
}
