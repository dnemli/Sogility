import { ArrowRight, TrendingDown, TrendingUp } from "lucide-react";
import { SurfaceCard } from "../ui/card";

type StrengthsWeaknessesProps = {
  strengths: string[];
  improvements: string[];
};

function InsightList({
  title,
  subtitle,
  items,
  positive,
}: {
  title: string;
  subtitle: string;
  items: string[];
  positive: boolean;
}) {
  const Icon = positive ? TrendingUp : TrendingDown;

  return (
    <SurfaceCard className="h-full bg-white/80">
      <div className="flex h-full flex-col gap-5">
        <div className="flex items-start gap-3">
          <span
            className={`rounded-2xl p-2 ${positive ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}
          >
            <Icon className="h-4 w-4" />
          </span>
          <div>
            <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
            <p className="mt-1 text-sm leading-6 text-slate-600">{subtitle}</p>
          </div>
        </div>
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item}
              className="flex items-start gap-3 rounded-[22px] border border-slate-200/70 bg-slate-50/70 px-4 py-3"
            >
              <ArrowRight className="mt-0.5 h-4 w-4 text-slate-400" />
              <p className="text-sm leading-6 text-slate-700">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </SurfaceCard>
  );
}

export function StrengthsWeaknesses({
  strengths,
  improvements,
}: StrengthsWeaknessesProps) {
  return (
    <section className="grid gap-6 lg:grid-cols-2">
      <InsightList
        title="Strengths"
        subtitle="Areas where the player is consistently outperforming their peer benchmark."
        items={strengths}
        positive
      />
      <InsightList
        title="Areas for improvement"
        subtitle="High-impact opportunities to lift benchmark fit and relative standing over the next training block."
        items={improvements}
        positive={false}
      />
    </section>
  );
}
