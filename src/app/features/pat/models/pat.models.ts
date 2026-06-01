// pat/models/pat.models.ts
export type ProgramStatus = "DRAFT" | "APPROVED" | "IN_PROGRESS" | "CLOSED";
export type GoalLinkType = "OBJECTIVE" | "PROJECT" | "SUBACTIVITY";
export type IndicatorType = "QUANTITY" | "PERCENTAGE" | "BINARY" | "CURRENCY";
export type TrainingStatus =
  | "REGISTERED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "ABSENT";

// ─── Programa / PAT ───────────────────────────────────────────
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
  objective: string | null;
  pillar: string | null;
  beneficiaries: string | null;
  year: number;
  plannedBudget: number;
  executedBudget: number;
  budgetRubric: string | null;
  accountingPlan: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProgramWithMetrics extends Program {
  activitiesCount: number;
  goalAchievedPct: number;
  budgetExecutedPct: number;
  strategicGoalsLinked: number;
  indicatorsCount: number;
}

export interface CreateProgramPayload {
  code: string;
  name: string;
  areaId: number;
  employeeId: number;
  costCenterId: number;
  status: ProgramStatus;
  objective: string | null;
  pillar: string | null;
  beneficiaries: string | null;
  year: number;
  budgetRubric?: string | null;
  accountingPlan?: string | null;
}

// ─── Actividades ──────────────────────────────────────────────
export interface Activity {
  id: number;
  programId: number;
  code: string;
  name: string;
  responsibleId: number;
  responsibleName: string;
  costCenterId: number;
  budgetRubric: string | null;
  accountingPlan: string | null;
  goalTotal: number;
  goalUnit: string;
  plannedBudget: number;
  startMonth: number;
  endMonth: number;
  subactivities?: Subactivity[];
}

export interface Subactivity {
  id: number;
  activityId: number;
  name: string;
  responsibleId: number;
  responsibleName: string;
  plannedBudget: number;
  costCenterId: number;
  budgetRubric: string | null;
  accountingPlan: string | null;
  startMonth: number;
  endMonth: number;
}

export interface ActivityWithMetrics extends Activity {
  executedGoal: number;
  executedBudget: number;
  goalAchievedPct: number;
  budgetExecutedPct: number;
}

// ─── Metas Estratégicas ───────────────────────────────────────
export interface StrategicGoal {
  id: number;
  code: string;
  name: string;
  description: string | null;
  pillar: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  year: number;
  areaId: number;
  areaName: string;
}

export interface GoalLink {
  id: number;
  strategicGoalId: number;
  strategicGoalName: string;
  linkType: GoalLinkType;
  programId?: number;
  activityId?: number;
  weight: number; // porcentaje de aporte 0-100
}

// ─── Indicadores de Desempeño ─────────────────────────────────
export interface PerformanceIndicator {
  id: number;
  code: string;
  name: string;
  description: string | null;
  type: IndicatorType;
  unit: string;
  baseline: number;
  target: number;
  currentValue: number;
  weight: number;
  programId: number | null;
  activityId: number | null;
  areaId: number;
  areaName: string;
  year: number;
  achievedPct: number;
}

export interface CreateIndicatorPayload {
  code: string;
  name: string;
  description?: string;
  type: IndicatorType;
  unit: string;
  baseline: number;
  target: number;
  weight: number;
  programId?: number;
  activityId?: number;
  areaId: number;
  year: number;
}

// ─── Área Consolidada ─────────────────────────────────────────
export interface AreaConsolidation {
  areaId: number;
  areaName: string;
  programsCount: number;
  activitiesCount: number;
  goalAchievedPct: number;
  budgetPlanned: number;
  budgetExecuted: number;
  budgetExecutedPct: number;
  strategicImpactScore: number; // 0-100
  indicatorsOnTarget: number;
  indicatorsTotal: number;
}

// ─── Capacitaciones ───────────────────────────────────────────
export interface TrainingPlan {
  id: number;
  year: number;
  areaId: number;
  areaName: string;
  totalHours: number;
  completedHours: number;
  completionPct: number;
  trainings: Training[];
}

export interface Training {
  id: number;
  planId: number;
  name: string;
  category: string;
  scheduledDate: string;
  durationHours: number;
  provider: string | null;
  status: TrainingStatus;
  participants: TrainingParticipant[];
}

export interface TrainingParticipant {
  id: number;
  trainingId: number;
  employeeId: number;
  employeeName: string;
  status: TrainingStatus;
  completionDate: string | null;
  evidenceUrl: string | null;
  evidenceFileName: string | null;
  score: number | null;
}

export interface EmployeeTrainingStats {
  employeeId: number;
  employeeName: string;
  areaName: string;
  plannedTrainings: number;
  completedTrainings: number;
  totalHoursPlanned: number;
  totalHoursCompleted: number;
  completionPct: number;
  pendingEvidences: number;
}

export interface UploadEvidencePayload {
  participantId: number;
  file: File;
  completionDate: string;
  score?: number;
}

// ─── Presupuesto ──────────────────────────────────────────────
export interface BudgetItem {
  id: number;
  programId: number;
  activityId: number | null;
  activityName: string | null;
  costCenterId: number;
  costCenterName: string;
  budgetRubric: string;
  accountingPlan: string;
  planned: number;
  committed: number;
  executed: number;
  available: number;
}

export interface BudgetSummary {
  totalPlanned: number;
  totalCommitted: number;
  totalExecuted: number;
  totalAvailable: number;
  executionPct: number;
  byRubric: BudgetByRubric[];
}

export interface BudgetByRubric {
  rubric: string;
  planned: number;
  executed: number;
  pct: number;
}

// ─── Ejecución ────────────────────────────────────────────────
export interface ExecutionRecord {
  id: number;
  activityId: number;
  activityName: string;
  month: number;
  executedGoal: number;
  plannedGoal: number;
  executedAmount: number;
  notes: string | null;
  createdAt: string;
}

export interface CreateExecutionPayload {
  activityId: number;
  month: number;
  executedGoal: number;
  executedAmount: number;
  notes?: string;
}

export interface ScheduleRow {
  activityId: number;
  activityName: string;
  month: number;
  monthName: string;
  plannedGoal: number;
  executedGoal: number;
  plannedBudget: number;
  executedBudget: number;
}

// ─── Dashboard ────────────────────────────────────────────────
export interface DashboardStats {
  totalPrograms: number;
  activePrograms: number;
  totalBudgetPlanned: number;
  totalBudgetExecuted: number;
  budgetExecutionPct: number;
  overallGoalPct: number;
  strategicGoalsCount: number;
  strategicGoalsOnTrack: number;
  trainingsCompletionPct: number;
  areasConsolidated: number;
}

// ─── Reportes ─────────────────────────────────────────────────
export type ReportType =
  | "BOARD_SUMMARY"
  | "SUPERSOCIEDADES"
  | "BUDGET_EXECUTION"
  | "TRAINING_COMPLIANCE"
  | "AREA_CONSOLIDATION"
  | "STRATEGIC_GOALS";

export interface ReportConfig {
  type: ReportType;
  year: number;
  areaId?: number;
  programId?: number;
  format: "PDF" | "EXCEL" | "CSV";
  includeCharts?: boolean;
}

export interface ReportResult {
  id: string;
  type: ReportType;
  generatedAt: string;
  downloadUrl: string;
  fileName: string;
  format: "PDF" | "EXCEL" | "CSV";
}
