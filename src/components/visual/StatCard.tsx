import { cn } from "../../lib/utils";

type TrendDirection = "up" | "down" | "flat";

type StatCardProps = {
  label: string;
  value: string | number;
  subValue?: string;
  trendText?: string;
  trendDirection?: TrendDirection;
  className?: string;
};

export function StatCard({
  label,
  value,
  subValue,
  trendText,
  trendDirection = "flat",
  className,
}: StatCardProps) {
  return (
    <div className={cn("rounded-2xl border border-[#1E2D40] bg-[#0F2236] p-5", className)}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6A8090]">{label}</p>
      <p className="mt-2 text-4xl font-bold leading-none text-[#3ECF8E]">{value}</p>
      {subValue ? <p className="mt-2 text-sm text-[#E0E8F0]">{subValue}</p> : null}
      {trendText ? (
        <p
          className={cn(
            "mt-2 text-sm font-semibold",
            trendDirection === "up" && "text-[#3ECF8E]",
            trendDirection === "down" && "text-[#E74C3C]",
            trendDirection === "flat" && "text-[#6A8090]",
          )}
        >
          {trendText}
        </p>
      ) : null}
    </div>
  );
}
