// core/services/pat-api.service.ts  (métodos añadidos)
import { Injectable, inject } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";
import {
  Program,
  ProgramWithMetrics,
  CreateProgramPayload,
  ActivityWithMetrics,
  BudgetItem,
  ScheduleRow,
  CreateExecutionPayload,
  ExecutionRecord,
  StrategicGoal,
  GoalLink,
  PerformanceIndicator,
  CreateIndicatorPayload,
  AreaConsolidation,
  DashboardStats,
  Training,
  EmployeeTrainingStats,
  UploadEvidencePayload,
  TrainingStatus,
  ReportConfig,
  ReportResult,
} from "../../features/pat/models/pat.models";
import { ApiResponse } from "../models/api-response.model";

@Injectable({ providedIn: "root" })
export class PatApiService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/pat`;

  // ── Programas ─────────────────────────────────────────────
  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.base}/dashboard/stats`);
  }
  getProgramsWithMetrics(): Observable<ApiResponse<ProgramWithMetrics[]>> {
    return this.http.get<ApiResponse<ProgramWithMetrics[]>>(
      `${this.base}/programs/with-metrics`,
    );
  }
  getProgramById(id: number): Observable<ApiResponse<Program>> {
    return this.http.get<ApiResponse<Program>>(`${this.base}/programs/${id}`);
  }
  createProgram(
    payload: CreateProgramPayload,
  ): Observable<ApiResponse<Program>> {
    return this.http.post<ApiResponse<Program>>(
      `${this.base}/programs`,
      payload,
    );
  }
  updateProgram(
    id: number,
    payload: Partial<CreateProgramPayload>,
  ): Observable<ApiResponse<Program>> {
    return this.http.patch<ApiResponse<Program>>(
      `${this.base}/programs/${id}`,
      payload,
    );
  }

  // ── Actividades ───────────────────────────────────────────
  getActivitiesWithMetrics(
    programId: number,
  ): Observable<ApiResponse<ActivityWithMetrics[]>> {
    return this.http.get<ApiResponse<ActivityWithMetrics[]>>(
      `${this.base}/programs/${programId}/with-metrics`,
    );
  }

  // ── Presupuesto ───────────────────────────────────────────
  getBudgetByProgram(programId: number): Observable<BudgetItem[]> {
    return new Observable<BudgetItem[]>((subscriber) => {
      subscriber.complete();
    });
  }

  // ── Cronograma ────────────────────────────────────────────
  getScheduleByProgram(programId: number): Observable<ScheduleRow[]> {
    return this.http.get<ScheduleRow[]>(
      `${this.base}/executions/program/${programId}/schedule`,
    );
  }

  // ── Ejecución ─────────────────────────────────────────────
  createExecution(
    payload: CreateExecutionPayload,
  ): Observable<ExecutionRecord> {
    return this.http.post<ExecutionRecord>(`${this.base}/executions`, payload);
  }

  // ── Metas Estratégicas ────────────────────────────────────
  getStrategicGoals(year?: number): Observable<StrategicGoal[]> {
    const params = year ? new HttpParams().set("year", year) : undefined;
    return this.http.get<StrategicGoal[]>(`${this.base}/strategic-goals`, {
      params,
    });
  }
  getGoalLinks(programId: number): Observable<GoalLink[]> {
    return this.http.get<GoalLink[]>(
      `${this.base}/programs/${programId}/goal-links`,
    );
  }
  createGoalLink(payload: {
    strategicGoalId: number;
    linkType: string;
    weight: number;
    programId?: number;
    activityId?: number;
  }): Observable<GoalLink> {
    return this.http.post<GoalLink>(`${this.base}/goal-links`, payload);
  }
  deleteGoalLink(linkId: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/goal-links/${linkId}`);
  }

  // ── Indicadores ───────────────────────────────────────────
  getIndicatorsByProgram(
    programId: number,
  ): Observable<PerformanceIndicator[]> {
    return this.http.get<PerformanceIndicator[]>(
      `${this.base}/programs/${programId}/indicators`,
    );
  }
  createIndicator(
    payload: CreateIndicatorPayload,
  ): Observable<PerformanceIndicator> {
    return this.http.post<PerformanceIndicator>(
      `${this.base}/indicators`,
      payload,
    );
  }
  updateIndicatorValue(
    id: number,
    currentValue: number,
  ): Observable<PerformanceIndicator> {
    return this.http.patch<PerformanceIndicator>(
      `${this.base}/indicators/${id}/value`,
      { currentValue },
    );
  }

  // ── Consolidado por área ──────────────────────────────────
  getAreaConsolidation(year: number): Observable<AreaConsolidation[]> {
    return this.http.get<AreaConsolidation[]>(
      `${this.base}/area-consolidation`,
      { params: new HttpParams().set("year", year) },
    );
  }

  // ── Capacitaciones ────────────────────────────────────────
  getTrainings(year: number): Observable<Training[]> {
    return this.http.get<Training[]>(`${this.base}/trainings`, {
      params: new HttpParams().set("year", year),
    });
  }
  createTraining(
    payload: Partial<Training> & { year: number },
  ): Observable<Training> {
    return this.http.post<Training>(`${this.base}/trainings`, payload);
  }
  getEmployeeTrainingStats(year: number): Observable<EmployeeTrainingStats[]> {
    return this.http.get<EmployeeTrainingStats[]>(
      `${this.base}/trainings/employee-stats`,
      { params: new HttpParams().set("year", year) },
    );
  }
  updateParticipantStatus(
    participantId: number,
    status: TrainingStatus,
  ): Observable<void> {
    return this.http.patch<void>(
      `${this.base}/training-participants/${participantId}/status`,
      { status },
    );
  }
  uploadTrainingEvidence(payload: UploadEvidencePayload): Observable<void> {
    const formData = new FormData();
    formData.append("file", payload.file);
    formData.append("completionDate", payload.completionDate);
    if (payload.score != null) {
      formData.append("score", String(payload.score));
    }
    return this.http.post<void>(
      `${this.base}/training-participants/${payload.participantId}/evidence`,
      formData,
    );
  }

  // ── Reportes ──────────────────────────────────────────────
  generateReport(config: ReportConfig): Observable<ReportResult> {
    return this.http.post<ReportResult>(
      `${this.base}/reports/generate`,
      config,
    );
  }
  getRecentReports(): Observable<ReportResult[]> {
    return this.http.get<ReportResult[]>(`${this.base}/reports/recent`);
  }
}
