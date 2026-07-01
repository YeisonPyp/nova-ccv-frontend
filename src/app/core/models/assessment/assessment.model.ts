import { Area } from "./area.model";
import { CompetencyScore } from "./competency-score.model";
import { Employee } from "./employee.model";
import { Period } from "./period.model";
import { Position, PositionAssessmentComponent } from "./position.model";
import { EvaluationType, SurveyQuestion } from "./survey.model";

export interface AssessmentComponentReportSupportFile {
  id: number;
  fileName: string;
  bucketName: string;
}

export interface AssessmentComponentReportSupport {
  id: number;
  reportId: number;
  requirementId: number;
  description: string;
  createdAt: string;
  files: AssessmentComponentReportSupportFile[];
}

export interface AssessmentComponentReport {
  id: number;
  score: number;
  observations: string;
  createdAt: string;
  updatedAt: string;
  component: PositionAssessmentComponent;
  supports?: AssessmentComponentReportSupport[];
}

export interface AssessmentSurveyAnswer {
  id: number;
  score: number;
  question: SurveyQuestion;
  surveyId: number;
  surveyName: string;
}

export interface Assessment {
  id: number;
  finalScoreCompetencies: number;
  matrixTotalScore: number;
  status: string;
  strengths: string;
  aspectsToImprove: string;
  observations: string;
  agreements: string;
  createdAt: string;
  score: number;
  type: EvaluationType;

  area?: Area;
  competencyScores?: Array<CompetencyScore>;
  period?: Period | undefined;
  position?: Position | undefined;
  evaluator?: Employee | undefined;
  evaluatee?: Employee | undefined;
  permissions?: string[];
  components?: AssessmentComponentReport[];
  surveyAnswers?: AssessmentSurveyAnswer[];
}
