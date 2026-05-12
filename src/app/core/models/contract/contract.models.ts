export interface Contract {
  id: number;
  contractId: string;
  contractType: string;
  identification: string;
  areaId: number;
  areaName: string;
  status: string;
  starts: string;
  ends: string | null;
  costCenterId: number;
  costCenterName: string;
  basePeriodAmount: number;
  cotizationType: string;
  periodDays: number;
  periods: number | null;
  totalPaid: number;
  retentionAmount: number;
  agencyId: number | null;
  agencyName: string | null;
  employeeId: number | null;
  employeeName: string | null;
  employeeLastName: string | null;
  positionId: number | null;
  positionName: string | null;
  salaryParameterId: number | null;
  salaryYear: number | null;
  smmlv: number | null;
  periodTransportAmount: number | null;
  periodSeniorityAmount: number | null;
  periodTradeUnionAmount: number | null;
  periodSolidarityAmount: number | null;
  periodPensionAmount: number | null;
  periodParafiscalContributionsAmount: number | null;
  epsAffiliationType: string | null;
  epsEntityName: string | null;
  pensionType: string | null;
  pensionEntity: string | null;
  employeeClass: string | null;
  compensationEntity: string | null;
  zone: string | null;
  baseAmount: number | null;
  grossTotalAmount: number | null;
  netTotalAmount: number | null;
  grossPeriodAmount: number | null;
  cancellationDate: string | null;
  cancellationReason: string | null;
  suspendedAt: string | null;
  resumeExpectedAt: string | null;
  standbyCostAmount: number | null;
  resumedAt: string | null;
  indemnityAmount: number | null;
  penaltyAmount: number | null;
  settlementDate: string | null;
  userId: number;
  username: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContractMutation {
  id: number;
  contractId: number;
  contractActId: number | null;
  oldContract: string;
  newContract: string;
  opName: string;
  createdAt: string;
  createdById: number;
}

export interface ContractAdditions {
  id: number;
  contractId: number;
  actId: number | null;
  mutationId: number;
  newBasePeriodAmount: number;
  description: string | null;
  createdAt: string;
  createdById: number;
}

export interface ContractCessions {
  id: number;
  contractId: number;
  actId: number | null;
  mutationId: number;
  previousEmployeeId: number | null;
  previousEmployeeName: string | null;
  previousEmployeeLastName: string | null;
  newEmployeeId: number | null;
  newEmployeeName: string | null;
  newEmployeeLastName: string | null;
  previousAgencyId: number | null;
  previousAgencyName: string | null;
  newAgencyId: number | null;
  newAgencyName: string | null;
  executedAmount: number;
  pendingAmount: number;
  description: string | null;
  createdAt: string;
  createdById: number;
}

export interface ContractSuspension {
  id: number;
  contractId: number;
  actId: number | null;
  mutationId: number;
  suspensionStatusName: string;
  suspensionReason: string;
  suspensionDate: string;
  expectedTerminationDate: string | null;
  expectedResumeDate: string | null;
  affectsSocialSecurity: boolean;
  standbyCostAmount: number;
  createdAt: string;
  createdById: number;
}

export interface ContractCancellation {
  id: number;
  contractId: number;
  actId: number | null;
  mutationId: number;
  cancelationTypeName: string;
  cancellationReason: string | null;
  cancellationDate: string;
  indemnityAmount: number | null;
  penaltyAmount: number | null;
  createdAt: string;
  createdById: number;
}

export interface ContractOthersi {
  id: number;
  contractId: number;
  actId: number | null;
  mutationId: number;
  index: number;
  description: string;
  executionDate: string | null;
  createdAt: string;
  createdById: number;
}

export interface ContractFilingFileName {
  id: number;
  name: string;
  isRequired: boolean;
  mimeTypes: string | null;
}

export interface ContractSubmission {
  id: number;
  assignmentId: number;
  fileName: string;
  bucketName: string;
  description: string | null;
  createdAt: string;
}

export interface ContractAssignment {
  id: number;
  contractId: number;
  name: string;
  description: string | null;
  status: string | null;
  validFileType: string | null;
  dueAt: string | null;
  createdAt: string;
  submissions: ContractSubmission[];
}

export type ContractPendingProcessType =
  | "addition"
  | "cancellation"
  | "cession"
  | "mutation"
  | "othersi"
  | "suspension";

export interface ContractPendingProcess {
  id: number;
  name: string;
  processType: ContractPendingProcessType;
  createdAt: string;
}

export interface ContractAct {
  id: number;
  contractId: number;
  filingId: number | null;
  typeCode: string;
  actDate: string;
  signatories: string;
  description: string | null;
  createdAt: string;
}
