import { Area } from "./area.model";
import { CompetencyScore } from "./competency-score.model";
import { Employee } from "./employee.model";
import { Period } from "./period.model";
import { Position } from "./position.model";

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

  area?: Area;
  competencyScores?: Array<CompetencyScore>;
  period?: Period | undefined;
  position?: Position | undefined;
  evaluator?: Employee | undefined;
  evaluatee?: Employee | undefined;
}
