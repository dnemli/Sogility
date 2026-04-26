import type { HTMLAttributes } from "react";
import { cn } from "../../lib/utils";

export function SurfaceCard({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-[#1E2D40] bg-[#131F2E] p-4 shadow-none backdrop-blur md:p-6",
        className,
      )}
      {...props}
    />
  );
}
