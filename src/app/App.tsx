import { useState } from "react";
import { DashboardPage } from "./dashboard-page";
import { dashboardCollection } from "../data/training-data";
import { Tabs } from "../components/ui/tabs";

type RoleView = "Trainer View" | "Parent/Player View";

const roleTabs: RoleView[] = ["Trainer View", "Parent/Player View"];

export function App() {
  const initialPlayer = dashboardCollection.players[0];
  const [activeRole, setActiveRole] = useState<RoleView>("Trainer View");
  const [selectedPlayerId, setSelectedPlayerId] = useState(initialPlayer.id);

  return (
    <main className="min-h-screen px-4 py-6 text-ink sm:px-6 lg:px-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
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
