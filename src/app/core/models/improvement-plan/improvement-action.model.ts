import { Employee } from '../assessment/employee.model';
import { Position } from '../assessment/position.model';
import { EvidenceDto } from './evidence.model';

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
  letter: string;
  objectiveDescription: string;
  actionDescription: string;
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
