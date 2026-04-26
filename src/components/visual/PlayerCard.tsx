import type { ReactNode } from "react";
import { cn } from "../../lib/utils";

type PlayerCardProps = {
  playerName: string;
  subtitle?: string;
  rightContent?: ReactNode;
  accent?: string;
  className?: string;
  onClick?: () => void;
};

export function PlayerCard({
  playerName,
  subtitle,
  rightContent,
  accent = "#3ECF8E",
  className,
  onClick,
}: PlayerCardProps) {
  const initials = playerName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center justify-between gap-3 rounded-2xl border border-[#1E2D40] bg-[#0F2236] px-4 py-3 text-left transition hover:border-[#29435b]",
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold"
          style={{ backgroundColor: `${accent}20`, color: accent }}
        >
          {initials || "P"}
        </div>
        <div className="min-w-0">
          <p className="truncate text-lg font-semibold text-[#E0E8F0]">{playerName}</p>
          {subtitle ? <p className="truncate text-sm text-[#6A8090]">{subtitle}</p> : null}
        </div>
      </div>
      {rightContent ? <div className="shrink-0">{rightContent}</div> : null}
    </button>
  );
}
