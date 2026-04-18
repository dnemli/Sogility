import { bandColorMap, bandOrder, bandTextMap } from "../../lib/dashboard-helpers";
import { cn } from "../../lib/utils";

type PerformanceBandScaleProps = {
  apsScore: number;
  performanceBand: keyof typeof bandColorMap;
};

export function PerformanceBandScale({
  apsScore,
  performanceBand,
}: PerformanceBandScaleProps) {
  const markerPosition = `${Math.max(4, Math.min(96, apsScore))}%`;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-700">Benchmark fit</p>
        <span
          className={cn(
            "rounded-full px-2.5 py-1 text-xs font-semibold",
            bandTextMap[performanceBand],
          )}
        >
          {performanceBand}
        </span>
      </div>
      <div className="relative">
        <div className="grid grid-cols-5 overflow-hidden rounded-full border border-white/80">
          {bandOrder.map((band) => (
            <div key={band} className={cn("h-4", bandColorMap[band])} />
          ))}
        </div>
        <div
          className="absolute top-1/2 h-6 w-6 -translate-y-1/2 -translate-x-1/2 rounded-full border-4 border-slate-950 bg-white shadow-lg"
          style={{ left: markerPosition }}
        />
      </div>
      <div className="grid grid-cols-5 gap-1 text-[11px] font-medium text-slate-500">
        {bandOrder.map((band) => (
          <span key={band}>{band}</span>
        ))}
      </div>
    </div>
  );
}
