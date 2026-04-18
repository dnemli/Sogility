import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { SurfaceCard } from "../ui/card";
import { SectionHeading } from "../ui/section-heading";
import type { ActivitySegment, EngagementSummary, ReturnCohortPoint } from "../../types/academy-overview";

const PIE_COLORS = ["#94a3b8", "#1d8f5a", "#0f7ac0"];

type EngagementRetentionSectionProps = {
  summary: EngagementSummary;
  returnSeries: ReturnCohortPoint[];
  segments: ActivitySegment[];
};

export function EngagementRetentionSection({ summary, returnSeries, segments }: EngagementRetentionSectionProps) {
  return (
    <SurfaceCard>
      <div className="flex flex-col gap-8">
        <SectionHeading
          eyebrow="Engagement"
          title="Repeat participation and engagement"
          description="Summarizes repeat assessment behavior in the academy. These are participation signals — not customer churn or revenue retention."
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: "Unique players (filtered)",
              value: summary.totalUniquePlayers.toLocaleString(),
              hint: "Players appearing in the filtered dataset.",
            },
            {
              label: "Assessed in last 60 days",
              value: summary.assessedLast60Days.toLocaleString(),
              hint: "Rolling window ending today (mock anchor date).",
            },
            {
              label: "With repeat assessments",
              value: summary.assessedMoreThanOnce.toLocaleString(),
              hint: "Among players active in the last 60 days.",
            },
            {
              label: "Repeat assessment rate",
              value: `${(summary.repeatAssessmentRate * 100).toFixed(1)}%`,
              hint: "Share of last-60-day players with >1 assessment on file.",
            },
          ].map((card) => (
            <div
              key={card.label}
              className="rounded-[22px] border border-slate-200/70 bg-white/85 p-4 shadow-sm"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{card.label}</p>
              <p className="mt-3 text-3xl font-semibold text-slate-950">{card.value}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">{card.hint}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[22px] border border-slate-200/70 bg-white/80 p-4">
            <div className="mb-4">
              <p className="text-sm font-semibold text-slate-900">Return after first assessment</p>
              <p className="mt-1 text-sm text-slate-600">
                Share of players with a second assessment within 90 days of their first (by age group).
              </p>
            </div>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={returnSeries} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="4 8" stroke="rgba(148, 163, 184, 0.28)" />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                  <YAxis
                    domain={[0, 100]}
                    tickFormatter={(v) => `${v}%`}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "#64748b", fontSize: 12 }}
                  />
                  <Tooltip
                    formatter={(value: number, _name, item) => [
                      `${value}%`,
                      `Returned (${(item?.payload as ReturnCohortPoint)?.sampleSize ?? 0} eligible)`,
                    ]}
                  />
                  <Bar dataKey="pctReturned" fill="#0f7ac0" radius={[10, 10, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-[22px] border border-slate-200/70 bg-white/80 p-4">
            <div className="mb-2">
              <p className="text-sm font-semibold text-slate-900">Activity segmentation</p>
              <p className="mt-1 text-sm text-slate-600">
                One-time vs returning vs highly active players (total assessments on file).
              </p>
            </div>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
              <div className="h-[220px] w-full lg:w-1/2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={segments}
                      dataKey="count"
                      nameKey="segment"
                      innerRadius={52}
                      outerRadius={78}
                      paddingAngle={3}
                    >
                      {segments.map((_, index) => (
                        <Cell key={segments[index]?.segment} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => [`${value} players`, "Count"]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid flex-1 gap-2">
                {segments.map((s, i) => (
                  <div
                    key={s.segment}
                    className="flex items-center justify-between rounded-2xl border border-slate-200/60 bg-white px-3 py-2"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                      />
                      <span className="text-sm font-medium text-slate-800">{s.segment}</span>
                    </div>
                    <span className="text-sm font-semibold text-slate-900">
                      {s.count}{" "}
                      <span className="font-normal text-slate-500">({s.pct}%)</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </SurfaceCard>
  );
}
