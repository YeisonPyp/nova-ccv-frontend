import { PatActivityPlan } from "../../services/pat/pat-activity-plan.service";
import { Area } from "../assessment/area.model";
import { Employee } from "../assessment/employee.model";
import { CostCenter } from "../cost-center/cost-center.models";

export interface PatPillar {
  id: number;
  name: string;
  description: string;
}

export interface PatStrategicProgram {
  id: number;
  name: string;
  description: string;
  year: number;
  pillar: PatPillar;
}

export interface PatPolicy {
  id: number;
  name: string;
  description: string;
}

export interface PatTacticalActivity {
  id: number;
  name: string;
  code: string;
  description: string;
}

export interface PatActivityConsolidation {
  approvedBudget: number;
  executedBudget: number;
  plannedBudget: number;
  unexecutedBudget: number;

  plannedMeasurementGoal: number;
  plannedMeasurement: number;
  executedMeasurementGoal: number;
  pendingMeasurementGoal: number;

  plannedIndicatorGoal: number;
  plannedIndicator: number;
  executedIndicatorGoal: number;
  pendingIndicatorGoal: number;
  plannedBenefitGoal: number;
  plannedBenefit: number;
  executedBenefitGoal: number;
  pendingBenefitGoal: number;
  updatedAt: string;
}

export interface PatActivity {
  id: number;
  code: string;
  name: string;
  description: string;
  program?: PatStrategicProgram;
  policy?: PatPolicy;
  startsAt: string;
  endsAt: string;
  createdAt: string;
  updatedAt: string;
  consolidation?: PatActivityConsolidation;
  pillar?: PatPillar;
  area?: Area;
  measurement?: PatMeasurement;
  measurementGoal: number;
  indicatorGoal: number;
  indicator?: PatCuantitativeIndicator;
  benefitGoal: number;
  indicatorBaseLine: number;
  benefitType?: PatBenefitType;
  benefitAmount: number;

  employee?: Employee;
  costCenter?: CostCenter;
  tacticalActivity?: PatTacticalActivity;

  executions?: PatActivityExecution[];
  plans?: PatActivityPlan[];
  budgetMatrix?: PatActivityBudgetMatrix[];
}

export interface PatActivityBudgetMatrix {
  budgetCategory: BudgetCategory;
  patActivityBudget?: PatActivityBudget;
}

export interface BudgetCategory {
  id: number;
  code: string;
  name: string;
  amount: number;
  plannedBudget: number;
  unplannedBudget: number;
  resourceType: "public" | "private";
  description: string;
}

export interface PatActivityExecution {
  id: number;
  activityId: number;
  executedBudget: number;
  executedBenefit: number;
  executedMeasurementGoal: number;
  executedIndicatorGoal: number;
  month: number;
  description: string;
  budgetExecutions?: ActivityBudgetExecution[];
  createdAt: string;
}
export interface ActivityBudgetExecution {
  id: number;
  executionId: number;
  activityId: number;
  month: number;
  amount: number;
  budgetCategory: BudgetCategory;
}

export interface PatActivityBudget {
  id: number;
  publicBudget: number;
  privateBudget: number;
  totalBudget: number;
}

export interface PatMeasurement {
  id: number;
  name: string;
  description: string;
}

export interface PatTacticalActivity {
  id: number;
  name: string;
  code: string;
  description: string;
  year: number;
}

export interface PatSpecificObjective {
  id: number;
  name: string;
  code: string;
  description: string;
  year: number;
  tacticalActivities: PatTacticalActivity[];
}

export interface PatBenefitType {
  id: number;
  name: string;
}

export interface PatStrategicObjective {
  id: number;
  name: string;
  code: string;
  planName: string;
  description?: string;
  specificObjectives?: PatSpecificObjective[];
}

export interface PatProduct {
  id: number;
  name: string;
  code: string;
  description: string;
}

export interface PatCuantitativeIndicator {
  id: number;
  name: string;
  description: string;
}

export interface PatCualitativeIndicator {
  id: number;
  name: string;
  description: string;
}
