import type { HTMLAttributes } from "react";
import { cn } from "../../lib/utils";

export function SurfaceCard({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[28px] border border-white/70 bg-panel/90 p-5 shadow-panel backdrop-blur md:p-6",
        className,
      )}
      {...props}
    />
  );
}
