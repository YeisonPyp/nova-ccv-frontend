// // ============================================
// // ENTIDADES PRINCIPALES DEL DOMINIO PAT
// // ============================================

// export type ProgramState = 'BORRADOR' | 'APROBADO' | 'EJECUCION' | 'CERRADO';
// export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE';

// /**
//  * Programa del Plan Anual de Trabajo
//  * Representa un programa estratégico de la institución
//  */
// export interface Program {
//   id: number;
//   codigo: string;
//   nombre: string;
//   area: string;
//   responsable: string;
//   estado: ProgramState;
//   // Campos adicionales para información completa
//   objetivoEstrategico?: string;
//   pilar?: string;
//   beneficiarios?: string;
//   vigencia: number;
// }

// /**
//  * Actividad dentro de un Programa
//  * Cada programa tiene múltiples actividades medibles
//  */
// export interface Activity {
//   id: number;
//   programId: number;
//   nombre: string;
//   unidadMedida: string;
//   metaTotal: number;
//   descripcion?: string;
// }

// /**
//  * Rubro presupuestal de una actividad
//  */
// export interface BudgetItem {
//   id: number;
//   activityId: number;
//   rubro: string;
//   planeado: number;
//   ejecutado: number;
// }

// /**
//  * Ejecución mensual de una actividad
//  */
// export interface MonthlyExecution {
//   id: number;
//   activityId: number;
//   mes: number;
//   metaEjecutada: number;
//   valorEjecutado: number;
//   observaciones?: string;
//   fechaRegistro?: string;
// }

// /**
//  * Registro de auditoría para trazabilidad
//  */
// export interface AuditLog {
//   id: number;
//   entidad: string;
//   entidadId: number;
//   accion: AuditAction;
//   usuario: string;
//   fecha: string;
//   valorAnterior: any;
//   valorNuevo: any;
//   descripcion?: string;
// }

// // ============================================
// // DTOs Y MODELOS DE VISTA
// // ============================================

// /**
//  * Programa con cálculos agregados para visualización
//  */
// export interface ProgramWithMetrics extends Program {
//   porcentajeMeta: number;
//   porcentajePresupuesto: number;
//   totalPlaneado: number;
//   totalEjecutado: number;
//   metaTotal: number;
//   metaEjecutada: number;
//   enRiesgo: boolean;
// }

// /**
//  * Actividad con cálculos de avance
//  */
// export interface ActivityWithProgress extends Activity {
//   metaEjecutada: number;
//   porcentajeAvance: number;
//   presupuestoPlaneado: number;
//   presupuestoEjecutado: number;
// }

// /**
//  * Rubro con cálculo de diferencia
//  */
// export interface BudgetItemWithDiff extends BudgetItem {
//   diferencia: number;
//   porcentajeEjecucion: number;
// }

// /**
//  * Cronograma mensual para visualización
//  */
// export interface MonthlySchedule {
//   mes: number;
//   nombreMes: string;
//   metaPlaneada: number;
//   metaEjecutada: number;
//   valorPlaneado: number;
//   valorEjecutado: number;
//   porcentajeAvance: number;
// }

// /**
//  * Estadísticas del Dashboard
//  */
// export interface DashboardStats {
//   porcentajeAvanceMetas: number;
//   porcentajeEjecucionPresupuestal: number;
//   programasActivos: number;
//   programasEnRiesgo: number;
//   totalProgramas: number;
//   presupuestoTotal: number;
//   presupuestoEjecutado: number;
// }

// /**
//  * Formulario de registro de ejecución
//  */
// export interface ExecutionFormData {
//   mes: number;
//   metaEjecutada: number;
//   valorEjecutado: number;
//   observaciones?: string;
// }

// /**
//  * Respuesta genérica de la API
//  */
// export interface ApiResponse<T> {
//   success: boolean;
//   data: T;
//   message?: string;
//   timestamp: string;
// }

// /**
//  * Validación de reglas de negocio
//  */
// export interface ValidationResult {
//   isValid: boolean;
//   errors: string[];
// }

// src/app/features/pat/models/pat.models.ts

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