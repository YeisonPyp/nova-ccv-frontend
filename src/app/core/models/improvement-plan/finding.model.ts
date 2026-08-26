import { FindingDocumentDto } from './finding-document.model';
import { ImprovementActionDto } from './improvement-action.model';

export type FindingType =
  'NONCONFORMITY' | 'OBSERVATION' | 'IMPROVEMENT_OPPORTUNITY' | 'FINDING';

export const findingTypeLabels: Record<FindingType, string> = {
  NONCONFORMITY: 'No conformidad',
  OBSERVATION: 'Observación',
  IMPROVEMENT_OPPORTUNITY: 'Oportunidad de mejora',
  FINDING: 'Hallazgo',
};

export interface FindingDto {
  id: number;
  number: number;
  type: FindingType;
  name: string;
  description: string;
  rootCauseNotes?: string;
  rootCauseDocuments?: FindingDocumentDto[];
  actions?: ImprovementActionDto[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateFindingDto {
  improvementPlanId: number;
  type: FindingType;
  name: string;
  description: string;
  rootCauseNotes?: string;
}

export interface UpdateFindingDto {
  type?: FindingType;
  name?: string;
  description?: string;
  rootCauseNotes?: string;
}
