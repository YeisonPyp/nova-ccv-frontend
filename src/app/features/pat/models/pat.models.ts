export type ProgramStatus = 'BORRADOR' | 'APROBADO' | 'EJECUCION' | 'CERRADO';
export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE';

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
}

export interface Activity {
  id: number;
  programId: number;
  nombre: string;
  unidadMedida: string;
  metaTotal: number;
}

export interface BudgetItem {
  id: number;
  activityId: number;
  rubro: string;
  planeado: number;
  ejecutado: number;
}

export interface MonthlyExecution {
  id: number;
  activityId: number;
  mes: number;
  metaEjecutada: number;
  valorEjecutado: number;
  observaciones?: string;
}

export interface MonthlyPlan {
  id: number;
  activityId: number;
  mes: number;
  metaPlaneada: number;
  valorPlaneado: number;
}

export interface AuditLog {
  id: number;
  entidad: string;
  entidadId: number;
  accion: AuditAction;
  usuario: string;
  fecha: string;
  valorAnterior: any;
  valorNuevo: any;
}

// DTOs calculados para la UI
export interface ProgramWithMetrics extends Program {
  metaEjecutadaPct: number;
  presupuestoEjecutadoPct: number;
  totalPlaneado: number;
  totalEjecutado: number;
  metaTotal: number;
  metaEjecutada: number;
}

export interface ActivityWithMetrics extends Activity {
  metaEjecutada: number;
  avancePct: number;
  presupuestoPlaneado: number;
  presupuestoEjecutado: number;
}

export interface DashboardStats {
  totalProgramas: number;
  programasActivos: number;
  programasEnRiesgo: number;
  avanceMetaGlobal: number;
  ejecucionPresupuestalGlobal: number;
  presupuestoTotal: number;
  presupuestoEjecutado: number;
}

export interface ScheduleRow {
  mes: number;
  nombreMes: string;
  metaPlaneada: number;
  metaEjecutada: number;
  valorPlaneado: number;
  valorEjecutado: number;
}

export interface ExecutionFormData {
  activityId: number;
  mes: number;
  metaEjecutada: number;
  valorEjecutado: number;
  observaciones: string;
}


export interface MenuNode {
  label: string;
  icon?: string;
  route?: string;
  external?: boolean;
  expanded?: boolean;
  children?: MenuNode[];
  target?: '_blank' | '_self' | '_parent' | '_top'; // Para links externos
}