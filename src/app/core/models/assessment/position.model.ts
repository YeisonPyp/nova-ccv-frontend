import { Area } from "./area.model";
import { Competencie } from "./competencie.model";

export interface Position {
  id: number;
  name: string;
  areaName: string;
  areaId: number;
  description?: string;

  area?: Area | undefined;
  competencies?: Array<Competencie> | undefined;
  assessmentComponent?: Array<PositionAssessmentComponent>;
}

export interface AssessmentComponentRequirementFile {
  id: number;
  fileName: string;
  bucketName: string;
}

export interface AssessmentComponentRequirement {
  id: number;
  componentId: number;
  name: string;
  description: string;
  maxFiles: number;
  files?: AssessmentComponentRequirementFile[];
}

export interface PositionAssessmentComponent {
  id: number;
  positionId: number;
  name: string;
  description: string;
  minValue: number;
  maxValue: number;
  createdAt: string;
  requirements?: AssessmentComponentRequirement[];
}
