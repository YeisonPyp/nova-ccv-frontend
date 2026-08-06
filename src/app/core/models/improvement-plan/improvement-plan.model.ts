import { Employee } from '../assessment/employee.model';
import { ControlEntity } from './control-entity.model';
import { ImprovementProcess } from './improvement-process.model';

export interface ActionStatusCount {
  status: string;
  count: number;
}

/** Effective action status: raw status, or OVERDUE when a follow-up lags 30% past its interval. */
export const actionEffectiveStatusLabels: Record<string, string> = {
  PENDING: 'Pendiente',
  RUNNING: 'En ejecución',
  COMPLETED: 'Completada',
  OVERDUE: 'Vencida',
};

export interface ImprovementPlan {
  id: number;
  name: string;
  description: string;
  status: string;
  controlEntityId: number;
  controlEntityName: string;
  expiresAt: string;
  completedAt?: string;
  startsAt: string;
  createdAt: string;
  updatedAt: string;
  employee?: Employee;
  controlEntity?: ControlEntity;
  process?: ImprovementProcess;
  actionStatusCounts?: ActionStatusCount[];

  permissions?: Array<string>;
}

export interface CreateImprovementPlanDto {
  name: string;
  description: string;
  controlEntityId: number;
  processId: number;
  employeeId: number;
  startsAt: string;
  expiresAt: string;
}

export interface UpdateImprovementPlanDto {
  name?: string;
  description?: string;
  controlEntityId?: number;
  controlEntityName?: string;
  processId?: number;
  employeeId?: number;
  completedAt?: string;
  expiresAt?: string;
}

export interface ImprovementPlanFilters {
  processId?: number;
  controlEntityId?: number;
  status?: string;
  year?: number;
}
