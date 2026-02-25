import { Injectable } from '@angular/core';
import { Observable, of, delay, map, forkJoin, throwError } from 'rxjs';
import {
  Program,
  Activity,
  BudgetItem,
  MonthlyExecution,
  MonthlyPlan,
  ProgramWithMetrics,
  ActivityWithMetrics,
  DashboardStats,
  ScheduleRow,
  ExecutionFormData
} from '../../features/pat/models/pat.models';
import {
  MOCK_PROGRAMS,
  MOCK_ACTIVITIES,
  MOCK_BUDGET_ITEMS,
  MOCK_MONTHLY_EXECUTIONS,
  MOCK_MONTHLY_PLANS,
  MONTHS_NAMES
} from '../data/pat-mock-data';
import { AuditService } from './audit.service';

@Injectable({
  providedIn: 'root'
})
export class PatApiService {
  private programs = [...MOCK_PROGRAMS];
  private activities = [...MOCK_ACTIVITIES];
  private budgetItems = [...MOCK_BUDGET_ITEMS];
  private monthlyExecutions = [...MOCK_MONTHLY_EXECUTIONS];
  private monthlyPlans = [...MOCK_MONTHLY_PLANS];

  private readonly API_DELAY = 300;

  constructor(private auditService: AuditService) {}

  // ========== PROGRAMS ==========

  /**
   * GET /api/pat/2025/programs
   */
  getPrograms(): Observable<Program[]> {
    return of([...this.programs]).pipe(delay(this.API_DELAY));
  }

  /**
   * GET /api/pat/2025/programs con métricas calculadas
   */
  getProgramsWithMetrics(): Observable<ProgramWithMetrics[]> {
    return forkJoin({
      programs: this.getPrograms(),
      activities: of([...this.activities]),
      budgetItems: of([...this.budgetItems]),
      executions: of([...this.monthlyExecutions])
    }).pipe(
      delay(this.API_DELAY),
      map(({ programs, activities, budgetItems, executions }) => {
        return programs.map(program => {
          const programActivities = activities.filter(a => a.programId === program.id);
          const activityIds = programActivities.map(a => a.id);
          
          // Calcular metas
          const metaTotal = programActivities.reduce((sum, a) => sum + a.metaTotal, 0);
          const metaEjecutada = executions
            .filter(e => activityIds.includes(e.activityId))
            .reduce((sum, e) => sum + e.metaEjecutada, 0);
          
          // Calcular presupuesto
          const totalPlaneado = budgetItems
            .filter(b => activityIds.includes(b.activityId))
            .reduce((sum, b) => sum + b.planeado, 0);
          const totalEjecutado = budgetItems
            .filter(b => activityIds.includes(b.activityId))
            .reduce((sum, b) => sum + b.ejecutado, 0);

          return {
            ...program,
            metaTotal,
            metaEjecutada,
            metaEjecutadaPct: metaTotal > 0 ? Math.round((metaEjecutada / metaTotal) * 100) : 0,
            totalPlaneado,
            totalEjecutado,
            presupuestoEjecutadoPct: totalPlaneado > 0 ? Math.round((totalEjecutado / totalPlaneado) * 100) : 0
          };
        });
      })
    );
  }

  /**
   * GET /api/programs/{id}
   */
  getProgramById(id: number): Observable<Program | undefined> {
    const program = this.programs.find(p => p.id === id);
    return of(program).pipe(delay(this.API_DELAY));
  }

  // ========== ACTIVITIES ==========

  /**
   * GET /api/programs/{id}/activities
   */
  getActivitiesByProgram(programId: number): Observable<Activity[]> {
    const activities = this.activities.filter(a => a.programId === programId);
    return of(activities).pipe(delay(this.API_DELAY));
  }

