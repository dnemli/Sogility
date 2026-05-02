import { useState } from "react";
import { DashboardPage } from "./dashboard-page";
import { dashboardCollection } from "../data/training-data";
import { Tabs } from "../components/ui/tabs";
import { cn } from "../lib/utils";

type RoleView = "Trainer View" | "Parent/Player View";
type ViewportMode = "Phone View" | "Desktop View";

const roleTabs: RoleView[] = ["Trainer View", "Parent/Player View"];
const viewportTabs: ViewportMode[] = ["Phone View", "Desktop View"];

export function App() {
  const initialPlayer = dashboardCollection.players[0];
  const [activeRole, setActiveRole] = useState<RoleView>("Trainer View");
  const [viewportMode, setViewportMode] = useState<ViewportMode>("Phone View");
  const [selectedPlayerId, setSelectedPlayerId] = useState(initialPlayer.id);
  const isDarkApp = true;
  const isPhoneView = viewportMode === "Phone View";

  return (
    <main
      className={cn(
        "min-h-screen px-4 pb-24 pt-[max(1rem,env(safe-area-inset-top))] text-ink sm:px-6",
        isDarkApp ? "bg-[#0F1923] text-[#E0E8F0]" : "",
      )}
    >
      <div
        className={cn(
          "mx-auto flex w-full flex-col gap-5",
          isPhoneView ? "max-w-[460px] md:max-w-[480px]" : "max-w-6xl",
        )}
      >
        <section
          className={cn(
            "mx-auto w-full rounded-2xl p-4",
            isDarkApp
              ? "border border-[#1E2D40] bg-[#131F2E]"
              : "border border-slate-200 bg-white",
          )}
        >
          <p
            className={cn(
              "mb-3 text-xs font-semibold uppercase tracking-[0.2em]",
              isDarkApp ? "text-[#6A8090]" : "text-slate-500",
            )}
          >
            Role selector
          </p>
          <div className="flex flex-col gap-3">
            <Tabs tabs={roleTabs} activeTab={activeRole} onChange={setActiveRole} />
            <Tabs tabs={viewportTabs} activeTab={viewportMode} onChange={setViewportMode} />
          </div>
        </section>

        <DashboardPage
          role={activeRole}
          isPhoneView={isPhoneView}
          selectedPlayerId={selectedPlayerId}
          onPlayerChange={setSelectedPlayerId}
        />
      </div>
    </main>
  );
}
