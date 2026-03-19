import { Competencie } from "./competencie.model";

export interface CompetencyScore {
  id: number;
  impactFactor: number;
  score: number;
  weightedScore: number;
  justification?: string;
  competency?: Competencie;
}
