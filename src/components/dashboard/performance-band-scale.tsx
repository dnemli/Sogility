import { bandColorMap, bandOrder, bandTextMap, clampDisplayedScore } from "../../lib/dashboard-helpers";
import { cn } from "../../lib/utils";

type PerformanceBandScaleProps = {
  apsScore: number;
  performanceBand: keyof typeof bandColorMap;
};

export function PerformanceBandScale({
  apsScore,
  performanceBand,
}: PerformanceBandScaleProps) {
  const markerPosition = `${Math.max(4, Math.min(96, clampDisplayedScore(apsScore)))}%`;

  return (
    <div className="flex min-w-0 flex-col gap-2.5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-[#9AB0C0]">SGI tier</p>
        <span
          className={cn(
            "shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold",
            bandTextMap[performanceBand],
          )}
        >
          {performanceBand}
        </span>
      </div>
      <div className="relative w-full min-w-[min(100%,22rem)]">
        <div className="grid grid-cols-5 overflow-hidden rounded-full border border-[#1E2D40]">
          {bandOrder.map((band) => (
            <div key={band} className={cn("h-6 sm:h-7", bandColorMap[band])} />
          ))}
        </div>
        <div
          className="absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-[#0F1923] bg-white shadow-md sm:h-6 sm:w-6"
          style={{ left: markerPosition }}
        />
      </div>
      <div className="flex w-full gap-1.5 px-0.5 sm:gap-2">
        {bandOrder.map((band) => (
          <span
            key={band}
            className="min-w-0 flex-1 text-center text-[9px] font-medium leading-tight text-[#9AB0C0] sm:text-[10px]"
          >
            {band}
          </span>
        ))}
      </div>
    </div>
  );
}
