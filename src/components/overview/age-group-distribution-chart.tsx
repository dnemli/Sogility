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
import type { AgeGenderBin } from "../../types/academy-overview";

type AgeGroupDistributionChartProps = {
  data: AgeGenderBin[];
};

export function AgeGroupDistributionChart({ data }: AgeGroupDistributionChartProps) {
  return (
    <SurfaceCard className="h-full">
      <div className="flex h-full flex-col gap-6">
        <SectionHeading
          eyebrow="Population"
          title="Player distribution by age group"
          description="Unique players by age group (stacked where gender is available). Counts players, not assessment volume."
        />

        <div className="h-[300px] w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="4 8" stroke="rgba(148, 163, 184, 0.28)" />
              <XAxis dataKey="age_group" tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
              <Tooltip
                formatter={(value: number, name: string) => [`${value} players`, name]}
                labelFormatter={(label) => `Age ${label}`}
              />
              <Legend />
              <Bar dataKey="female" name="Female" stackId="a" fill="#d946ef" radius={[0, 0, 0, 0]} />
              <Bar dataKey="male" name="Male" stackId="a" fill="#0f7ac0" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </SurfaceCard>
  );
}
