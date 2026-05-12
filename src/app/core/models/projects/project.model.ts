import { Area } from "../assessment/area.model";
import { CostCenter } from "../cost-center/cost-center.models";

export interface Project {
  id: number;
  code: string;
  name: string;
  description?: string;
  generalObjective: string;
  area?: Area;
  costCenter?: CostCenter;
  startDate: string;
  endDate: string;
  totalBudget: number;
  status: string;
  priority: string;
  priorityScale: number;
  createdAt: string;
  createdById?: number;
  createdByUsername?: string;

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
  progressPercentage: number;
  status: string;
  priority?: string;
  colorHex: string;
  budgetAmount?: number;
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
