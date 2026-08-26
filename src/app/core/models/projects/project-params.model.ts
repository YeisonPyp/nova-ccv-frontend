export interface ActivityStatus {
  id: number;
  name: string;
}

export interface ProjectPriority {
  id: number;
  name: string;
  scale: number;
  projectsCount: number;
}

export interface ProjectStatus {
  id: number;
  name: string;
  projectsCount: number;
}
