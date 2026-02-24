import {
  Activity,
  BudgetItem,
  MonthlyExecution,
  Program,
  ProgramWithMetrics,
  ActivityWithProgress,
  BudgetItemWithDiff,
  MonthlySchedule,
  DashboardStats,
  ValidationResult
} from '../../features/pat/models/pat.models';
import { MONTH_NAMES } from '../../core/data/mock-data';

/**
 * Utilidades de cálculo para el PAT
 * Todos los porcentajes se calculan, nunca se hardcodean
 */
export class PatCalculations {

  /**
   * Calcula el porcentaje de avance
   * @param ejecutado Valor ejecutado
   * @param planeado Valor planeado/meta
   * @returns Porcentaje de avance (0-100+)
   */
  static calculatePercentage(ejecutado: number, planeado: number): number {
    if (planeado === 0) return 0;
    return Math.round((ejecutado / planeado) * 100 * 100) / 100; // 2 decimales
  }

  /**
   * Calcula la meta ejecutada total de una actividad
   */
  static calculateActivityExecutedMeta(
    activityId: number,
    executions: MonthlyExecution[]
  ): number {
    return executions
      .filter(e => e.activityId === activityId)
      .reduce((sum, e) => sum + e.metaEjecutada, 0);
  }

  /**
   * Calcula el presupuesto ejecutado total de una actividad
   */
  static calculateActivityExecutedBudget(
    activityId: number,
    budgetItems: BudgetItem[]
  ): number {
    return budgetItems
      .filter(b => b.activityId === activityId)
      .reduce((sum, b) => sum + b.ejecutado, 0);
  }

  /**
   * Calcula el presupuesto planeado total de una actividad
   */
  static calculateActivityPlannedBudget(
    activityId: number,
    budgetItems: BudgetItem[]
  ): number {
    return budgetItems
      .filter(b => b.activityId === activityId)
      .reduce((sum, b) => sum + b.planeado, 0);
  }

  /**
   * Enriquece una actividad con sus métricas de progreso
   */
  static enrichActivityWithProgress(
    activity: Activity,
    executions: MonthlyExecution[],
    budgetItems: BudgetItem[]
  ): ActivityWithProgress {
    const metaEjecutada = this.calculateActivityExecutedMeta(activity.id, executions);
    const presupuestoPlaneado = this.calculateActivityPlannedBudget(activity.id, budgetItems);
    const presupuestoEjecutado = this.calculateActivityExecutedBudget(activity.id, budgetItems);

    return {
      ...activity,
      metaEjecutada,
      porcentajeAvance: this.calculatePercentage(metaEjecutada, activity.metaTotal),
      presupuestoPlaneado,
      presupuestoEjecutado
    };
  }

  /**
   * Enriquece un rubro con diferencia calculada
   */
  static enrichBudgetItemWithDiff(item: BudgetItem): BudgetItemWithDiff {
    return {
      ...item,
      diferencia: item.planeado - item.ejecutado,
      porcentajeEjecucion: this.calculatePercentage(item.ejecutado, item.planeado)
    };
  }

  /**
   * Calcula métricas agregadas para un programa
   */
  static calculateProgramMetrics(
    program: Program,
    activities: Activity[],
    budgetItems: BudgetItem[],
    executions: MonthlyExecution[]
  ): ProgramWithMetrics {
    const programActivities = activities.filter(a => a.programId === program.id);
    const programActivityIds = programActivities.map(a => a.id);

    // Calcular totales de metas
    const metaTotal = programActivities.reduce((sum, a) => sum + a.metaTotal, 0);
    const metaEjecutada = executions
      .filter(e => programActivityIds.includes(e.activityId))
      .reduce((sum, e) => sum + e.metaEjecutada, 0);

    // Calcular totales de presupuesto
    const programBudgetItems = budgetItems.filter(b => programActivityIds.includes(b.activityId));
    const totalPlaneado = programBudgetItems.reduce((sum, b) => sum + b.planeado, 0);
    const totalEjecutado = programBudgetItems.reduce((sum, b) => sum + b.ejecutado, 0);

    // Calcular si está en riesgo (menos del 50% de avance esperado según el mes actual)
    const mesActual = new Date().getMonth() + 1;
    const avanceEsperado = (mesActual / 12) * 100;
    const avanceReal = this.calculatePercentage(metaEjecutada, metaTotal);
    const enRiesgo = program.estado === 'EJECUCION' && avanceReal < (avanceEsperado * 0.7);

    return {
      ...program,
      metaTotal,
      metaEjecutada,
      porcentajeMeta: this.calculatePercentage(metaEjecutada, metaTotal),
      totalPlaneado,
      totalEjecutado,
      porcentajePresupuesto: this.calculatePercentage(totalEjecutado, totalPlaneado),
      enRiesgo
    };
  }

