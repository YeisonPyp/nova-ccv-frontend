/**
 * Kind of monthly planning a PAT task holds. Each one owns its own scheduled
 * task topic, so its reminder can be tuned (or turned off) independently.
 */
export type PatPlanningType =
  | 'BUDGET'
  | 'MANAGEMENT_INDICATOR'
  | 'PRODUCT'
  | 'BENEFIT';

export const PAT_PLANNING_TYPE_LABELS: Record<PatPlanningType, string> = {
  BUDGET: 'Presupuesto',
  MANAGEMENT_INDICATOR: 'Indicadores de gestión',
  PRODUCT: 'Productos',
  BENEFIT: 'Beneficiarios',
};

export interface PatPlanningNotificationConfig {
  id: string;
  planningType: PatPlanningType;
  topic: string;
  /** Days before the planned month ends at which the reminder is sent. */
  daysBeforeEnd: number;
  alertTime: string;
  timeZone: string;
  templateName: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdatePatPlanningNotificationConfigDto {
  daysBeforeEnd?: number;
  alertTime?: string;
  timeZone?: string;
  templateName?: string;
  isActive?: boolean;
}
