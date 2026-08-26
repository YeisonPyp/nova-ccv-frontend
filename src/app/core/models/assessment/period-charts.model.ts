export interface PositionAvgScore {
  positionId: number;
  positionName: string;
  avgScore: number;
  totalAssessments: number;
}

export interface SurveyAvgScore {
  surveyId: number;
  surveyName: string;
  avgScore: number;
  totalAnswers: number;
}

export interface AreaAssessmentCount {
  areaId: number;
  areaName: string;
  totalAssessments: number;
}

export interface PeriodCharts {
  positionAvgScores: PositionAvgScore[];
  surveyAvgScores: SurveyAvgScore[];
  areaAssessmentCounts: AreaAssessmentCount[];
}
