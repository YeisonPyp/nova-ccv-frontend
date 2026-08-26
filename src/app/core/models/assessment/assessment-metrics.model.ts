export interface AssessmentYearStats {
  year: number;
  totalAssessments: number;
  totalEvaluatees: number;
  totalEvaluators: number;
  totalPeriods: number;
  avgPctScore: number;
}

export interface AreaAssessmentStats extends AssessmentYearStats {
  areaName: string;
}

export interface AssessmentsAnnualStats {
  stats: AssessmentYearStats[];
  areaStats: AreaAssessmentStats[];
}
