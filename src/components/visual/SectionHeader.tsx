import type { ReactNode } from "react";
import { cn } from "../../lib/utils";

type SectionHeaderProps = {
  overline?: string;
  title: string;
  description?: string;
  rightContent?: ReactNode;
  className?: string;
};

export function SectionHeader({
  overline,
  title,
  description,
  rightContent,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn("flex items-start justify-between gap-4", className)}>
      <div>
        {overline ? (
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6A8090]">{overline}</p>
        ) : null}
        <h2 className="mt-1 text-2xl font-semibold text-[#E0E8F0]">{title}</h2>
        {description ? <p className="mt-2 text-sm text-[#9AB0C0]">{description}</p> : null}
      </div>
      {rightContent ? <div className="shrink-0">{rightContent}</div> : null}
    </div>
  );
}
