import { Employee } from "../assessment/employee.model";
import { WorkflowStep } from "./workflow.model";

export type StepStatus = "onhold" | "pending" | "approved" | "rejected";

export interface FilingStepApproval {
  id: number;
  filingWorkflowId: number;
  stepId: number;
  status: StepStatus;
  review: string | null;
  stepOrder: number;
  approvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  publisher: Employee | null;
  step: WorkflowStep;
}

export interface FilingWorkflow {
  id: number;
  filingId: number;
  workflowId: number;
  startedAt: string;
  completedAt: string | null;
  alertTimeInterval: string | null;
  steps: FilingStepApproval[];
}
