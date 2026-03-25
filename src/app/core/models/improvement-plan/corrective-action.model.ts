import { Employee } from "../assessment/employee.model";
import { EvidenceDto } from "./evidence.model";

export interface CorrectiveActionDto {
  id: number;
  name: string;
  description: string;
  status: string;
  followUp: string;
  progress: number;
  createdAt: string;
  updatedAt: string;
  parentId: number;
  childLength: number;
  employee?: Employee;
  evidences?: EvidenceDto[];
}

export interface CreateCorrectiveActionDto {
  improvementPlanId: number;
  expiresAt: string;
  name: string;
  description?: string;
  parentId?: number;
  employeeId?: number;
  status?: string;
  followUp?: string;
  progress?: number;
}

export interface UpdateCorrectiveActionDto {
  name?: string;
  description?: string;
  parentId?: number;
  employeeId?: number;
  status?: string;
  followUp?: string;
  progress?: number;
}
