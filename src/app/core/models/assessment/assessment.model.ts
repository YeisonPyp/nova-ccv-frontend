import { Area } from "./area.model";
import { Employee } from "./employee.model";
import { Period } from "./period.model";
import { Position } from "./position.model";

export interface Assessment {
  id: number;
  finalScoreCompetencies: number;
  finalScoreResults: number;
  matrixTotalScore: number;
  status: string;
  strengths: string;
  aspectsToImprove: string;
  observations: string;
  agreements: string;
  createdAt: string;
  score: number;

  area?: Area;
  period?: Period | undefined;
  position?: Position | undefined;
  evaluator?: Employee | undefined;
  evaluatee?: Employee | undefined;
}
