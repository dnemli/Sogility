import { Info, UsersRound } from "lucide-react";
import { SurfaceCard } from "../ui/card";
import type { CohortInsightCopy } from "../../types/dashboard";

type CohortInsightProps = {
  insight: CohortInsightCopy;
};

export function CohortInsight({ insight }: CohortInsightProps) {
  return (
    <SurfaceCard className="h-full">
      <div className="flex h-full flex-col gap-5">
        <div className="flex items-start gap-3">
          <span className="rounded-2xl bg-emerald-100 p-2 text-emerald-700">
            <UsersRound className="h-4 w-4" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700/75">
              Cohort Comparison
            </p>
            <h3 className="mt-2 text-xl font-semibold text-slate-900">{insight.title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{insight.comparisonGroup}</p>
          </div>
        </div>

        <div className="rounded-[24px] border border-emerald-200/70 bg-emerald-50/70 p-5">
          <p className="text-lg font-semibold text-slate-900">{insight.plainLanguage}</p>
          <p className="mt-3 text-sm leading-6 text-slate-700">{insight.parentFriendly}</p>
        </div>

        <div className="rounded-[24px] border border-slate-200/80 bg-white/80 p-5">
          <div className="flex items-start gap-3">
            <Info className="mt-0.5 h-4 w-4 text-slate-400" />
            <p className="text-sm leading-6 text-slate-700">{insight.rpsDefinition}</p>
          </div>
        </div>
      </div>
    </SurfaceCard>
  );
}
