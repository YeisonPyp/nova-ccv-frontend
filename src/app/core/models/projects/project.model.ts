export interface Project {
  id: number;
  code: string;
  name: string;
  description?: string;
  generalObjective: string;
  areaId?: number;
  areaName?: string;
  costCenterId?: number;
  costCenterName?: string;
  startDate: string;
  endDate: string;
  totalBudget: number;
  status: string;
  priority: string;
  priorityScale: number;
  createdAt: string;
  createdById?: number;
  createdByUsername?: string;
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

export interface GanttTask {
  id: number;
  text: string;
  start_date: string;
  duration: number;
  progress: number;
  parent: number;
  open: boolean;
  color?: string;
  status?: string;
  budget_amount?: number;
}

export interface GanttLink {
  id: number;
  source: number;
  target: number;
  type: string;
  lag: number;
}

export interface GanttData {
  data: GanttTask[];
  links: GanttLink[];
}
