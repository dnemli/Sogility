import type { ComponentType } from "react";
import { cn } from "../../lib/utils";

export type BottomNavItem = {
  id: string;
  label: string;
  icon?: ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
};

type BottomNavProps = {
  items: BottomNavItem[];
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
};

export function BottomNav({ items, activeId, onChange, className }: BottomNavProps) {
  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-40 border-t border-[#1E2D40] bg-[#131F2E] pb-[max(0.5rem,env(safe-area-inset-bottom))]",
        className,
      )}
      aria-label="Bottom navigation"
    >
      <div className="mx-auto flex h-16 w-full max-w-screen-sm items-center justify-around px-2">
        {items.map((item) => {
          const isActive = item.id === activeId;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              className={cn(
                "flex h-full flex-1 flex-col items-center justify-center gap-1 transition-colors",
                isActive ? "text-[#3ECF8E]" : "text-[#6A8090]",
              )}
              aria-current={isActive ? "page" : undefined}
            >
              {Icon ? <Icon size={20} strokeWidth={2} /> : null}
              <span className="text-xs">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
