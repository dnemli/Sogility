import { useState } from "react";
import { DashboardPage } from "./dashboard-page";
import { dashboardCollection } from "../data/training-data";
import { Tabs } from "../components/ui/tabs";
import { cn } from "../lib/utils";

type RoleView = "Trainer View" | "Parent/Player View";

const roleTabs: RoleView[] = ["Trainer View", "Parent/Player View"];

export function App() {
  const initialPlayer = dashboardCollection.players[0];
  const [activeRole, setActiveRole] = useState<RoleView>("Trainer View");
  const [selectedPlayerId, setSelectedPlayerId] = useState(initialPlayer.id);
  const isParentView = activeRole === "Parent/Player View";

  return (
    <main
      className={cn(
        "min-h-screen px-4 py-6 text-ink sm:px-6 lg:px-10",
        isParentView ? "bg-[#0F1923] text-[#E0E8F0]" : "",
      )}
    >
      <div className={cn("mx-auto flex w-full max-w-7xl flex-col gap-6", isParentView ? "max-w-screen-sm" : "")}>
        <section
          className={cn(
            "rounded-2xl p-4",
            isParentView
              ? "border border-[#1E2D40] bg-[#131F2E]"
              : "border border-slate-200 bg-white",
          )}
        >
          <p
            className={cn(
              "mb-3 text-xs font-semibold uppercase tracking-[0.2em]",
              isParentView ? "text-[#6A8090]" : "text-slate-500",
            )}
          >
            Role selector
          </p>
          <Tabs tabs={roleTabs} activeTab={activeRole} onChange={setActiveRole} />
        </section>

        <DashboardPage
          role={activeRole}
          selectedPlayerId={selectedPlayerId}
          onPlayerChange={setSelectedPlayerId}
        />
      </div>
    </main>
  );
}
