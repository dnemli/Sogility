import { ARCHETYPE_CHART_HEIGHT, ARCHETYPE_CHART_PAD, ARCHETYPE_CHART_WIDTH } from "../../lib/archetype-chart-layout";
import { SurfaceCard } from "../ui/card";
import { SectionHeading } from "../ui/section-heading";
import type { ArchetypePoint, ArchetypeSummary } from "../../types/dashboard";

type ArchetypeInsightCardProps = {
  archetype: ArchetypeSummary;
  forceMobileLayout?: boolean;
};

function ClusterMap({
  points,
  playerPoint,
  forceMobileLayout = false,
}: {
  points: ArchetypePoint[];
  playerPoint: ArchetypePoint;
  forceMobileLayout?: boolean;
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
    <div className="overflow-hidden rounded-[24px] border border-[#1E2D40] bg-[#0F2236] p-3 sm:p-4">
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className={
          forceMobileLayout
            ? "h-auto w-full min-h-[250px] max-h-[420px]"
            : "h-auto w-full min-h-[250px] max-h-[560px] sm:min-h-[380px]"
        }
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
            <text x={point.x} y={point.y + 48} textAnchor="middle" className="fill-[#9AB0C0] text-[12px] font-semibold sm:text-[16px]">
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
          <text x={playerPoint.x} y={playerPoint.y - 20} textAnchor="middle" className="fill-[#E0E8F0] text-[12px] font-bold sm:text-[16px]">
            {playerPoint.label || "Player"}
          </text>
        </g>
        <text x={pad + 4} y={axisLabelTopBaseline} className="fill-[#9AB0C0] text-[12px] font-bold tracking-tight sm:text-[20px]">
          Explosive direct play
        </text>
        <text
          x={w - pad - 4}
          y={axisLabelTopBaseline}
          textAnchor="end"
          className="fill-[#9AB0C0] text-[12px] font-bold tracking-tight sm:text-[20px]"
        >
          Control and possession
        </text>
        <text x={pad + 4} y={axisLabelBottomBaseline} className="fill-[#9AB0C0] text-[12px] font-bold tracking-tight sm:text-[20px]">
          Developmental ceiling
        </text>
        <text
          x={w - pad - 4}
          y={axisLabelBottomBaseline}
          textAnchor="end"
          className="fill-[#9AB0C0] text-[12px] font-bold tracking-tight sm:text-[20px]"
        >
          All-around polish
        </text>
      </svg>
    </div>
  );
}

export function ArchetypeInsightCard({ archetype, forceMobileLayout = false }: ArchetypeInsightCardProps) {
  return (
    <SurfaceCard className="h-full">
      <div className="flex h-full flex-col gap-6">
        <SectionHeading eyebrow="Archetype & Cluster" title={archetype.primaryArchetype} />

        <ClusterMap
          points={archetype.clusterPoints}
          playerPoint={archetype.playerPoint}
          forceMobileLayout={forceMobileLayout}
        />

        <div className={forceMobileLayout ? "grid grid-cols-1 gap-3" : "grid gap-3 sm:grid-cols-2"}>
          {archetype.traits.map((trait) => (
            <div key={trait.label} className="rounded-[20px] border border-[#1E2D40] bg-[#0F2236] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6A8090]">
                {trait.label}
              </p>
              <p className="mt-2 text-sm leading-6 text-[#E0E8F0]">{trait.value}</p>
            </div>
          ))}
        </div>
      </div>
    </SurfaceCard>
  );
}
