import { Position } from "../assessment/position.model";
import { CostCenter } from "../cost-center/cost-center.models";
import { PatActivityTask } from "../pat/pat-models";
import { Contract } from "./contract.models";

export type ContractManagementExecutionStatus = "PENDING" | "MADE";

export interface ContractManagementPlan {
  id: string;
  statusName: string;
  statusId: number;
  position: Position;
  areaId: number | null;
  areaName: string | null;
  task: string;
  patTaskId: PatActivityTask | null;
  costCenter: CostCenter;
  processType: string;
  contractTypeId: string;
  contractTypeName: string;
  contractsAmount: number;
  unitCost: number;
  months: number;
  year: number;
  index: number | null;
  budgetCategoryId: number | null;
  budgetCategoryName: string | null;
  createdAt: string;
}

export interface CreateContractManagementPlanDto {
  statusName: string;
  positionId: number;
  areaId: number;
  patTaskId?: number | null;
  task: string;
  costCenterId: number;
  processType: string;
  budgetCategoryId: number;
  contractsAmount: number;
  unitCost: number;
  months: number;
  year: number;
}

export interface UpdateContractManagementPlanDto {
  statusName?: string;
  positionId?: number;
  areaId?: number;
  patTaskId?: number | null;
  clearPatTask?: boolean;
  task?: string;
  costCenterId?: number;
  processType?: string;
  budgetCategoryId?: number;
  contractsAmount?: number;
  unitCost?: number;
  months?: number;
  year?: number;
}

export interface ContractManagementExecutionPlan {
  id: string;
  planId: string;
  taskId: number | null;
  taskName: string | null;
  taskDescription: string | null;
  month: number;
  amount: number;
  status: ContractManagementExecutionStatus;
  contract: Contract | null;
  scheduledTaskId: number | null;
  createdAt: string;
}

export interface UpsertContractManagementExecutionPlanDto {
  taskId?: number | null;
  taskDescription?: string | null;
  month: number;
  amount: number;
}

export interface LinkContractToExecutionPlanDto {
  contractId: number;
}

export interface UpdateExecutionStatusDto {
  status: ContractManagementExecutionStatus;
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
