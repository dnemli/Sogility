import { Lightbulb } from "lucide-react";
import { SurfaceCard } from "../ui/card";

type InsightPanelProps = {
  insights: string[];
};

export function InsightPanel({ insights }: InsightPanelProps) {
  return (
    <SurfaceCard className="h-full border-[#1E2D40] bg-[#131F2E]">
      <div className="flex items-center gap-3">
        <span className="rounded-2xl bg-[#1E2D40] p-2 text-[#3ECF8E]">
          <Lightbulb className="h-5 w-5" />
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#6A8090]">Observations</p>
          <h3 className="text-lg font-semibold text-[#E0E8F0]">Directional insights</h3>
        </div>
      </div>
      <p className="mt-3 text-sm leading-6 text-[#9AB0C0]">
        Short, conservative notes derived from the aggregates on this page — not forecasts or financial conclusions.
      </p>
      <ul className="mt-5 space-y-4">
        {insights.map((line) => (
          <li key={line} className="flex gap-3 text-sm leading-6 text-[#E0E8F0]">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#3ECF8E]" />
            <span>{line}</span>
          </li>
        ))}
      </ul>
    </SurfaceCard>
  );
}
