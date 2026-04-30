export type ProgramStatus = "DRAFT" | "APPROVED" | "IN_PROGRESS" | "CLOSED";
export type AuditAction = "CREATE" | "UPDATE" | "DELETE";

export interface Program {
  id: number;
  code: string;
  name: string;
  areaId: number;
  areaName: string;
  employeeId: number;
  employeeName: string;
  costCenterId: number;
  costCenterName: string;
  status: ProgramStatus;
  objective?: string;
  pillar?: string;
  beneficiaries?: string;
  year: number;
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  id: number;
  programId: number;
  name: string;
  measurement: string;
  goalTotal: number;
  displayOrder: number;
}

export interface BudgetItem {
  id: number;
  activityId: number;
  category: string;
  planned: number;
  executed: number;
}

export interface MonthlyExecution {
  id: number;
  activityId: number;
  month: number;
  monthName: string;
  executedGoal: number;
  executedAmount: number;
  notes?: string;
  registeredBy?: string;
  createdAt: string;
}

export interface MonthlyPlan {
  id: number;
  activityId: number;
  month: number;
  plannedGoal: number;
  plannedAmount: number;
}

export interface AuditLog {
  id: number;
  entity: string;
  entityId: number;
  action: AuditAction;
  user: string;
  date: string;
  previousValue: any;
  newValue: any;
}

export interface ProgramWithMetrics extends Program {
  goalAchievedPct: number;
  budgetExecutedPct: number;
  plannedBudget: number;
  executedBudget: number;
  goalTotal: number;
  executedGoal: number;
}

export interface ActivityWithMetrics extends Activity {
  executedGoal: number;
  progressPct: number;
  plannedBudget: number;
  executedBudget: number;
}

export interface DashboardStats {
  totalPrograms: number;
  activePrograms: number;
  atRiskPrograms: number;
  globalGoalProgress: number;
  globalBudgetExecution: number;
  totalBudget: number;
  executedBudget: number;
}

export interface ScheduleRow {
  month: number;
  monthName: string;
  plannedGoal: number;
  executedGoal: number;
  plannedAmount: number;
  executedAmount: number;
}

export interface ExecutionFormData {
  activityId: number;
  month: number;
  executedGoal: number;
  executedAmount: number;
  notes: string;
}

export interface MenuNode {
  label: string;
  icon?: string;
  route?: string;
  external?: boolean;
  expanded?: boolean;
  children?: MenuNode[];
  target?: "_blank" | "_self" | "_parent" | "_top";
}
