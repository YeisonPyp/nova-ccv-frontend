export interface AreaBudgetSummary {
  areaId: number;
  areaName: string;
  approvedBudget: number;
  plannedBudget: number;
  unplannedBudget: number;
}

export interface ActivityBudgetMonthly {
  activityId: number;
  activityName: string;
  areaId: number;
  areaName: string;
  month: number;
  approvedBudgetTotal: number;
  executedBudgetTotal: number;
  monthlyPlannedBudget: number;
  monthlyExecutedBudget: number;
}

export interface ActivityIndicatorMonthly {
  indicatorId: number;
  activityId: number;
  indicatorName: string;
  targetValue: number;
  month: number;
  plannedValue: number;
  executedValue: number;
}

export interface ActivityProductMonthly {
  productId: number;
  activityId: number;
  productName: string;
  unitMeasure: string | null;
  targetQuantity: number;
  month: number;
  plannedQuantity: number;
  executedQuantity: number;
}

export interface ActivityBenefitMonthly {
  benefitId: number;
  activityId: number;
  benefitTypeName: string;
  targetValue: number;
  month: number;
  plannedValue: number;
  executedValue: number;
}

export interface MonthlyBudgetTotals {
  month: number;
  plannedBudget: number;
  executedBudget: number;
}

export interface PatActivityReportResponse {
  budget: ActivityBudgetMonthly[];
  indicators: ActivityIndicatorMonthly[];
  products: ActivityProductMonthly[];
  benefits: ActivityBenefitMonthly[];
}
