import { Sparkles } from "lucide-react";
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
  return (
    <div className="rounded-[24px] border border-slate-200/80 bg-white/80 p-4">
      <svg viewBox="0 0 320 220" className="h-[220px] w-full">
        <defs>
          <linearGradient id="clusterFill" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#d7f3e1" />
            <stop offset="100%" stopColor="#e8f1fb" />
          </linearGradient>
        </defs>
        <rect x="18" y="20" width="284" height="172" rx="24" fill="url(#clusterFill)" />
        <line x1="40" y1="106" x2="280" y2="106" stroke="#b7c4bc" strokeDasharray="4 6" />
        <line x1="160" y1="34" x2="160" y2="182" stroke="#b7c4bc" strokeDasharray="4 6" />
        {points.map((point) => (
          <g key={point.label}>
            <circle cx={point.x} cy={point.y} r="18" fill={point.color} fillOpacity="0.32" />
            <text
              x={point.x}
              y={point.y + 34}
              textAnchor="middle"
              className="fill-slate-700 text-[11px] font-medium"
            >
              {point.label}
            </text>
          </g>
        ))}
        <g>
          <polygon
            points={`${playerPoint.x},${playerPoint.y - 14} ${playerPoint.x + 14},${playerPoint.y} ${playerPoint.x},${playerPoint.y + 14} ${playerPoint.x - 14},${playerPoint.y}`}
            fill="#0f172a"
          />
          <circle cx={playerPoint.x} cy={playerPoint.y} r="26" stroke="#0f172a" strokeOpacity="0.18" fill="none" />
          <text
            x={playerPoint.x}
            y={playerPoint.y + 34}
            textAnchor="middle"
            className="fill-slate-900 text-[12px] font-semibold"
          >
            Player
          </text>
        </g>
        <text x="28" y="16" className="fill-slate-500 text-[11px] font-medium">
          Explosive direct play
        </text>
        <text x="210" y="16" className="fill-slate-500 text-[11px] font-medium">
          Control and possession
        </text>
        <text x="26" y="210" className="fill-slate-500 text-[11px] font-medium">
          Developmental ceiling
        </text>
        <text x="224" y="210" className="fill-slate-500 text-[11px] font-medium">
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
