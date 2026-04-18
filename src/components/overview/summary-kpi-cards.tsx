import { KpiCard } from "../dashboard/kpi-card";
import type { OverviewKpiMetric } from "../../types/academy-overview";

type SummaryKpiCardsProps = {
  metrics: OverviewKpiMetric[];
};

export function SummaryKpiCards({ metrics }: SummaryKpiCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => (
        <KpiCard
          key={metric.label}
          metric={{
            label: metric.label,
            value: metric.value,
            description: metric.description,
            changeText: metric.changeText ?? "—",
            changeDirection: metric.changeDirection ?? "flat",
          }}
        />
      ))}
    </div>
  );
}
