import { Competencie } from "./competencie.model";

export interface CompetencyScore {
    id: number;
    assessment: string;
    impactFactor :number;
    score: number;
    weightedScore: number;
    justification?: string;
    competency?: Competencie;
}