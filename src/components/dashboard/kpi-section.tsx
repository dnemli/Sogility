import { KpiCard } from "./kpi-card";
import type { SummaryMetric } from "../../types/dashboard";

type KpiSectionProps = {
  metrics: SummaryMetric[];
};

export function KpiSection({ metrics }: KpiSectionProps) {
  const gridClass =
    metrics.length <= 2
      ? "grid gap-4 md:grid-cols-2"
      : metrics.length === 3
        ? "grid gap-4 md:grid-cols-2 lg:grid-cols-3"
        : "grid gap-4 md:grid-cols-2 xl:grid-cols-4";
  return (
    <section className={gridClass}>
      {metrics.map((metric) => (
        <KpiCard key={metric.label} metric={metric} />
      ))}
    </section>
  );
}
