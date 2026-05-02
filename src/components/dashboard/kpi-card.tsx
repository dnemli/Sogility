import { ArrowDownRight, ArrowUpRight, Dot } from "lucide-react";
import { SurfaceCard } from "../ui/card";
import { cn } from "../../lib/utils";
import type { SummaryMetric } from "../../types/dashboard";

type KpiCardProps = {
  metric: SummaryMetric;
  forceMobileLayout?: boolean;
};

export function KpiCard({ metric, forceMobileLayout = false }: KpiCardProps) {
  const isPositive = metric.changeDirection === "up";
  const isNeutral = metric.changeDirection === "flat";

  return (
    <SurfaceCard className="h-full bg-[#131F2E]">
      <div className="flex h-full min-w-0 flex-col gap-3">
        <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div className="min-w-0">
            <p className="text-sm font-medium text-[#6A8090]">{metric.label}</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-[#E0E8F0] sm:text-4xl">
              {metric.value}
            </p>
          </div>
          {forceMobileLayout ? null : (
            <span
              className={cn(
                "inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold sm:px-2.5 sm:py-1 sm:text-xs",
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
          )}
        </div>
        <p className="text-sm leading-5 text-[#9AB0C0]">{metric.description}</p>
      </div>
    </SurfaceCard>
  );
}
