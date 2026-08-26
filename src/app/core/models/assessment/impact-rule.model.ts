import { Competencie } from "./competencie.model";

export interface ImpactRule {
  id: number;
  name: string;
  impactFactor: number;

  competencies?: Array<Competencie>;
}
