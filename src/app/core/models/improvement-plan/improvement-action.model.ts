import { Employee } from "../assessment/employee.model";
import { EvidenceDto } from "./evidence.model";

export type PdcaPhase = "PLAN" | "DO" | "CHECK" | "ACT";

export const pdcaPhaseLabels: Record<PdcaPhase, string> = {
  PLAN: "Planear",
  DO: "Hacer",
  CHECK: "Verificar",
  ACT: "Actuar",
};

export type ExecutionFrequency =
  | "MONTHLY"
  | "BIMONTHLY"
  | "QUARTERLY"
  | "SEMIANNUAL"
  | "ANNUAL";

export const executionFrequencyLabels: Record<ExecutionFrequency, string> = {
  MONTHLY: "Mensual",
  BIMONTHLY: "Bimestral",
  QUARTERLY: "Trimestral",
  SEMIANNUAL: "Semestral",
  ANNUAL: "Anual",
};

export type ImprovementActionApprovalDecision = "APPROVED" | "PENDING";

export const approvalDecisionLabels: Record<
  ImprovementActionApprovalDecision,
  string
> = {
  APPROVED: "Aprobada",
  PENDING: "Pendiente",
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
  evidences?: EvidenceDto[];
  lastApprovalStep?: ImprovementActionApprovalStepDto;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateImprovementActionDto {
  findingId: number;
  objectiveDescription: string;
  actionDescription: string;
  pdcaPhases: PdcaPhase[];
  target: number;
  executionFrequency: ExecutionFrequency;
  indicator: string;
  startDate: string;
  closeDate: string;
  employeeId?: number;
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
  followUpObservations?: string;
  actualCloseDate?: string;
  wasEffective?: boolean;
  ineffectivenessJustification?: string;
}
