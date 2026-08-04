import { Area } from '../assessment/area.model';
import { Employee } from '../assessment/employee.model';
import { CostCenter } from '../cost-center/cost-center.models';

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

export interface PatStrategicObjective {
  id: number;
  name: string;
  code: string;
  planName: string;
  description?: string;
  specificObjectives?: PatSpecificObjective[];
}

export interface PatBenefitType {
  id: number;
  name: string;
}

export interface PatActivity {
  id: number;
  code: string;
  name: string;
  year: number;
  description?: string;
  measurement: string;
  measurementGoal?: number;
  program?: PatStrategicProgram;
  policy?: PatPolicy;
  pillar?: PatPillar;
  area?: Area;
  employee?: Employee;
  costCenter?: CostCenter;
  tacticalActivity?: PatTacticalActivity;
  startsAt: string;
  endsAt: string;
  createdAt: string;
  updatedAt: string;

  approvedBudget?: number;
  executedBudget?: number;

  executions?: PatActivityExecution[];
  budgetMatrix?: PatActivityBudgetMatrix[];
}

export interface PatActivityBudgetMatrix {
  budgetCategory: BudgetCategory;
  budget?: BudgetAmount;
}

export interface BudgetCategory {
  id: number;
  code: string;
  name: string;
  amount: number;
  plannedBudget: number;
  unplannedBudget: number;
  resourceType: 'public' | 'private';
  description: string;
}

export interface BudgetAmount {
  id: number;
  amount: number;
}

export interface PatActivityExecution {
  id: number;
  activityId: number;
  executedBudget: number;
  month: number;
  description?: string;
  budgetExecutions?: ActivityBudgetExecution[];
  createdAt: string;
}

export interface ActivityBudgetExecution {
  id: number;
  executionId: number;
  amount: number;
  budgetCategory: BudgetCategory;
}

// ─── Indicadores por actividad (con planeación/ejecución mensual) ─────────

export interface PatActivityIndicator {
  id: number;
  activityId: number;
  name: string;
  description?: string;
  unitMeasure?: string;
  targetValue: number;
  createdAt: string;
}

export interface PatActivityIndicatorMonthlyPlan {
  id: number;
  indicatorId: number;
  month: number;
  plannedValue: number;
}

export interface PatActivityIndicatorExecution {
  id: number;
  indicatorId: number;
  month: number;
  executedValue: number;
  description?: string;
  createdAt: string;
}

// ─── Productos por actividad (con planeación/ejecución mensual) ──────────

export interface PatActivityProduct {
  id: number;
  activityId: number;
  code: string;
  name: string;
  description?: string;
  targetQuantity: number;
  unitMeasure: string;
  createdAt: string;
}

export interface PatActivityProductMonthlyPlan {
  id: number;
  productId: number;
  month: number;
  plannedQuantity: number;
}

export interface PatActivityProductExecution {
  id: number;
  productId: number;
  month: number;
  executedQuantity: number;
  description?: string;
  createdAt: string;
}

// ─── Beneficios/beneficiarios por actividad (con planeación/ejecución mensual) ─

export interface PatActivityBenefit {
  id: number;
  activityId: number;
  benefitTypeId: number;
  benefitTypeName: string;
  targetValue: number;
  createdAt: string;
}

export interface PatActivityBenefitMonthlyPlan {
  id: number;
  benefitId: number;
  month: number;
  plannedValue: number;
}

export interface PatActivityBenefitExecution {
  id: number;
  benefitId: number;
  month: number;
  executedValue: number;
  description?: string;
  createdAt: string;
}

