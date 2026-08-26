export interface StatusMetrics {
  status: string;
  count: number;
}

export interface ImprovementPlanMetrics {
  planMetrics: StatusMetrics[];
  actionMetrics: StatusMetrics[];
}
