import { ArrowDownRight, ArrowUpRight, Dot } from "lucide-react";
import { SurfaceCard } from "../ui/card";
import { cn } from "../../lib/utils";
import type { SummaryMetric } from "../../types/dashboard";

type KpiCardProps = {
  metric: SummaryMetric;
};

export function KpiCard({ metric }: KpiCardProps) {
  const isPositive = metric.changeDirection === "up";
  const isNeutral = metric.changeDirection === "flat";

  return (
    <SurfaceCard className="h-full bg-[#131F2E]">
      <div className="flex h-full flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-[#6A8090]">{metric.label}</p>
            <p className="mt-3 text-4xl font-semibold tracking-tight text-[#E0E8F0]">
              {metric.value}
            </p>
          </div>
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
              isPositive && "bg-[#3ECF8E]/20 text-[#3ECF8E]",
              !isPositive && !isNeutral && "bg-[#E74C3C]/20 text-[#E74C3C]",
              isNeutral && "bg-[#1E2D40] text-[#9AB0C0]",
            )}
          >
            {isNeutral ? (
              <Dot className="h-4 w-4" />
            ) : isPositive ? (
              <ArrowUpRight className="h-3.5 w-3.5" />
            ) : (
              <ArrowDownRight className="h-3.5 w-3.5" />
            )}
            {metric.changeText}
          </span>
        </div>
        <p className="text-sm leading-6 text-[#9AB0C0]">{metric.description}</p>
      </div>
    </SurfaceCard>
  );
}
