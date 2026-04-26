type SkillBarProps = {
  name: string;
  score: number;
  tier: string;
  min?: number;
  max?: number;
};

function getFillColor(score: number): string {
  if (score >= 70) return "#3ECF8E";
  if (score >= 50) return "#F5A623";
  return "#E74C3C";
}

export function SkillBar({ name, score, tier, min = 30, max = 99 }: SkillBarProps) {
  const clamped = Math.max(min, Math.min(max, score));
  const pct = ((clamped - min) / Math.max(1, max - min)) * 100;

  return (
    <div className="space-y-2 rounded-xl border border-[#1E2D40] bg-[#131F2E] p-3.5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-[#E0E8F0]">{name}</span>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-[#E0E8F0]">{clamped.toFixed(1)}</span>
          <span className="rounded-full bg-[#1E2D40] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#6A8090]">
            {tier}
          </span>
        </div>
      </div>
      <div className="h-2 rounded-full bg-[#1E2D40]">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${Math.max(0, Math.min(100, pct))}%`,
            backgroundColor: getFillColor(clamped),
          }}
        />
      </div>
    </div>
  );
}
