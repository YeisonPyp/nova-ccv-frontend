import { GoalType } from "./goal-type.model";

export interface Goal {
  id: number;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  weight: number;
  isAscending: boolean;
  deviation: number;
  goalType: GoalType;
}

export interface CreateGoalFromTemplate {
  templateId: number;
  description: string;
  deviation: number;
  targetValue: number;
  title: string;
  weight: number;
  patProgramId?: number;
  vars: Record<string, string>;
}
