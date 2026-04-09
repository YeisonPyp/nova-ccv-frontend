import { GoalType } from "./goal-type.model";
import { GoalVar } from "./goal-var.model";

export interface GoalTemplate {
  id: number;
  name: string;
  goalType: GoalType;
  vars: GoalVar[];
}
