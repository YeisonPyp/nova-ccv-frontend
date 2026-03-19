import { Employee } from "../assessment/employee.model";
import { ControlEntity } from "./control-entity.model";

export interface ImprovementPlan {
  id: number;
  name: string;
  description: string;
  controlEntityId: number;
  controlEntityName: string;
  expiresAt: string;
  correctiveActionsLength: number;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  employee?: Employee;
  controlEntity?: ControlEntity;
}

export interface CreateImprovementPlanDto {
  name: string;
  description: string;
  controlEntityId: number;
  controlEntityName: string;
  expiresAt: string;
}

export interface UpdateImprovementPlanDto {
  name?: string;
  description?: string;
  controlEntityId?: number;
  controlEntityName?: string;
  completedAt?: string;
  expiresAt?: string;
}
