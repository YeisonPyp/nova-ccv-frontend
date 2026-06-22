export interface PatPlanProcess {
  id: number;
  name: string;
}

export interface StrategicPlan {
  id: number;
  name: string;
  startsYear: number;
  endsYear: number;
}

export interface CreateStrategicPlanDto {
  startsYear: number;
  endsYear: number;
}
