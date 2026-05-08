export type StepStatus = "pending" | "approved" | "rejected";

export interface FilingStepApproval {
  id: number;
  filingWorkflowId: number;
  stepId: number;
  reviewerId: number | null;
  publisherId: number | null;
  status: StepStatus;
  review: string | null;
  stepOrder: number;
  approvedAt: string | null;
  createdAt: string;
  updatedAt: string;
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
