export interface StatusCount {
  status: string;
  count: number;
}

export interface EvaluationPeriod {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;

  averageScore?: number;

  totalAssessments?: number;
  totalEvaluatees?: number;
  totalEvaluators?: number;
  totalAnswers?: number;
  avgScore?: number;

  statusCounts?: StatusCount[];

  createdAt?: string;
  updatedAt?: string;
}
