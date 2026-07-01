import { Area } from '../assessment/area.model';
import { CostCenter } from '../cost-center/cost-center.models';

export interface ProjectStatus {
  name: string;
  color: string;
}

export interface Project {
  id: number;
  code: string;
  name: string;
  areaName: string;
  area?: Area;
  costCenter?: CostCenter;
  startDate: string;
  endDate: string;
  status: ProjectStatus;
  priority: string;
  createdAt: string;
  description?: string;
  generalObjective?: string;

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
