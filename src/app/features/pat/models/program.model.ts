// src/app/models/pat/program.model.ts
export enum ProgramStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface Program {
  id: number;
  codigo: string;
  nombre: string;
  area: string;
  responsable: string;
  estado: ProgramStatus;
  objetivoEstrategico?: string;
  pilar?: string;
  beneficiarios?: string;
  anio: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProgramWithMetrics extends Program {
  totalActividades: number;
  totalPresupuesto: number;
  presupuestoEjecutado: number;
  porcentajeAvance: number;
}

export interface CreateProgramRequest {
  codigo: string;
  nombre: string;
  area: string;
  responsable: string;
  estado: ProgramStatus;
  objetivoEstrategico?: string;
  pilar?: string;
  beneficiarios?: string;
  anio: number;
}

export interface UpdateProgramRequest {
  nombre?: string;
  area?: string;
  responsable?: string;
  estado?: ProgramStatus;
  objetivoEstrategico?: string;
  pilar?: string;
  beneficiarios?: string;
}