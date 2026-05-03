import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { SurfaceCard } from "../ui/card";
import { SectionHeading } from "../ui/section-heading";
import { PerformanceBandScale } from "./performance-band-scale";
import { assessmentLabelsForAbility } from "../../lib/assessment-to-ability";
import { cn } from "../../lib/utils";
import type { AbilityBreakdownRow } from "../../types/dashboard";

type AssessmentBreakdownProps = {
  abilities: AbilityBreakdownRow[];
  playerName: string;
  forceMobileLayout?: boolean;
};

export function AssessmentBreakdown({ abilities, playerName, forceMobileLayout = false }: AssessmentBreakdownProps) {
  const [open, setOpen] = useState<Record<string, boolean>>({});

  const toggle = (key: string) => {
    setOpen((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <SurfaceCard>
      <div className="flex flex-col gap-4 sm:gap-6">
        <SectionHeading
          eyebrow="Abilities"
          title={`${playerName} — ability snapshot`}
          description="Each row is a skill ability. Expand to see individual assessments from the session log."
        />

        <div className="overflow-hidden rounded-[24px] border border-[#1E2D40] bg-[#0F2236]">
          <div
            className={cn(
              "hidden gap-6 border-b border-[#1E2D40] px-5 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-[#6A8090]",
              forceMobileLayout ? "lg:hidden" : "lg:grid lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1.35fr)]",
            )}
          >
            <span>Ability</span>
            <span>Score tier</span>
          </div>

          <div className="divide-y divide-[#1E2D40]">
            {abilities.map((row) => {
              const key = row.ability;
              const isOpen = open[key] ?? false;
              const hasTests = row.tests.length > 0;
              const suggested = assessmentLabelsForAbility(row.ability);
              return (
                <div key={key}>
                  <button
                    type="button"
                    onClick={() => toggle(key)}
                    className={cn(
                      "grid w-full gap-2 px-4 py-3 text-left transition hover:bg-[#131F2E] sm:gap-3 sm:px-5 sm:py-4",
                      forceMobileLayout ? "grid-cols-1" : "lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1.35fr)] lg:items-start",
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <ChevronDown
                        className={cn(
                          "mt-0.5 h-5 w-5 shrink-0 text-[#6A8090] transition",
                          isOpen ? "rotate-180" : "rotate-0",
                        )}
                      />
                      <div>
                        <p className="text-sm font-semibold text-[#E0E8F0] sm:text-base">{row.ability}</p>
                        {hasTests ? (
                          <p className="mt-0.5 text-xs text-[#9AB0C0] sm:text-sm">
                            {row.tests.length} assessment{row.tests.length === 1 ? "" : "s"} · avg score{" "}
                            {row.avgAps.toFixed(1)}
                          </p>
                        ) : null}
                      </div>
                    </div>
                    <div className="min-w-0 pl-0 pt-0.5 lg:pl-0">
                      {hasTests ? (
                        <PerformanceBandScale apsScore={row.avgAps} performanceBand={row.aggregateBand} />
                      ) : (
                        <div className="rounded-2xl border border-[#1E2D40] bg-[#131F2E] px-3 py-2.5">
                          <p className="text-sm font-semibold leading-snug text-[#E0E8F0]">
                            No {row.ability} assessment recorded
                          </p>
                          <p className="mt-1 text-xs leading-relaxed text-[#9AB0C0]">
                            Score one of the mapped drills below to start tracking this skill.
                          </p>
                        </div>
                      )}
                    </div>
                  </button>

                  {isOpen ? (
                    <div className="border-t border-[#1E2D40] bg-[#131F2E] px-4 py-4 sm:px-5">
                      {hasTests ? (
                        <>
                          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#6A8090]">
                            Tests (from training_session.csv)
                          </p>
                          <div className="flex flex-col gap-3 sm:gap-4">
                            {row.tests.map((t) => (
                              <div
                                key={t.assessmentName}
                                className={cn(
                                  "grid min-w-0 gap-2 rounded-2xl border border-[#1E2D40] bg-[#0F2236] p-3 sm:gap-3 sm:p-4",
                                  forceMobileLayout ? "grid-cols-1" : "lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]",
                                )}
                              >
                                <div>
                                  <p className="font-medium text-[#E0E8F0]">{t.assessmentName}</p>
                                  <p className="mt-1 text-xs text-[#9AB0C0]">{t.latestSessionLabel}</p>
                                </div>
                                <PerformanceBandScale apsScore={t.apsScore} performanceBand={t.performanceBand} />
                              </div>
                            ))}
                          </div>
                        </>
                      ) : (
                        <>
                          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#6A8090]">
                            Assessments that map to {row.ability}
                          </p>
                          {suggested.length === 0 ? (
                            <p className="text-sm text-[#9AB0C0]">No mapping defined for this ability.</p>
                          ) : (
                            <ul className="list-inside list-disc space-y-1.5 text-sm text-[#E0E8F0]">
                              {suggested.map((label) => (
                                <li key={label}>{label}</li>
                              ))}
                            </ul>
                          )}
                        </>
                      )}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </SurfaceCard>
  );
}
