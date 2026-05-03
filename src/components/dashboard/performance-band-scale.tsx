import { bandColorMap, bandOrder, bandTextMap, clampDisplayedScore } from "../../lib/dashboard-helpers";
import { cn } from "../../lib/utils";

type PerformanceBandScaleProps = {
  apsScore: number;
  performanceBand: keyof typeof bandColorMap;
};

const tierBands: Array<{ band: (typeof bandOrder)[number]; start: number; end: number }> = [
  { band: "Foundation", start: 0, end: 30 },
  { band: "Developing", start: 30, end: 50 },
  { band: "Approaching", start: 50, end: 70 },
  { band: "Strong", start: 70, end: 90 },
  { band: "Elite", start: 90, end: 100 },
];

export function PerformanceBandScale({
  apsScore,
  performanceBand,
}: PerformanceBandScaleProps) {
  const markerPosition = `${Math.max(0, Math.min(100, clampDisplayedScore(apsScore)))}%`;

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <div className="flex justify-end">
        <span
          className={cn(
            "w-fit shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold sm:px-2.5 sm:py-1 sm:text-xs",
            bandTextMap[performanceBand],
          )}
        >
          {performanceBand}
        </span>
      </div>
      <div className="relative w-full min-w-0">
        <div className="flex overflow-hidden rounded-full border border-[#1E2D40]">
          {tierBands.map(({ band, start, end }) => (
            <div
              key={band}
              className={cn("h-4 sm:h-6", bandColorMap[band])}
              style={{ width: `${end - start}%` }}
            />
          ))}
        </div>
        <div
          className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#0F1923] bg-white shadow-md sm:h-6 sm:w-6 sm:border-[3px]"
          style={{ left: markerPosition }}
        />
      </div>
      <div className="hidden w-full sm:flex">
        {tierBands.map(({ band, start, end }) => (
          <span
            key={band}
            className="text-center text-[9px] font-medium leading-tight text-[#9AB0C0] sm:text-[10px]"
            style={{ width: `${end - start}%` }}
          >
            {band}
          </span>
        ))}
      </div>
      <p className="text-[10px] font-medium text-[#9AB0C0] sm:hidden">Foundation to Elite</p>
    </div>
  );
}
