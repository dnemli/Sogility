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

const PIE_COLORS = ["#6A8090", "#3ECF8E", "#9AB0C0"];

type EngagementRetentionSectionProps = {
  summary: EngagementSummary;
  returnSeries: ReturnCohortPoint[];
  segments: ActivitySegment[];
  /** Selected overview date span — same as top KPIs and participation chart. */
  periodLabel: string;
};

export function EngagementRetentionSection({
  summary,
  returnSeries,
  segments,
  periodLabel,
}: EngagementRetentionSectionProps) {
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
              label: "Players in roster (filtered)",
              value: summary.totalUniquePlayers.toLocaleString(),
              hint: "Unique players for your age and gender filters (all dates).",
            },
            {
              label: "Active this period",
              value: summary.activeInSelectedPeriod.toLocaleString(),
              hint: `At least one session between ${periodLabel}.`,
            },
            {
              label: "Also have 2+ visits on file",
              value: summary.activeWithTwoPlusTotal.toLocaleString(),
              hint: "Of players active this period, how many have more than one assessment recorded overall.",
            },
            {
              label: "Share with 2+ assessments",
              value: `${(summary.repeatShareOfActive * 100).toFixed(1)}%`,
              hint: "Of players active this period, percent with more than one assessment on file.",
            },
          ].map((card) => (
            <div
              key={card.label}
              className="rounded-[22px] border border-[#1E2D40] bg-[#0F2236] p-4"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6A8090]">{card.label}</p>
              <p className="mt-3 text-3xl font-semibold text-[#E0E8F0]">{card.value}</p>
              <p className="mt-2 text-sm leading-6 text-[#9AB0C0]">{card.hint}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[22px] border border-[#1E2D40] bg-[#0F2236] p-4">
            <div className="mb-4">
              <p className="text-sm font-semibold text-[#E0E8F0]">Return after first assessment</p>
              <p className="mt-1 text-sm text-[#9AB0C0]">
                Share of players with a second assessment within 90 days of their first (by age group).
              </p>
            </div>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={returnSeries} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="4 8" stroke="rgba(148, 163, 184, 0.22)" />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "#9AB0C0", fontSize: 12 }} />
                  <YAxis
                    domain={[0, 100]}
                    tickFormatter={(v) => `${v}%`}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "#9AB0C0", fontSize: 12 }}
                  />
                  <Tooltip
                    formatter={(value: number, _name, item) => [
                      `${value}%`,
                      `Returned (${(item?.payload as ReturnCohortPoint)?.sampleSize ?? 0} eligible)`,
                    ]}
                  />
                  <Bar dataKey="pctReturned" fill="#3ECF8E" radius={[10, 10, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-[22px] border border-[#1E2D40] bg-[#0F2236] p-4">
            <div className="mb-2">
              <p className="text-sm font-semibold text-[#E0E8F0]">Activity segmentation</p>
              <p className="mt-1 text-sm text-[#9AB0C0]">
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
                    className="flex items-center justify-between rounded-2xl border border-[#1E2D40] bg-[#131F2E] px-3 py-2"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                      />
                      <span className="text-sm font-medium text-[#E0E8F0]">{s.segment}</span>
                    </div>
                    <span className="text-sm font-semibold text-[#E0E8F0]">
                      {s.count}{" "}
                      <span className="font-normal text-[#9AB0C0]">({s.pct}%)</span>
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
