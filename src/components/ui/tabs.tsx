import { cn } from "../../lib/utils";

type TabsProps<T extends string> = {
  tabs: T[];
  activeTab: T;
  onChange: (tab: T) => void;
};

export function Tabs<T extends string>({ tabs, activeTab, onChange }: TabsProps<T>) {
  return (
    <div className="overflow-x-auto">
      <div className="inline-flex rounded-full border border-[#1E2D40] bg-[#131F2E] p-1 shadow-none backdrop-blur">
        {tabs.map((tab) => {
          const isActive = tab === activeTab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => onChange(tab)}
              className={cn(
                "rounded-full px-4 py-2.5 text-sm font-medium transition sm:px-5",
                isActive
                  ? "bg-[#3ECF8E] text-[#0F1923] shadow-none"
                  : "text-[#9AB0C0] hover:text-[#E0E8F0]",
              )}
            >
              {tab}
            </button>
          );
        })}
      </div>
    </div>
  );
}
