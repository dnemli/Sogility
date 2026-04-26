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
};

export function AssessmentBreakdown({ abilities, playerName }: AssessmentBreakdownProps) {
  const [open, setOpen] = useState<Record<string, boolean>>({});

  const toggle = (key: string) => {
    setOpen((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <SurfaceCard>
      <div className="flex flex-col gap-6">
        <SectionHeading
          eyebrow="Abilities"
          title={`${playerName} — ability snapshot`}
          description="Each row is a skill ability. Expand to see individual assessments from the session log."
        />

        <div className="overflow-hidden rounded-[24px] border border-slate-200/80 bg-white/80">
          <div className="hidden grid-cols-[minmax(0,1.15fr)_minmax(0,1.35fr)] gap-6 border-b border-slate-200/80 px-5 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 lg:grid">
            <span>Ability</span>
            <span>SGI tier</span>
          </div>

          <div className="divide-y divide-slate-200/70">
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
                    className="grid w-full gap-6 px-5 py-5 text-left transition hover:bg-slate-50/80 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1.35fr)] lg:items-start"
                  >
                    <div className="flex items-start gap-3">
                      <ChevronDown
                        className={cn(
                          "mt-0.5 h-5 w-5 shrink-0 text-slate-500 transition",
                          isOpen ? "rotate-180" : "rotate-0",
                        )}
                      />
                      <div>
                        <p className="text-base font-semibold text-slate-900">{row.ability}</p>
                        <p className="mt-1 text-sm text-slate-500">
                          {hasTests ? (
                            <>
                              {row.tests.length} assessment{row.tests.length === 1 ? "" : "s"} · avg SGI{" "}
                              {row.avgAps.toFixed(1)}
                            </>
                          ) : (
                            <>No tests on record yet</>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="pl-8 lg:pl-0">
                      {hasTests ? (
                        <>
                          <PerformanceBandScale apsScore={row.avgAps} performanceBand={row.aggregateBand} />
                          <p className="mt-2 text-xs text-slate-500">Aggregate across assessments in this skill</p>
                        </>
                      ) : (
                        <div className="rounded-2xl border border-emerald-200/90 bg-emerald-50/70 px-4 py-3">
                          <p className="text-sm font-semibold text-slate-900">
                            Take these assessments to see your {row.ability} ability!
                          </p>
                          <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                            Complete any of the mapped drills below—your benchmark will appear once session data
                            exists for this ability.
                          </p>
                        </div>
                      )}
                    </div>
                  </button>

                  {isOpen ? (
                    <div className="border-t border-slate-200/60 bg-slate-50/50 px-5 py-4">
                      {hasTests ? (
                        <>
                          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                            Tests (from training_session.csv)
                          </p>
                          <div className="flex flex-col gap-4">
                            {row.tests.map((t) => (
                              <div
                                key={t.assessmentName}
                                className="grid gap-4 rounded-2xl border border-slate-200/70 bg-white/90 p-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]"
                              >
                                <div>
                                  <p className="font-medium text-slate-900">{t.assessmentName}</p>
                                  <p className="mt-1 text-xs text-slate-500">{t.latestSessionLabel}</p>
                                </div>
                                <PerformanceBandScale apsScore={t.apsScore} performanceBand={t.performanceBand} />
                              </div>
                            ))}
                          </div>
                        </>
                      ) : (
                        <>
                          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                            Assessments that map to {row.ability}
                          </p>
                          {suggested.length === 0 ? (
                            <p className="text-sm text-slate-600">No mapping defined for this ability.</p>
                          ) : (
                            <ul className="list-inside list-disc space-y-1.5 text-sm text-slate-700">
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
