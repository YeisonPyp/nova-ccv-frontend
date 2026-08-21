import { PageableQuery } from '@/app/shared/pageable-query';

/** Kind of measurable a PAT task tracks month to month. */
export type PatIndicatorType = 'PRODUCT' | 'MANAGEMENT' | 'IMPACT';

export const PAT_INDICATOR_TYPE_LABELS: Record<PatIndicatorType, string> = {
  PRODUCT: 'Producto',
  MANAGEMENT: 'Gestión',
  IMPACT: 'Impacto',
};

/** Chip/bar colors per type, matching the dashboard legend. */
export const PAT_INDICATOR_TYPE_CLASSES: Record<PatIndicatorType, string> = {
  PRODUCT: 'bg-amber-100 text-amber-800',
  MANAGEMENT: 'bg-pink-100 text-pink-800',
  IMPACT: 'bg-violet-100 text-violet-800',
};

export interface PatDashboardIndicator {
  id: string;
  type: PatIndicatorType;
  name: string;
  taskId: number;
  taskName: string;
  activityId: number;
  activityName: string;
  tacticalActivityId: number;
  areaId: number;
  programId?: number | null;
  year: number;
  targetValue: number;
  plannedValue: number;
  executedValue: number;
  /** Null when nothing was planned, so the UI can say so instead of "0%". */
  progressPct: number | null;
}

export interface PatDashboardBudgetMonth {
  month: number;
  planned: number;
  executed: number;
}

export interface PatDashboardBudget {
  totalPlanned: number;
  totalExecuted: number;
  monthly: PatDashboardBudgetMonth[];
}

/** Filters every dashboard section shares. */
export interface PatDashboardFilters extends PageableQuery {
  year?: number | null;
  areaId?: number | null;
  programId?: number | null;
  taskIds?: number[];
}
