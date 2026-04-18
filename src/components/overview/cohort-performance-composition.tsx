import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { SurfaceCard } from "../ui/card";
import { SectionHeading } from "../ui/section-heading";
import type { CohortBandRow } from "../../types/academy-overview";

type CohortPerformanceCompositionProps = {
  rows: CohortBandRow[];
};

export function CohortPerformanceComposition({ rows }: CohortPerformanceCompositionProps) {
  return (
    <SurfaceCard>
      <div className="flex flex-col gap-6">
        <SectionHeading
          eyebrow="Composition"
          title="Performance band composition by cohort"
          description="Latest assessment band per player, grouped by cohort (age + gender). Useful for spotting where developing or foundation concentration may need programming support."
        />

        <div className="h-[320px] w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rows} margin={{ top: 8, right: 12, left: -12, bottom: 48 }}>
              <CartesianGrid strokeDasharray="4 8" stroke="rgba(148, 163, 184, 0.28)" />
              <XAxis
                dataKey="cohort"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#64748b", fontSize: 11 }}
                interval={0}
                angle={-18}
                textAnchor="end"
                height={64}
              />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
              <Tooltip
                formatter={(value: number, name: string) => [`${value} players`, name]}
                labelFormatter={(label) => `Cohort: ${label}`}
              />
              <Legend />
              <Bar dataKey="Foundation" stackId="b" fill="#fb7185" radius={[0, 0, 0, 0]} />
              <Bar dataKey="Developing" stackId="b" fill="#fbbf24" radius={[0, 0, 0, 0]} />
              <Bar dataKey="Elite" stackId="b" fill="#7c3aed" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </SurfaceCard>
  );
}
