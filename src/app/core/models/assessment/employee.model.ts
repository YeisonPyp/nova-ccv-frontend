import { Position } from "./position.model";

export interface Employee {
  id: number;
  name: string;
  lastName: string;
  email: string;
  positionId: number;
  isActive: boolean;

  position?: Position | undefined;
  reportsTo?: Employee | null | undefined;
}
