import type { AbilityName } from "../types/dashboard";

/** Maps to academy skill categories — aligned with AbilityName labels. */
export type AssessmentCategory = AbilityName;

export type AssessmentDrill = {
  id: string;
  category: AssessmentCategory;
  equipment: string;
  assessmentName: string;
  skillFocus: string;
  description: string;
  duration: string;
  scoreUnit?: string;
};

export const ALL_ASSESSMENT_DRILLS: AssessmentDrill[] = [
  {
    id: "dribble-circuit-distraction",
    category: "Dribbling",
    equipment: "Circuit (4 GO boards + 1 gate)",
    assessmentName: "Distraction",
    skillFocus: "Decision making/Prioritization",
    description:
      "Green light, blue light, and red light. Each with different point value. The goal is to get as many as possible in 30 seconds.",
    duration: "30 seconds",
  },
  {
    id: "dribble-circuit-scan-react",
    category: "Dribbling",
    equipment: "Circuit (4 GO boards + 1 gate)",
    assessmentName: "Scan & React",
    skillFocus: "Ability to think ahead",
    description: "1 green light, 1 orange light. Green is your target and orange indicates your next target.",
    duration: "30 seconds",
  },
  {
    id: "dribble-circuit-go360",
    category: "Dribbling",
    equipment: "Circuit (4 GO boards + 1 gate)",
    assessmentName: "GO 360",
    skillFocus: "Ability to react and control",
    description: "1 green light. The goal is to hit as many as possible.",
    duration: "30 seconds",
  },
  {
    id: "vision-rox-go360",
    category: "Vision",
    equipment: "5 RoxPro (Vision wall)",
    assessmentName: "GO 360",
    skillFocus: "Reaction speed",
    description: "1 green light. The goal is to hit as many as possible.",
    duration: "30 seconds",
  },
  {
    id: "vision-rox-large-small",
    category: "Vision",
    equipment: "5 RoxPro (Vision wall)",
    assessmentName: "Large to Small",
    skillFocus: "Information processing speed",
    description:
      "Numbers between 0–9 appear on the wall. You must hit from the largest number to the smallest number in order. Repeat as many cycles as you can.",
    duration: "30 seconds",
  },
  {
    id: "vision-rox-balance",
    category: "Vision",
    equipment: "5 RoxPro (Vision wall)",
    assessmentName: "Balance Reaction",
    skillFocus: "Ability to focus on two things at once",
    description:
      "Balance one RoxPro in one hand, react to green light with your other hand. Must keep the RoxPro balanced while chasing the light. Scores are calculated with number of hits minus number of drops.",
    duration: "30 seconds",
  },
  {
    id: "pass-iconq-passfind2",
    category: "Passing",
    equipment: "ICON Q (half arc)",
    assessmentName: "Pass Find 2",
    skillFocus: "Passing technique and accuracy",
    description: "2 blue lights. Hit as many as possible.",
    duration: "30 seconds",
  },
  {
    id: "pass-icon4m-vision",
    category: "Passing",
    equipment: "ICON 4M (gray large circ.)",
    assessmentName: "Vision",
    skillFocus: "Passing technique and thinking ahead",
    description: "1 blue light, 1 yellow light. Blue is your target and yellow indicates your next target.",
    duration: "30 seconds",
  },
  {
    id: "pass-iconv2-maestro",
    category: "Passing",
    equipment: "ICON V2 (large black)",
    assessmentName: "Maestro",
    skillFocus: "Passing technique and awareness",
    description:
      "2 green lights (3 pts), 2 blue lights (1 pt), and red light (-1 pt). The goal is to get as many as possible in 30 seconds.",
    duration: "30 seconds",
  },
  {
    id: "agility-3rox-5105",
    category: "Agility",
    equipment: "3 RoxPro",
    assessmentName: "5-10-5 shuttles",
    skillFocus: "Agility",
    description:
      "3 cones 5 yards apart in a horizontal line. Athlete starts at the middle cone then runs to the right cone, cuts at the cone and runs the full length to the left side cone, cuts again to finish at the middle cone.",
    duration: "seconds",
    scoreUnit: "sec",
  },
  {
    id: "agility-3rox-10dash",
    category: "Agility",
    equipment: "3 RoxPro",
    assessmentName: "10 yrd dash",
    skillFocus: "Speed",
    description: "10 yard dash.",
    duration: "seconds",
    scoreUnit: "sec",
  },
  {
    id: "ft-techtouch-air",
    category: "First Touch",
    equipment: "TechTouch",
    assessmentName: "First touch air",
    skillFocus: "First touch ball control",
    description:
      "2 touch maximum to settle the ball out of the air in 4'x4' box, 4 right foot, 4 left foot, speed 3, Loft, Center, 5 seconds between.",
    duration: "8 balls",
    scoreUnit: "/8",
  },
  {
    id: "ft-techtouch-bounce",
    category: "First Touch",
    equipment: "TechTouch",
    assessmentName: "First touch bouncing",
    skillFocus: "First touch ball control",
    description:
      "2 touch maximum to settle the bouncing ball in 4'x4' box, 4 right foot, 4 left foot, speed 2, Air, Center, 5 seconds between.",
    duration: "8 balls",
    scoreUnit: "/8",
  },
];

export const ASSESSMENT_CATEGORY_ORDER: AssessmentCategory[] = [
  "Dribbling",
  "Vision",
  "Passing",
  "Agility",
  "First Touch",
];

export function equipmentForCategory(category: AssessmentCategory): string[] {
  const seen = new Set<string>();
  for (const d of ALL_ASSESSMENT_DRILLS) {
    if (d.category === category) seen.add(d.equipment);
  }
  return [...seen];
}

export function drillsForCategoryAndEquipment(
  category: AssessmentCategory,
  equipment: string,
): AssessmentDrill[] {
  return ALL_ASSESSMENT_DRILLS.filter((d) => d.category === category && d.equipment === equipment);
}

export function getDrillById(id: string): AssessmentDrill | undefined {
  return ALL_ASSESSMENT_DRILLS.find((d) => d.id === id);
}
