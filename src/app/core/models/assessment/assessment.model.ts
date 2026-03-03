import { Area } from "./area.model";
import { Employee } from "./employee.model";
import { Period } from "./period.model";

export interface Assessment {
  id: number;
  period: Period;
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
  area: Area;

  evaluator: Employee | undefined;
  evaluatee: Employee | undefined;
}
