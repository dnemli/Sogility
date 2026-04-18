import { Lightbulb } from "lucide-react";
import { SurfaceCard } from "../ui/card";

type InsightPanelProps = {
  insights: string[];
};

export function InsightPanel({ insights }: InsightPanelProps) {
  return (
    <SurfaceCard className="h-full border-emerald-100/80 bg-gradient-to-b from-white/95 to-emerald-50/40">
      <div className="flex items-center gap-3">
        <span className="rounded-2xl bg-emerald-100 p-2 text-emerald-800">
          <Lightbulb className="h-5 w-5" />
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-800/80">Observations</p>
          <h3 className="text-lg font-semibold text-slate-950">Directional insights</h3>
        </div>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-600">
        Short, conservative notes derived from the aggregates on this page — not forecasts or financial conclusions.
      </p>
      <ul className="mt-5 space-y-4">
        {insights.map((line) => (
          <li key={line} className="flex gap-3 text-sm leading-6 text-slate-700">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-600" />
            <span>{line}</span>
          </li>
        ))}
      </ul>
    </SurfaceCard>
  );
}
