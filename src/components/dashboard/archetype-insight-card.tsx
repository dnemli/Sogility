import { Sparkles } from "lucide-react";
import { ARCHETYPE_CHART_HEIGHT, ARCHETYPE_CHART_PAD, ARCHETYPE_CHART_WIDTH } from "../../lib/archetype-chart-layout";
import { SurfaceCard } from "../ui/card";
import { SectionHeading } from "../ui/section-heading";
import type { ArchetypePoint, ArchetypeSummary } from "../../types/dashboard";

type ArchetypeInsightCardProps = {
  archetype: ArchetypeSummary;
};

function ClusterMap({
  points,
  playerPoint,
}: {
  points: ArchetypePoint[];
  playerPoint: ArchetypePoint;
}) {
  const w = ARCHETYPE_CHART_WIDTH;
  const h = ARCHETYPE_CHART_HEIGHT;
  const pad = ARCHETYPE_CHART_PAD;
  const plotW = w - pad * 2;
  const plotH = h - pad * 2;
  const midX = pad + plotW / 2;
  const midY = pad + plotH / 2;
  /** Match visual gap (plot edge ↔ label text) top vs bottom for ~20px axis copy. */
  const axisLabelGap = 17;
  const axisLabelTopBaseline = pad - axisLabelGap - 5;
  const axisLabelBottomBaseline = pad + plotH + axisLabelGap + 14;

  return (
    <div className="rounded-[24px] border border-slate-200/80 bg-white/80 p-3 sm:p-4">
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="h-auto w-full min-h-[340px] max-h-[560px] sm:min-h-[380px]"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="clusterFill" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#d7f3e1" />
            <stop offset="100%" stopColor="#e8f1fb" />
          </linearGradient>
        </defs>
        <rect x={pad} y={pad} width={plotW} height={plotH} rx="28" fill="url(#clusterFill)" />
        <line x1={pad} y1={midY} x2={pad + plotW} y2={midY} stroke="#b7c4bc" strokeDasharray="4 6" />
        <line x1={midX} y1={pad} x2={midX} y2={pad + plotH} stroke="#b7c4bc" strokeDasharray="4 6" />
        {points.map((point) => (
          <g key={point.label}>
            <circle cx={point.x} cy={point.y} r="28" fill={point.color} fillOpacity="0.28" />
            <text
              x={point.x}
              y={point.y + 48}
              textAnchor="middle"
              className="fill-slate-700 text-[16px] font-semibold"
            >
              {point.label}
            </text>
          </g>
        ))}
        <g>
          <circle cx={playerPoint.x} cy={playerPoint.y} r="9" fill="#0f172a" stroke="#ffffff" strokeWidth="2" />
          <circle
            cx={playerPoint.x}
            cy={playerPoint.y}
            r="18"
            stroke="#0f172a"
            strokeOpacity="0.12"
            fill="none"
            strokeWidth="1"
          />
          <text
            x={playerPoint.x}
            y={playerPoint.y - 20}
            textAnchor="middle"
            className="fill-slate-800 text-[16px] font-bold"
          >
            {playerPoint.label || "Player"}
          </text>
        </g>
        <text x={pad + 4} y={axisLabelTopBaseline} className="fill-slate-700 text-[20px] font-bold tracking-tight">
          Explosive direct play
        </text>
        <text
          x={w - pad - 4}
          y={axisLabelTopBaseline}
          textAnchor="end"
          className="fill-slate-700 text-[20px] font-bold tracking-tight"
        >
          Control and possession
        </text>
        <text x={pad + 4} y={axisLabelBottomBaseline} className="fill-slate-700 text-[20px] font-bold tracking-tight">
          Developmental ceiling
        </text>
        <text
          x={w - pad - 4}
          y={axisLabelBottomBaseline}
          textAnchor="end"
          className="fill-slate-700 text-[20px] font-bold tracking-tight"
        >
          All-around polish
        </text>
      </svg>
    </div>
  );
}

export function ArchetypeInsightCard({ archetype }: ArchetypeInsightCardProps) {
  return (
    <SurfaceCard className="h-full">
      <div className="flex h-full flex-col gap-6">
        <SectionHeading
          eyebrow="Archetype & Cluster"
          title={archetype.primaryArchetype}
          description={archetype.summary}
        />

        <div className="rounded-[24px] border border-emerald-200/70 bg-emerald-50/70 p-4">
          <div className="flex items-start gap-3">
            <span className="rounded-2xl bg-white p-2 text-emerald-700 shadow-sm">
              <Sparkles className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-900">Coach-ready insight</p>
              <p className="mt-2 text-sm leading-6 text-slate-700">{archetype.coachInsight}</p>
            </div>
          </div>
        </div>

        <ClusterMap points={archetype.clusterPoints} playerPoint={archetype.playerPoint} />

        <div className="grid gap-3 sm:grid-cols-2">
          {archetype.traits.map((trait) => (
            <div key={trait.label} className="rounded-[20px] border border-slate-200/80 bg-white/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                {trait.label}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-700">{trait.value}</p>
            </div>
          ))}
        </div>
      </div>
    </SurfaceCard>
  );
}
