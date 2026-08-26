import { Employee } from '../assessment/employee.model';
import { Position } from '../assessment/position.model';
import { EvidenceDto } from './evidence.model';

import type { FindingType } from './finding.model';

export type ActionType = 'CORRECTIVE' | 'MITIGATION' | 'IMPROVEMENT';

export const actionTypeLabels: Record<ActionType, string> = {
  CORRECTIVE: 'Correctiva',
  MITIGATION: 'Mitigación',
  IMPROVEMENT: 'Mejora',
};

export const actionTypeBadgeClasses: Record<ActionType, string> = {
  CORRECTIVE: 'bg-red-50 text-red-700 border-red-200',
  MITIGATION: 'bg-amber-50 text-amber-700 border-amber-200',
  IMPROVEMENT: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

const ALLOWED_ACTION_TYPES: Record<FindingType, ActionType[]> = {
  NONCONFORMITY: ['CORRECTIVE'],
  OBSERVATION: ['MITIGATION'],
  IMPROVEMENT_OPPORTUNITY: ['IMPROVEMENT'],
  FINDING: ['CORRECTIVE', 'MITIGATION', 'IMPROVEMENT'],
};

export function allowedActionTypesFor(findingType: FindingType): ActionType[] {
  return ALLOWED_ACTION_TYPES[findingType] ?? [];
}

export type PdcaPhase = 'PLAN' | 'DO' | 'CHECK' | 'ACT';

export const pdcaPhaseLabels: Record<PdcaPhase, string> = {
  PLAN: 'Planear',
  DO: 'Hacer',
  CHECK: 'Verificar',
  ACT: 'Actuar',
};

export type ExecutionFrequency =
  'UNIQUE' | 'MONTHLY' | 'BIMONTHLY' | 'QUARTERLY' | 'SEMIANNUAL' | 'ANNUAL';

export const executionFrequencyLabels: Record<ExecutionFrequency, string> = {
  UNIQUE: 'Único',
  MONTHLY: 'Mensual',
  BIMONTHLY: 'Bimestral',
  QUARTERLY: 'Trimestral',
  SEMIANNUAL: 'Semestral',
  ANNUAL: 'Anual',
};

export type ImprovementActionApprovalDecision = 'APPROVED' | 'PENDING';

export const approvalDecisionLabels: Record<
  ImprovementActionApprovalDecision,
  string
> = {
  APPROVED: 'Aprobada',
  PENDING: 'Pendiente',
};

export interface ImprovementActionApprovalStepDto {
  id: number;
  observation: string;
  decision: ImprovementActionApprovalDecision;
  createdBy?: Employee;
  createdAt: string;
}

export interface CreateImprovementActionApprovalStepDto {
  observation: string;
  decision: ImprovementActionApprovalDecision;
}

export const actionFollowUpStatus = {
  PENDING: 'Pendiente',
  COMPLETED: 'Completada',
  OVERDUE: 'Vencida',
} as const;

export type ActionFollowUpStatus = keyof typeof actionFollowUpStatus;

export interface ImprovementActionFollowUp {
  id: number;
  scheduledAt: string;
  status: ActionFollowUpStatus;
  evidences?: EvidenceDto[];
  observations?: string;
  permissions?: string[];
}

export interface ImprovementActionDto {
  id: number;
  findingId?: number;
  findingName?: string;
  planId?: number;
  planName?: string;
  letter: string;
  objectiveDescription: string;
  actionDescription: string;
  actionType: ActionType;
  pdcaPhases: PdcaPhase[];
  target: number;
  executionFrequency: ExecutionFrequency;
  indicator: string;
  startDate: string;
  closeDate: string;
  status: string;
  followUpObservations?: string;
  actualCloseDate?: string;
  wasEffective?: boolean | null;
  ineffectivenessJustification?: string;
  employee?: Employee;
  positions?: Position[];
  followUp: ImprovementActionFollowUp[];
  lastApprovalStep?: ImprovementActionApprovalStepDto;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateImprovementActionDto {
  findingId: number;
  objectiveDescription: string;
  actionDescription: string;
  actionType: ActionType;
  pdcaPhases: PdcaPhase[];
  executionFrequency: ExecutionFrequency;
  indicator: string;
  startDate: string;
  closeDate: string;
  employeeId?: number;
  positionIds?: number[];
}

export interface UpdateImprovementActionDto {
  objectiveDescription?: string;
  actionDescription?: string;
  actionType?: ActionType;
  pdcaPhases?: PdcaPhase[];
  target?: number;
  executionFrequency?: ExecutionFrequency;
  indicator?: string;
  startDate?: string;
  closeDate?: string;
  employeeId?: number;
  positionIds?: number[];
  followUpObservations?: string;
  actualCloseDate?: string;
  wasEffective?: boolean;
  ineffectivenessJustification?: string;
}
