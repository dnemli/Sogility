import type { PlayerScoreRecord, PlayerDashboardView } from "../types/dashboard";

type DashboardSelection = {
  playerName: string;
  ageGroup?: string;
  gender?: string;
  cohortName?: string;
};

export function mapScoringOutputToDashboardView(
  _records: PlayerScoreRecord[],
  _selection: DashboardSelection,
): PlayerDashboardView {
  throw new Error(
    "Connect notebook output here. This mapper should translate raw APS/RPS records into the dashboard view model used by the React components.",
  );
}
