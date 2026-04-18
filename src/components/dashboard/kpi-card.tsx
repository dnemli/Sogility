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
    <SurfaceCard className="h-full bg-white/80">
      <div className="flex h-full flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-500">{metric.label}</p>
            <p className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
              {metric.value}
            </p>
          </div>
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
              isPositive && "bg-emerald-100 text-emerald-700",
              !isPositive && !isNeutral && "bg-rose-100 text-rose-700",
              isNeutral && "bg-slate-100 text-slate-600",
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
        <p className="text-sm leading-6 text-slate-600">{metric.description}</p>
      </div>
    </SurfaceCard>
  );
}
