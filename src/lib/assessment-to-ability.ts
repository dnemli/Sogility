/**
 * Maps `category` + `drill` to one of five abilities (notebook `skill_map` + CSV-aligned keys).
 * Jumps / shuttles → Agility so the UI always exposes exactly five abilities.
 */
import type { AbilityName } from "../types/dashboard";

export const ABILITY_ORDER: AbilityName[] = ["Dribbling", "Passing", "Vision", "Agility", "First Touch"];

/** Notebook-style key: "{category} {drill}" */
export function categoryDrillAssessmentKey(category: string, drill: string): string {
  return `${category.trim()} ${drill.trim()}`.trim();
}

const MAP: Record<string, AbilityName> = {
  // Dribbling (technical / ICON / circuit skill)
  "Circuit Training Knockout": "Dribbling",
  "Circuit Training Knockout-Obstacle": "Dribbling",
  "Circuit Training Maestro": "Dribbling",
  "Circuit Training Vision": "Dribbling",
  "Fast Feet Architect": "Dribbling",
  "Fast Feet Maestro": "Dribbling",
  "Fast Feet Vision": "Dribbling",
  "ICON 4M Architect": "Dribbling",
  "ICON 4M Maestro": "Dribbling",
  "ICON 4M Vision": "Dribbling",
  "ICON V2 Architect": "Dribbling",
  "ICON V2 Maestro": "Dribbling",
  "ICON V2 Vision": "Dribbling",
  "ICON Q Pass Find 2": "Dribbling",
  // Passing
  "Circuit Training Pass Find 1": "Passing",
  "Tech Touch One Touch Pass Pass 10 Air": "Passing",
  "Tech Touch One Touch Pass Pass 10 Ground": "Passing",
  // First Touch
  "Tech Touch Ground & Tech Touch Air Receive 10 Air": "First Touch",
  "Tech Touch Ground & Tech Touch Air Receive 10 Ground": "First Touch",
  // Vision
  "Reflexion Edge Hand Eye Coordination": "Vision",
  "Reflexion Edge Reaction Time": "Vision",
  "Reflexion Edge Tracking": "Vision",
  "Reflexion Edge Inhibition": "Vision",
  "Reflexion Edge Prioritization": "Vision",
  // Agility / speed / power
  "Freelap 10yd Dash": "Agility",
  "Freelap 20yd Dash": "Agility",
  "Freelap 10yd Dash Ball": "Agility",
  "Freelap 20yd Dash Ball": "Agility",
  "Vertical Jump Vertical": "Agility",
  "Broad Jump Horizontal": "Agility",
  "Broad Jump 5-10-5 Shuttles": "Agility",
};

export function mapAssessmentToAbility(category: string, drill: string): AbilityName | null {
  const key = categoryDrillAssessmentKey(category, drill);
  return MAP[key] ?? null;
}

/** Assessment keys (category + drill label) that contribute to an ability — for empty-state guidance. */
export function assessmentLabelsForAbility(ability: AbilityName): string[] {
  return Object.entries(MAP)
    .filter(([, a]) => a === ability)
    .map(([label]) => label)
    .sort((a, b) => a.localeCompare(b));
}
