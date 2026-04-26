import { bandOrder, bandTextMap, getTier, type ScoreTier } from "../../lib/dashboard-helpers";

type SkillBarProps = {
  name: string;
  score: number;
  tier: string;
  min?: number;
  max?: number;
};

const tierFillColorMap: Record<ScoreTier, string> = {
  Foundation: "#FB7185",
  Developing: "#FCD34D",
  Approaching: "#A3E635",
  Strong: "#38BDF8",
  Elite: "#C4B5FD",
};

function getTierKey(score: number, tierLabel: string): ScoreTier {
  const normalized = tierLabel.trim() as ScoreTier;
  if (normalized in tierFillColorMap) return normalized;
  return getTier(score);
}

export function SkillBar({ name, score, tier, min = 30, max = 99 }: SkillBarProps) {
  const clamped = Math.max(min, Math.min(max, score));
  const tierKey = getTierKey(clamped, tier);
  const markerPosition = `${Math.max(4, Math.min(96, ((clamped - min) / Math.max(1, max - min)) * 100))}%`;

  return (
    <div className="space-y-2 rounded-xl border border-[#1E2D40] bg-[#131F2E] p-3.5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-[#E0E8F0]">{name}</span>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-[#E0E8F0]">{clamped.toFixed(1)}</span>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] ${bandTextMap[tierKey]}`}
          >
            {tier}
          </span>
        </div>
      </div>
      <div className="space-y-2">
        <div className="relative w-full">
          <div className="grid grid-cols-5 overflow-hidden rounded-full border border-[#1E2D40]">
            {bandOrder.map((band) => (
              <div
                key={band}
                className="h-5"
                style={{ backgroundColor: tierFillColorMap[band] }}
              />
            ))}
          </div>
          <div
            className="absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-[#0F1923] bg-white shadow-sm"
            style={{ left: markerPosition }}
            aria-hidden
          />
        </div>
        <div className="flex w-full gap-1">
          {bandOrder.map((band) => (
            <span key={band} className="min-w-0 flex-1 text-center text-[9px] font-medium text-[#9AB0C0]">
              {band}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
