export interface CostCenter {
  id: number;
  name: string;
  description: string | null;
  totalBudget: number;
  executedAmount: number;
  committedAmount: number;
  managerId: number | null;
  managerName: string | null;
  managerLastName: string | null;
  parentId: number | null;
  parentName: string | null;
}

export interface CostCenterMovement {
  id: number;
  costCenterId: number;
  costCenterName: string;
  type: string;
  movementType: string;
  movementReference: number;
  amount: number;
  description: string;
  peerMovementId: number | null;
  createdAt: string;
  createdById: number;
  createdByUsername: string;
}

export interface CreateCostCenterDto {
  name: string;
  description?: string;
  totalBudget: number;
  managerId: number;
  parentId?: number;
}

export interface CreateCostCenterMovementDto {
  costCenterId: number;
  type: string;
  movementType: string;
  movementReference: number;
  amount: number;
  description: string;
  peerMovementId?: number;
}
