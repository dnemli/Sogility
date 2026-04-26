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
};

export function DistributionChart({ title, description, distribution }: DistributionChartProps) {
  return (
    <SurfaceCard className="h-full">
      <div className="flex h-full flex-col gap-6">
        <div className="flex flex-col gap-3">
          <SectionHeading eyebrow="Peer Distribution" title={title} description={description} />
          <div className="flex flex-wrap items-center gap-3 text-sm text-[#9AB0C0]">
            <span className="rounded-full bg-[#1E2D40] px-3 py-1 font-medium text-[#E0E8F0]">Score distribution</span>
            <span className="rounded-full bg-[#3ECF8E]/20 px-3 py-1 font-medium text-[#3ECF8E]">
              Player marker: {distribution.playerScore}
            </span>
          </div>
        </div>
        <div className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={distribution.bins} margin={{ top: 12, right: 18, left: -22, bottom: 4 }}>
              <CartesianGrid strokeDasharray="4 8" stroke="rgba(148, 163, 184, 0.22)" />
              <XAxis
                dataKey="score"
                type="number"
                domain={[30, 99]}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#9AB0C0", fontSize: 12 }}
              />
              <YAxis
                dataKey="count"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#9AB0C0", fontSize: 12 }}
              />
              <Tooltip
                formatter={(value: number) => [`${value} players`, "Cohort count"]}
                labelFormatter={(label) => `Score bucket midpoint: ${label}`}
              />
              <Bar dataKey="count" barSize={18} fill="#1E2D40" radius={[12, 12, 0, 0]} />
              <ReferenceLine
                x={distribution.playerScore}
                stroke="#3ECF8E"
                strokeWidth={1.5}
                label={{
                  value: "Player",
                  position: "insideTopRight",
                  fill: "#3ECF8E",
                  fontSize: 9,
                }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div className="grid gap-3 rounded-[24px] border border-[#1E2D40] bg-[#0F2236] p-4 sm:grid-cols-3">
          <div>
            <p className="text-sm font-medium text-[#6A8090]">Comparison group</p>
            <p className="mt-1 text-base font-semibold text-[#E0E8F0]">{distribution.cohortLabel}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-[#6A8090]">Peer sample</p>
            <p className="mt-1 text-base font-semibold text-[#E0E8F0]">{distribution.sampleSize} players</p>
          </div>
          <div>
            <p className="text-sm font-medium text-[#6A8090]">What this shows</p>
            <p className="mt-1 text-sm leading-6 text-[#9AB0C0]">
              The marker shows where this player's SGI Score sits in the cohort distribution from the training log.
            </p>
          </div>
        </div>
      </div>
    </SurfaceCard>
  );
}
