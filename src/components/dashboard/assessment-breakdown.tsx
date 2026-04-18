import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { SurfaceCard } from "../ui/card";
import { SectionHeading } from "../ui/section-heading";
import { PerformanceBandScale } from "./performance-band-scale";
import { cn } from "../../lib/utils";
import type { AssessmentRow, SkillFilterOption } from "../../types/dashboard";

type AssessmentBreakdownProps = {
  assessments: AssessmentRow[];
  selectedSkill: SkillFilterOption;
  playerName: string;
};

export function AssessmentBreakdown({
  assessments,
  selectedSkill,
  playerName,
}: AssessmentBreakdownProps) {
  return (
    <SurfaceCard>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <SectionHeading
            eyebrow="Assessment Breakdown"
            title={`${playerName}'s latest training results`}
            description="Each row shows how the player performed against benchmark standards and how they compare with similar players in the selected cohort."
          />
          <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
            {selectedSkill}
          </span>
        </div>

        <div className="overflow-hidden rounded-[24px] border border-slate-200/80 bg-white/80">
          <div className="hidden grid-cols-[1.3fr_1.2fr_0.65fr_0.7fr_0.55fr] gap-4 border-b border-slate-200/80 px-5 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 lg:grid">
            <span>Assessment</span>
            <span>Benchmark fit (APS)</span>
            <span>Cohort edge (RPS)</span>
            <span>Percentile</span>
            <span>Change</span>
          </div>

          <div className="divide-y divide-slate-200/70">
            {assessments.map((assessment) => {
              const changeIcon =
                assessment.changeDirection === "up" ? (
                  <ArrowUpRight className="h-4 w-4" />
                ) : assessment.changeDirection === "down" ? (
                  <ArrowDownRight className="h-4 w-4" />
                ) : (
                  <Minus className="h-4 w-4" />
                );

              return (
                <div
                  key={assessment.assessmentName}
                  className="grid gap-4 px-5 py-5 lg:grid-cols-[1.3fr_1.2fr_0.65fr_0.7fr_0.55fr] lg:items-center"
                >
                  <div>
                    <p className="text-base font-semibold text-slate-900">{assessment.assessmentName}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                        {assessment.category}
                      </span>
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                        {assessment.latestSessionLabel}
                      </span>
                    </div>
                  </div>

                  <div>
                    <PerformanceBandScale
                      apsScore={assessment.apsScore}
                      performanceBand={assessment.performanceBand}
                    />
                    <p className="mt-2 text-xs text-slate-500">
                      APS {Math.round(assessment.apsScore)} out of 100
                    </p>
                  </div>

                  <div className="rounded-[20px] border border-slate-200/70 bg-slate-50/80 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Cohort edge
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-slate-900">{assessment.rpsScore}</p>
                    <p className="mt-1 text-xs text-slate-500">RPS relative standing</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-slate-500">Percentile</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-900">
                      {assessment.percentile}th
                    </p>
                  </div>

                  <div
                    className={cn(
                      "inline-flex w-fit items-center gap-1 rounded-full px-3 py-1.5 text-sm font-semibold",
                      assessment.changeDirection === "up" && "bg-emerald-100 text-emerald-700",
                      assessment.changeDirection === "down" && "bg-rose-100 text-rose-700",
                      assessment.changeDirection === "flat" && "bg-slate-100 text-slate-600",
                    )}
                  >
                    {changeIcon}
                    {assessment.changeText}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </SurfaceCard>
  );
}
