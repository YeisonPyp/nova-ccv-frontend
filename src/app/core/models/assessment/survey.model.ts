export interface SurveyQuestion {
  id: number;
  surveyId: number;
  description: string;
  minValue: number;
  maxValue: number;
  displayOrder: number;
}

export interface Survey {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
  questions?: SurveyQuestion[];
}

export type EvaluationType = "SELF" | "PEER" | "SUPERIOR" | "HIERARCHICAL";

export interface PositionEvaluationSurvey {
  id: number;
  displayOrder: number;
  survey: Survey;
}

export interface PositionEvaluation {
  id: number;
  positionId: number;
  type: EvaluationType;
  surveys?: PositionEvaluationSurvey[];
}
