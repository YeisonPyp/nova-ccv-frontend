import { Position } from "../assessment/position.model";
import { CostCenter } from "../cost-center/cost-center.models";

export interface ContractManagementPlan {
  id: string;
  statusName: string;
  statusId: number;
  position: Position;
  task: string;
  patTaskId: number | null;
  costCenter: CostCenter;
  processType: string;
  contractTypeId: string;
  contractTypeName: string;
  contractsAmount: number;
  unitCost: number;
  months: number;
  year: number;
  createdAt: string;
}

export interface ContractManagementExecutionPlan {
  id: string;
  planId: string;
  taskId: number;
  taskName: string;
  month: number;
  amount: number;
  scheduledTaskId: number | null;
  createdAt: string;
}

export interface CreateContractManagementExecutionPlanDto {
  taskId: number;
  month: number;
  amount: number;
}

export interface ContractManagementSeedResult {
  createdPlans: number;
  createdExecutions: number;
  errors: string[];
}

export interface ContractManagementNotificationConfig {
  id: string;
  daysBeforeEnd: number;
  alertTime: string;
  timeZone: string;
  templateName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateContractManagementNotificationConfigDto {
  daysBeforeEnd: number;
  alertTime: string;
  timeZone: string;
  templateName: string;
  isActive?: boolean;
}

export interface UpdateContractManagementNotificationConfigDto {
  daysBeforeEnd?: number;
  alertTime?: string;
  timeZone?: string;
  templateName?: string;
  isActive?: boolean;
}