  /**
   * GET /api/programs/{id}/activities con métricas
   */
  getActivitiesWithMetrics(programId: number): Observable<ActivityWithMetrics[]> {
    return forkJoin({
      activities: this.getActivitiesByProgram(programId),
      budgetItems: of([...this.budgetItems]),
      executions: of([...this.monthlyExecutions])
    }).pipe(
      map(({ activities, budgetItems, executions }) => {
        return activities.map(activity => {
          const activityBudget = budgetItems.filter(b => b.activityId === activity.id);
          const activityExecutions = executions.filter(e => e.activityId === activity.id);
          
          const metaEjecutada = activityExecutions.reduce((sum, e) => sum + e.metaEjecutada, 0);
          const presupuestoPlaneado = activityBudget.reduce((sum, b) => sum + b.planeado, 0);
          const presupuestoEjecutado = activityBudget.reduce((sum, b) => sum + b.ejecutado, 0);

          return {
            ...activity,
            metaEjecutada,
            avancePct: activity.metaTotal > 0 ? Math.round((metaEjecutada / activity.metaTotal) * 100) : 0,
            presupuestoPlaneado,
            presupuestoEjecutado
          };
        });
      })
    );
  }

  // ========== BUDGET ==========

  /**
   * GET /api/activities/{id}/budget
   */
  getBudgetByActivity(activityId: number): Observable<BudgetItem[]> {
    const items = this.budgetItems.filter(b => b.activityId === activityId);
    return of(items).pipe(delay(this.API_DELAY));
  }

  /**
   * GET /api/programs/{id}/budget (consolidado)
   */
  getBudgetByProgram(programId: number): Observable<BudgetItem[]> {
    const activityIds = this.activities
      .filter(a => a.programId === programId)
      .map(a => a.id);
    const items = this.budgetItems.filter(b => activityIds.includes(b.activityId));
    return of(items).pipe(delay(this.API_DELAY));
  }

  // ========== EXECUTIONS ==========

  /**
   * GET /api/activities/{id}/executions
   */
  getExecutionsByActivity(activityId: number): Observable<MonthlyExecution[]> {
    const executions = this.monthlyExecutions.filter(e => e.activityId === activityId);
    return of(executions).pipe(delay(this.API_DELAY));
  }

  /**
   * POST /api/activities/{id}/executions
   */
  createExecution(data: ExecutionFormData): Observable<MonthlyExecution> {
    // Validaciones
    const activity = this.activities.find(a => a.id === data.activityId);
    if (!activity) {
      return throwError(() => new Error('Actividad no encontrada'));
    }

    const program = this.programs.find(p => p.id === activity.programId);
    if (program?.estado === 'CERRADO') {
      return throwError(() => new Error('No se puede ejecutar en un programa cerrado'));
    }

    // Verificar que no se supere la meta
    const currentExecuted = this.monthlyExecutions
      .filter(e => e.activityId === data.activityId)
      .reduce((sum, e) => sum + e.metaEjecutada, 0);
    
    if (currentExecuted + data.metaEjecutada > activity.metaTotal) {
      return throwError(() => new Error(`La meta ejecutada superaría el total planeado (${activity.metaTotal})`));
    }

    // Verificar presupuesto
    const budgetItems = this.budgetItems.filter(b => b.activityId === data.activityId);
    const totalPlaneado = budgetItems.reduce((sum, b) => sum + b.planeado, 0);
    const totalEjecutado = budgetItems.reduce((sum, b) => sum + b.ejecutado, 0);
    
    if (totalEjecutado + data.valorEjecutado > totalPlaneado) {
      return throwError(() => new Error('El valor ejecutado superaría el presupuesto planeado'));
    }

    // Crear ejecución
    const newExecution: MonthlyExecution = {
      id: Math.max(...this.monthlyExecutions.map(e => e.id)) + 1,
      activityId: data.activityId,
      mes: data.mes,
      metaEjecutada: data.metaEjecutada,
      valorEjecutado: data.valorEjecutado,
      observaciones: data.observaciones
    };

    this.monthlyExecutions.push(newExecution);

    // Actualizar presupuesto ejecutado (distribución proporcional)
    if (budgetItems.length > 0 && data.valorEjecutado > 0) {
      const distribucion = data.valorEjecutado / budgetItems.length;
      budgetItems.forEach(item => {
        const idx = this.budgetItems.findIndex(b => b.id === item.id);
        if (idx !== -1) {
          this.budgetItems[idx].ejecutado += distribucion;
        }
      });
    }

    // Registrar auditoría
    this.auditService.log({
      entidad: 'MonthlyExecution',
      entidadId: newExecution.id,
      accion: 'CREATE',
      valorAnterior: null,
      valorNuevo: newExecution
    });

    return of(newExecution).pipe(delay(this.API_DELAY));
  }

