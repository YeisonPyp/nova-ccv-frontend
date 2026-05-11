// src/app/models/pat/activity.model.ts
export interface Activity {
  id: number;
  programId: number;
  nombre: string;
  unidadMedida: string;
  metaTotal: number;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityWithMetrics extends Activity {
  metaEjecutada: number;
  porcentajeAvance: number;
  presupuestoTotal: number;
  presupuestoEjecutado: number;
}

export interface CreateActivityRequest {
  programId: number;
  nombre: string;
  unidadMedida: string;
  metaTotal: number;
  displayOrder?: number;
}

export interface BudgetItem {
  id: number;
  activityId: number;
  descripcion: string;
  monto: number;
  categoria: string;
  createdAt: string;
}

export interface CreateBudgetItemRequest {
  activityId: number;
  descripcion: string;
  monto: number;
  categoria: string;
}