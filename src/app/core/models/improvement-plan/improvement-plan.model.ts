import { Employee } from '../assessment/employee.model';
import { ControlEntity } from './control-entity.model';

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

  permissions?: Array<string>;
}

export interface CreateImprovementPlanDto {
  name: string;
  description: string;
  controlEntityId: number;
  employeeId: number;
  startsAt: string;
  expiresAt: string;
}

export interface UpdateImprovementPlanDto {
  name?: string;
  description?: string;
  controlEntityId?: number;
  controlEntityName?: string;
  employeeId?: number;
  completedAt?: string;
  expiresAt?: string;
}
