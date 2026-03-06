import { Area } from "./area.model";
import { Competencie } from "./competencie.model";

export interface Position {
  id: number;
  name: string;
  areaName: string;
  areaId: number;
  description?: string;

  area?: Area | undefined;
  competencies?: Array<Competencie> | undefined;
}
