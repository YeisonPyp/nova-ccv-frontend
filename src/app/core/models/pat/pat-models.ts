import { Area } from '../assessment/area.model';
import { CostCenter } from '../cost-center/cost-center.models';

export interface PatPillar {
  id: number;
  name: string;
  description: string;
}

export interface PatAdenda {
  id: number;
  name: string;
  year?: number;
}

export interface PatAdendaContext {
  id: number;
  year: number;
  name: string;
  programPrefix: string;
}

export interface PatUnitMeasure {
  id: number;
  name: string;
}

export interface PatManagementIndicator {
  id: number;
  name: string;
  description?: string;
}

export interface PatProduct {
  id: number;
  name: string;
  description?: string;
}

export interface PatStrategicProgram {
  id: number;
  year: number;
  startsAt: string;
  endsAt: string;
  description?: string;
}

export interface PatStrategicProgramBudgetLine {
  id: string;
  programId: number;
  categoryId: number;
  categoryCode?: string;
  categoryName: string;
  resourceType?: string;
  previousVigencyBalance: number;
  budgetedAmount: number;
  q1Executed: number;
  q2Executed: number;
  q3Executed: number;
  q4Executed: number;
}

export interface PatStrategicProgramBenefitQuarterly {
  id: string;
  programId: number;
  benefitTypeId: number;
  benefitTypeName: string;
  targetValue: number;
  q1Executed: number;
  q2Executed: number;
  q3Executed: number;
  q4Executed: number;
}

export interface PatStrategicProgramDetail {
  program: PatStrategicProgram;
  budgetLines: PatStrategicProgramBudgetLine[];
  benefits: PatStrategicProgramBenefitQuarterly[];
}

export interface PatAdendaProgramSummary {
  id: string;
  programId: number;
  description?: string;
  adendaId: number;
  year: number;
  adendaName: string;
  contextId?: number;
  contextName?: string;
  unitMeasureId?: number;
  unitMeasureName?: string;
  unitMeasureGoal: number;
  programCode: string;
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

// ─── Actividad (formulación anual de una actividad táctica) ──────────────

export interface PatActivity {
  id: number;
  code?: string;
  name: string;
  year: number;
  description?: string;
  unitMeasure?: PatUnitMeasure;
  unitMeasureGoal?: number;
  tacticalActivity?: PatTacticalActivity;
  startsAt: string;
  endsAt: string;
  createdAt: string;
  updatedAt: string;

  approvedBudget?: number;
  executedBudget?: number;

  tasks?: PatActivityTask[];
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

// ─── Actividad a desarrollar ("tarea") ────────────────────────────────────

export interface PatActivityTask {
  id: number;
  activityId: number;
  activityName?: string;
  activityYear?: number;
  name: string;
  area: Area;
  costCenter: CostCenter;
  pillar?: PatPillar;
  program?: PatStrategicProgram;
  activityProduct?: PatActivityProduct;
  policy?: PatPolicy;
  adenda?: PatAdenda;
  description?: string;
  createdAt: string;
}

export interface PatActivityTaskBudgetPlan {
  id: number;
  taskId: number;
  presupuestalCategory: BudgetCategory;
  month: number;
  plannedAmount: number;
  createdAt: string;
}

export interface PatActivityTaskBudgetExecution {
  id: number;
  taskId: number;
  presupuestalCategory: BudgetCategory;
  month: number;
  amount: number;
  description?: string;
  createdAt: string;
}

export interface PatActivityTaskIndicatorMonthlyPlan {
  id: number;
  taskId: number;
  activityIndicatorId: number;
  month: number;
  plannedValue: number;
  createdAt: string;
}

export interface PatActivityTaskIndicatorExecution {
  id: number;
  taskId: number;
  activityIndicatorId: number;
  month: number;
  executedValue: number;
  description?: string;
  createdAt: string;
}

export interface PatActivityTaskProductMonthlyPlan {
  id: number;
  taskId: number;
  productId: number;
  month: number;
  plannedQuantity: number;
  createdAt: string;
}

export interface PatActivityTaskProductExecution {
  id: number;
  taskId: number;
  productId: number;
  month: number;
  executedQuantity: number;
  description?: string;
  createdAt: string;
}

export interface PatActivityTaskBenefitMonthlyPlan {
  id: number;
  taskId: number;
  benefitId: number;
  month: number;
  plannedValue: number;
  createdAt: string;
}

export interface PatActivityTaskBenefitExecution {
  id: number;
  taskId: number;
  benefitId: number;
  month: number;
  executedValue: number;
  description?: string;
  createdAt: string;
}

// ─── Indicadores de gestión por actividad (catálogo + línea base/meta) ────

export interface PatActivityIndicator {
  id: number;
  activityId: number;
  managementIndicator: PatManagementIndicator;
  baseValue: number;
  goalValue: number;
  createdAt: string;
}

// ─── Productos por actividad (catálogo; planeación/ejecución mensual vive
// ahora por tarea, ver ExecutionOrPlaningProduct) ──────────────────────────

export interface PatActivityProduct {
  id: number;
  activityId: number;
  product: PatProduct;
  targetQuantity: number;
  createdAt: string;
}

// ─── Impactos/beneficiarios por actividad (catálogo; planeación/ejecución
// mensual vive ahora por tarea, ver ExecutionOrPlaningBenefit) ─────────────

export interface PatActivityBenefit {
  id: number;
  activityId: number;
  benefitTypeId: number;
  benefitTypeName: string;
  targetValue: number;
  createdAt: string;
}

export interface ExecutionOrPlaningBudget {
  budget: BudgetCategory;
  planning?: BudgetAmount;
  execution?: BudgetAmount;
  availableForPlanning?: number;
  availableForExecution?: number;
}

export interface ExecutionOrPlaningProduct {
  product: PatProduct;
  targetQuantity?: number;
  planning?: BudgetAmount;
  execution?: BudgetAmount;
}

export interface ExecutionOrPlaningBenefit {
  benefit: PatActivityBenefit;
  planning?: BudgetAmount;
  execution?: BudgetAmount;
}

export interface ExecutionOrPlaningIndicator {
  indicator: PatActivityIndicator;
  planning?: BudgetAmount;
  execution?: BudgetAmount;
}

export interface ExecutionOrPlaning {
  month: number;
  budgets: ExecutionOrPlaningBudget[];
  products: ExecutionOrPlaningProduct[];
  benefits: ExecutionOrPlaningBenefit[];
  indicators: ExecutionOrPlaningIndicator[];
}

export interface RegisterMonthlyOverviewPage {
  task: PatActivityTask;
  overview: ExecutionOrPlaning;
}

export type PatRegisterMode = 'PLAN' | 'EXECUTION';

export interface RegisterMonthlyOverview {
  month: number;
  mode: PatRegisterMode;
  budgets: { presupuestalCategoryId: number; amount: number }[];
  products: { productId: number; quantity: number }[];
  benefits: { benefitId: number; value: number }[];
  indicators: { activityIndicatorId: number; value: number }[];
}
