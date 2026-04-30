import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, switchMap, forkJoin, of, map } from "rxjs";
import { environment } from "../../../environments/environment";
import { ApiResponse } from "../models/api-response.model";
import {
  Program,
  Activity,
  BudgetItem,
  MonthlyExecution,
  ProgramWithMetrics,
  ActivityWithMetrics,
  DashboardStats,
  ScheduleRow,
  ExecutionFormData,
} from "../../features/pat/models/pat.models";

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

@Injectable({ providedIn: "root" })
export class PatApiService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;

  // ========== PROGRAMS ==========

  getPrograms(year?: number): Observable<Program[]> {
    const params: Record<string, any> = {};
    if (year != null) params["anio"] = year;
    return this.http
      .get<ApiResponse<Program[]>>(`${this.base}/pat/programs`, { params })
      .pipe(map((res) => res.data ?? []));
  }

  getProgramsWithMetrics(year?: number): Observable<ProgramWithMetrics[]> {
    const params: Record<string, any> = {};
    if (year != null) params["anio"] = year;
    return this.http
      .get<
        ApiResponse<ProgramWithMetrics[]>
      >(`${this.base}/pat/programs/with-metrics`, { params })
      .pipe(map((res) => res.data ?? []));
  }

  getProgramById(id: number): Observable<Program> {
    return this.http
      .get<ApiResponse<Program>>(`${this.base}/pat/programs/${id}`)
      .pipe(map((res) => res.data));
  }

  getProgramWithMetricsById(id: number): Observable<ProgramWithMetrics> {
    return this.http
      .get<
        ApiResponse<ProgramWithMetrics>
      >(`${this.base}/pat/programs/${id}/with-metrics`)
      .pipe(map((res) => res.data));
  }

  // ========== ACTIVITIES ==========

  getActivitiesByProgram(programId: number): Observable<Activity[]> {
    return this.http
      .get<
        ApiResponse<Activity[]>
      >(`${this.base}/pat/activities/program/${programId}`)
      .pipe(map((res) => res.data ?? []));
  }

  getActivitiesWithMetrics(
    programId: number,
  ): Observable<ActivityWithMetrics[]> {
    return this.http
      .get<
        ApiResponse<ActivityWithMetrics[]>
      >(`${this.base}/pat/activities/program/${programId}/with-metrics`)
      .pipe(map((res) => res.data ?? []));
  }

  // ========== BUDGET ==========

  getBudgetByActivity(activityId: number): Observable<BudgetItem[]> {
    return this.http
      .get<
        ApiResponse<BudgetItem[]>
      >(`${this.base}/pat/activities/${activityId}/budget`)
      .pipe(map((res) => res.data ?? []));
  }

  getBudgetByProgram(programId: number): Observable<BudgetItem[]> {
    return this.getActivitiesByProgram(programId).pipe(
      switchMap((activities) => {
        if (activities.length === 0) return of([]);
        return forkJoin(
          activities.map((a) => this.getBudgetByActivity(a.id)),
        ).pipe(map((arrays) => arrays.flat()));
      }),
    );
  }

  // ========== EXECUTIONS ==========

  getExecutionsByActivity(activityId: number): Observable<MonthlyExecution[]> {
    return this.http
      .get<
        ApiResponse<MonthlyExecution[]>
      >(`${this.base}/pat/executions/activity/${activityId}`)
      .pipe(map((res) => res.data ?? []));
  }

  createExecution(data: ExecutionFormData): Observable<MonthlyExecution> {
    return this.http
      .post<ApiResponse<MonthlyExecution>>(`${this.base}/pat/executions`, data)
      .pipe(map((res) => res.data));
  }

  // ========== SCHEDULE ==========

  getScheduleByProgram(programId: number): Observable<ScheduleRow[]> {
    return this.http
      .get<
        ApiResponse<ScheduleRow[]>
      >(`${this.base}/pat/executions/program/${programId}/schedule`)
      .pipe(map((res) => res.data ?? []));
  }

  // ========== DASHBOARD ==========

  getDashboardStats(year?: number): Observable<DashboardStats> {
    const params: Record<string, any> = {};
    if (year != null) params["anio"] = year;
    return this.http
      .get<
        ApiResponse<DashboardStats>
      >(`${this.base}/pat/dashboard`, { params })
      .pipe(map((res) => res.data));
  }

  validateExecution(
    activityId: number,
    data: ExecutionFormData,
  ): Observable<ValidationResult> {
    throw new Error("Method not implemented.");
    // const activity = this.activities.find((a) => a.id === activityId);
    // const program = this.programs.find((p) => p.id === activity?.programId);
    // if (!activity || !program) {
    //   return of({
    //     isValid: false,
    //     errors: ["Actividad o programa no encontrado"],
    //   });
    // }
    // return of(
    //   PatCalculations.validateExecution(
    //     activityId,
    //     data.mes,
    //     data.metaEjecutada,
    //     data.valorEjecutado,
    //     activity,
    //     this.executions,
    //     this.budgetItems,
    //     program,
    //   ),
    // ).pipe(delay(100));
  }

  // validateExecution(
  //   activityId: number,
  //   mes: number,
  //   metaEjecutada: number,
  //   valorEjecutado: number,
  //   activity: Activity,
  //   existingExecutions: MonthlyExecution[],
  //   budgetItems: BudgetItem[],
  //   program: Program,
  // ) {
  //   const errors: string[] = [];

  //   // Regla 1: No ejecutar si el programa está cerrado
  //   if (program.status === "CLOSED") {
  //     errors.push("No se puede registrar ejecución en un programa CERRADO");
  //   }

  //   // Regla 2: No ejecutar si el programa está en borrador
  //   if (program.status === "DRAFT") {
  //     errors.push(
  //       "No se puede registrar ejecución en un programa en estado BORRADOR",
  //     );
  //   }

  //   // Regla 3: Verificar que no se supere la meta total
  //   const metaActual = existingExecutions
  //     .filter((b) => b.activityId === activityId)
  //     .reduce((sum, b) => sum + b.executedAmount, 0);

  //   const nuevaMetaTotal = metaActual + metaEjecutada;
  //   if (nuevaMetaTotal > activity.goalTotal) {
  //     errors.push(
  //       `La meta ejecutada (${nuevaMetaTotal}) superaría la meta total (${activity.goalTotal})`,
  //     );
  //   }

  //   // Regla 4: Verificar que no se supere el presupuesto planeado
  //   const presupuestoPlaneado = budgetItems
  //     .filter((b) => b.activityId === activityId)
  //     .reduce((sum, b) => sum + b.planned, 0);
  //   const presupuestoActual = budgetItems
  //     .filter((b) => b.activityId === activityId)
  //     .reduce((sum, b) => sum + b.executed, 0);
  //   const nuevoPresupuesto = presupuestoActual + valorEjecutado;
  //   if (nuevoPresupuesto > presupuestoPlaneado) {
  //     errors.push(
  //       `El presupuesto ejecutado ($${nuevoPresupuesto.toLocaleString()}) superaría el planeado ($${presupuestoPlaneado.toLocaleString()})`,
  //     );
  //   }

  //   // Regla 5: Verificar que el mes sea válido
  //   if (mes < 1 || mes > 12) {
  //     errors.push("El mes debe estar entre 1 y 12");
  //   }

  //   // Regla 6: Verificar valores positivos
  //   if (metaEjecutada < 0 || valorEjecutado < 0) {
  //     errors.push("Los valores ejecutados deben ser positivos");
  //   }

  //   return {
  //     isValid: errors.length === 0,
  //     errors,
  //   };
  // }
}
