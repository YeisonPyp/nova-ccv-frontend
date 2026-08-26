import { Area } from '../assessment/area.model';
import { CostCenter } from '../cost-center/cost-center.models';

export interface ProjectStatus {
  name: string;
  color: string;
}

export type ProjectFormulationStatus =
  | 'formulated'
  | 'under_evaluation'
  | 'viabilized';

export type ProjectInitiativeType = 'program' | 'project';

export type ProjectTechnicalConcept =
  | 'viable'
  | 'viable_with_adjustments'
  | 'not_viable';

export type ProjectIndicatorType = 'management' | 'result';

export interface ProjectFormulation {
  formulationDate?: string;
  formulationStatus: ProjectFormulationStatus;
  strategicAxis?: string;
  strategicObjectives?: string;
  poaRelation?: string;
  patRelation?: string;
  initiativeType: ProjectInitiativeType;
  background?: string;
  justification?: string;
  problemDescription?: string;
  scopeIncludes?: string;
  scopeExcludes?: string;
  directBeneficiaries?: number;
  indirectBeneficiaries?: number;
  estimatedBeneficiaries?: number;
  executionMethodology?: string;
  budgetDetail?: string;
  monitoringPlan?: string;
  sustainability?: string;
  conclusions?: string;
  preparedBy?: string;
  reviewedBy?: string;
  approvedBy?: string;
  technicalConcept?: ProjectTechnicalConcept;
  updatedAt?: string;
}

export interface ProjectIndicator {
  id: number;
  type: ProjectIndicatorType;
  name: string;
  targetValue?: number;
  currentValue: number;
}

export interface Project {
  id: number;
  code: string;
  name: string;
  areaName: string;
  area?: Area;
  costCenter?: CostCenter;
  totalBudget?: number;
  startDate: string;
  endDate: string;
  status: ProjectStatus;
  priority: string;
  createdAt: string;
  description?: string;
  generalObjective?: string;

  formulation?: ProjectFormulation;
  indicators?: ProjectIndicator[];
  activities?: ProjectActivity[];
  risks?: ProjectRisk[];
}

export interface ProjectActivity {
  id: number;
  projectId: number;
  projectCode?: string;
  parentId?: number;
  parentName?: string;
  name: string;
  description?: string;
  displayOrder: number;
  startsAt?: string;
  endsAt?: string;
  approvedBudget: number;
  executedBudget: number;
  progressPercentage: number;
  status?: string;
  priority?: string;
  colorHex: string;
}

export interface ProjectRisk {
  id: number;
  projectId: number;
  name: string;
  description?: string;
  displayOrder: number;
  estimatedCostAmount?: number;
  estimatedHours?: number;
  probability: string;
  priority: string;
  createdAt: string;
}
