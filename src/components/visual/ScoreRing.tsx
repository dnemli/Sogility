type ScoreRingProps = {
  score: number;
  min?: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  valueFormatter?: (value: number) => string;
};

export function ScoreRing({
  score,
  min = 30,
  max = 99,
  size = 156,
  strokeWidth = 12,
  label = "SGI",
  valueFormatter,
}: ScoreRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(min, Math.min(max, score));
  const normalized = (clamped - min) / Math.max(1, max - min);
  const progress = normalized * circumference;
  const displayValue = valueFormatter ? valueFormatter(clamped) : `${Math.round(clamped)}`;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90 transform">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#1E2D40"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#3ECF8E"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 700ms ease-in-out" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold text-[#3ECF8E]">{displayValue}</span>
        <span className="mt-1 text-[11px] font-medium uppercase tracking-[0.18em] text-[#6A8090]">
          {label}
        </span>
      </div>
    </div>
  );
}
