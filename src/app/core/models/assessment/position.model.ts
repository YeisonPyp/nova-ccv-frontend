import { Area } from "./area.model";
import { Competencie } from "./competencie.model";

export interface Position {
  id: number;
  name: string;
  description?: string;

  area?: Area | undefined;
  competencies?: Array<Competencie> | undefined;
}
