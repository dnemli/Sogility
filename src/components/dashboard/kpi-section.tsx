import { KpiCard } from "./kpi-card";
import type { SummaryMetric } from "../../types/dashboard";

type KpiSectionProps = {
  metrics: SummaryMetric[];
};

export function KpiSection({ metrics }: KpiSectionProps) {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => (
        <KpiCard key={metric.label} metric={metric} />
      ))}
    </section>
  );
}