  /**
   * Calcula estadísticas globales del dashboard
   */
  static calculateDashboardStats(
    programs: Program[],
    activities: Activity[],
    budgetItems: BudgetItem[],
    executions: MonthlyExecution[]
  ): DashboardStats {
    const programsWithMetrics = programs.map(p =>
      this.calculateProgramMetrics(p, activities, budgetItems, executions)
    );

    const totalMeta = programsWithMetrics.reduce((sum, p) => sum + p.metaTotal, 0);
    const totalMetaEjecutada = programsWithMetrics.reduce((sum, p) => sum + p.metaEjecutada, 0);
    const presupuestoTotal = programsWithMetrics.reduce((sum, p) => sum + p.totalPlaneado, 0);
    const presupuestoEjecutado = programsWithMetrics.reduce((sum, p) => sum + p.totalEjecutado, 0);

    const programasActivos = programs.filter(p =>
      p.estado === 'EJECUCION' || p.estado === 'APROBADO'
    ).length;

    const programasEnRiesgo = programsWithMetrics.filter(p => p.enRiesgo).length;

    return {
      porcentajeAvanceMetas: this.calculatePercentage(totalMetaEjecutada, totalMeta),
      porcentajeEjecucionPresupuestal: this.calculatePercentage(presupuestoEjecutado, presupuestoTotal),
      programasActivos,
      programasEnRiesgo,
      totalProgramas: programs.length,
      presupuestoTotal,
      presupuestoEjecutado
    };
  }

  /**
   * Genera el cronograma mensual para una actividad
   */
  static generateMonthlySchedule(
    activity: Activity,
    executions: MonthlyExecution[],
    budgetItems: BudgetItem[]
  ): MonthlySchedule[] {
    const activityExecutions = executions.filter(e => e.activityId === activity.id);
    const totalPlaneado = this.calculateActivityPlannedBudget(activity.id, budgetItems);

    // Distribuir meta y presupuesto equitativamente por mes (simplificado)
    const metaMensualPlaneada = Math.round(activity.metaTotal / 12);
    const valorMensualPlaneado = Math.round(totalPlaneado / 12);

    return Array.from({ length: 12 }, (_, i) => {
      const mes = i + 1;
      const execution = activityExecutions.find(e => e.mes === mes);

      const metaEjecutada = execution?.metaEjecutada || 0;
      const valorEjecutado = execution?.valorEjecutado || 0;

      return {
        mes,
        nombreMes: MONTH_NAMES[i],
        metaPlaneada: metaMensualPlaneada,
        metaEjecutada,
        valorPlaneado: valorMensualPlaneado,
        valorEjecutado,
        porcentajeAvance: this.calculatePercentage(metaEjecutada, metaMensualPlaneada)
      };
    });
  }

  /**
   * Valida reglas de negocio para registro de ejecución
   */
  static validateExecution(
    activityId: number,
    mes: number,
    metaEjecutada: number,
    valorEjecutado: number,
    activity: Activity,
    existingExecutions: MonthlyExecution[],
    budgetItems: BudgetItem[],
    program: Program
  ): ValidationResult {
    const errors: string[] = [];

    // Regla 1: No ejecutar si el programa está cerrado
    if (program.estado === 'CERRADO') {
      errors.push('No se puede registrar ejecución en un programa CERRADO');
    }

    // Regla 2: No ejecutar si el programa está en borrador
    if (program.estado === 'BORRADOR') {
      errors.push('No se puede registrar ejecución en un programa en estado BORRADOR');
    }

    // Regla 3: Verificar que no se supere la meta total
    const metaActual = this.calculateActivityExecutedMeta(activityId, existingExecutions);
    const nuevaMetaTotal = metaActual + metaEjecutada;
    if (nuevaMetaTotal > activity.metaTotal) {
      errors.push(`La meta ejecutada (${nuevaMetaTotal}) superaría la meta total (${activity.metaTotal})`);
    }

    // Regla 4: Verificar que no se supere el presupuesto planeado
    const presupuestoPlaneado = this.calculateActivityPlannedBudget(activityId, budgetItems);
    const presupuestoActual = budgetItems
      .filter(b => b.activityId === activityId)
      .reduce((sum, b) => sum + b.ejecutado, 0);
    const nuevoPresupuesto = presupuestoActual + valorEjecutado;
    if (nuevoPresupuesto > presupuestoPlaneado) {
      errors.push(`El presupuesto ejecutado ($${nuevoPresupuesto.toLocaleString()}) superaría el planeado ($${presupuestoPlaneado.toLocaleString()})`);
    }

    // Regla 5: Verificar que el mes sea válido
    if (mes < 1 || mes > 12) {
      errors.push('El mes debe estar entre 1 y 12');
    }

    // Regla 6: Verificar valores positivos
    if (metaEjecutada < 0 || valorEjecutado < 0) {
      errors.push('Los valores ejecutados deben ser positivos');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Formatea un valor monetario
   */
  static formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }

  /**
   * Obtiene el color según el porcentaje de avance
   */
  static getProgressColor(percentage: number): string {
    if (percentage >= 80) return '#10b981'; // green
    if (percentage >= 50) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  }

  /**
   * Obtiene el color según el estado del programa
   */
  static getStateColor(state: string): string {
    const colors: Record<string, string> = {
      'BORRADOR': '#6b7280',
      'APROBADO': '#3b82f6',
      'EJECUCION': '#10b981',
      'CERRADO': '#8b5cf6'
    };
    return colors[state] || '#6b7280';
  }
}