  // ========== SCHEDULE ==========

  /**
   * GET /api/programs/{id}/schedule
   */
  getScheduleByProgram(programId: number): Observable<ScheduleRow[]> {
    const activityIds = this.activities
      .filter(a => a.programId === programId)
      .map(a => a.id);

    const plans = this.monthlyPlans.filter(p => activityIds.includes(p.activityId));
    const executions = this.monthlyExecutions.filter(e => activityIds.includes(e.activityId));

    const scheduleMap = new Map<number, ScheduleRow>();

    // Inicializar los 12 meses
    for (let mes = 1; mes <= 12; mes++) {
      scheduleMap.set(mes, {
        mes,
        nombreMes: MONTHS_NAMES[mes - 1],
        metaPlaneada: 0,
        metaEjecutada: 0,
        valorPlaneado: 0,
        valorEjecutado: 0
      });
    }

    // Agregar planes
    plans.forEach(plan => {
      const row = scheduleMap.get(plan.mes)!;
      row.metaPlaneada += plan.metaPlaneada;
      row.valorPlaneado += plan.valorPlaneado;
    });

    // Agregar ejecuciones
    executions.forEach(exec => {
      const row = scheduleMap.get(exec.mes)!;
      row.metaEjecutada += exec.metaEjecutada;
      row.valorEjecutado += exec.valorEjecutado;
    });

    return of(Array.from(scheduleMap.values())).pipe(delay(this.API_DELAY));
  }

  // ========== DASHBOARD ==========

  /**
   * GET /api/pat/2025/dashboard
   */
  getDashboardStats(): Observable<DashboardStats> {
    return this.getProgramsWithMetrics().pipe(
      map(programs => {
        const programasActivos = programs.filter(
          p => p.estado === 'EJECUCION' || p.estado === 'APROBADO'
        ).length;

        // Programas en riesgo: menos del 50% de avance y más del 60% del año transcurrido
        const mesActual = new Date().getMonth() + 1;
        const porcentajeAnioTranscurrido = (mesActual / 12) * 100;
        const programasEnRiesgo = programs.filter(
          p => p.estado === 'EJECUCION' && 
               p.metaEjecutadaPct < (porcentajeAnioTranscurrido - 10)
        ).length;

        const presupuestoTotal = programs.reduce((sum, p) => sum + p.totalPlaneado, 0);
        const presupuestoEjecutado = programs.reduce((sum, p) => sum + p.totalEjecutado, 0);

        const metaTotal = programs.reduce((sum, p) => sum + p.metaTotal, 0);
        const metaEjecutada = programs.reduce((sum, p) => sum + p.metaEjecutada, 0);

        return {
          totalProgramas: programs.length,
          programasActivos,
          programasEnRiesgo,
          avanceMetaGlobal: metaTotal > 0 ? Math.round((metaEjecutada / metaTotal) * 100) : 0,
          ejecucionPresupuestalGlobal: presupuestoTotal > 0 ? Math.round((presupuestoEjecutado / presupuestoTotal) * 100) : 0,
          presupuestoTotal,
          presupuestoEjecutado
        };
      })
    );
  }
}