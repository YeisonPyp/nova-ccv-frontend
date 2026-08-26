import { Employee } from "../assessment/employee.model";

export interface Workflow {
  id: number;
  name: string;
  description: string | null;
  stepsCount: number;
  userId: number;
  deletedAt: string | null;
  createdAt: string;
}

export interface WorkflowStep {
  id: number;
  workflowId: number;
  name: string;
  description: string | null;
  stepOrder: number;
  employeeId: number | null;
  employee: Employee | null;
}

export interface CreateWorkflowDto {
  name: string;
  description?: string;
}

export interface UpdateWorkflowDto {
  name: string;
  description?: string;
}

export interface CreateWorkflowStepDto {
  workflowId: number;
  name: string;
  description?: string;
  stepOrder: number;
  employeeId?: number | null;
}

export interface UpdateWorkflowStepDto {
  name: string;
  description?: string;
  stepOrder: number;
  employeeId?: number | null;
}
