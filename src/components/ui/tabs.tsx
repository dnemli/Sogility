import { cn } from "../../lib/utils";

type TabsProps<T extends string> = {
  tabs: T[];
  activeTab: T;
  onChange: (tab: T) => void;
};

export function Tabs<T extends string>({ tabs, activeTab, onChange }: TabsProps<T>) {
  return (
    <div className="overflow-x-auto">
      <div className="inline-flex rounded-full border border-white/70 bg-white/75 p-1 shadow-panel backdrop-blur">
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
                  ? "bg-slate-900 text-white shadow-lg shadow-slate-900/15"
                  : "text-slate-600 hover:text-slate-900",
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
