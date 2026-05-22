// pat/pages/dashboard/dashboard.component.ts
import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  signal,
  computed,
} from "@angular/core";
import { CommonModule, CurrencyPipe } from "@angular/common";
import { Router, RouterLink } from "@angular/router";
import { Subject, forkJoin, takeUntil, finalize } from "rxjs";
import { PatApiService } from "../../../../core/services/pat-api.service";
import { AuthService } from "../../../../core/services/auth.service";
import {
  DashboardStats,
  ProgramWithMetrics,
  ProgramStatus,
} from "../../models/pat.models";
import {
  getProgramStatusLabel,
  getProgramStatusClass,
} from "../../utils/pat-status.utils";
import { StatusBadgeComponent } from "../../components/status-badge/status-badge.component";
import { PatProgressBarComponent } from "../../components/progress-bar/progress-bar.component";
import {
  KpiCardComponent,
  KpiCardConfig,
} from "../../components/kpi-card/kpi-card.component";
import { AreaConsolidationPanelComponent } from "../../components/area-consolidation-panel/area-consolidation-panel.component";

@Component({
  selector: "app-dashboard",
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    CurrencyPipe,
    StatusBadgeComponent,
    PatProgressBarComponent,
    KpiCardComponent,
    AreaConsolidationPanelComponent,
  ],
  templateUrl: "./dashboard.component.html",
  styleUrl: "./dashboard.component.scss",
})
export class DashboardComponent implements OnInit, OnDestroy {
  private readonly patApi = inject(PatApiService);
  private readonly router = inject(Router);
  private readonly destroy$ = new Subject<void>();

  readonly auth = inject(AuthService);

  stats = signal<DashboardStats | null>(null);
  programs = signal<ProgramWithMetrics[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  // ── KPIs computados ───────────────────────────────────────
  kpis = computed<KpiCardConfig[]>(() => {
    const s = this.stats();
    if (!s) return [];

    return [
      {
        title: "Programas Activos",
        value: s.activePrograms,
        subtitle: `de ${s.totalPrograms} totales`,
        icon: "folder_open",
        colorClass: "primary",
      },
      {
        title: "Ejecución Presupuestal",
        value: `${s.budgetExecutionPct}%`,
        subtitle: this.formatCurrency(s.totalBudgetExecuted) + " ejecutados",
        icon: "account_balance_wallet",
        colorClass: this.getKpiColor(s.budgetExecutionPct),
        trend: {
          value: s.budgetExecutionPct,
          positive: s.budgetExecutionPct >= 70,
        },
      },
      {
        title: "Avance General Metas",
        value: `${s.overallGoalPct}%`,
        subtitle: "Acumulado del período",
        icon: "flag",
        colorClass: this.getKpiColor(s.overallGoalPct),
      },
      {
        title: "Plan Formativo",
        value: `${s.trainingsCompletionPct}%`,
        subtitle: "Cumplimiento capacitaciones",
        icon: "school",
        colorClass: "info",
      },
      {
        title: "Metas Estratégicas",
        value: `${s.strategicGoalsOnTrack}/${s.strategicGoalsCount}`,
        subtitle: "En seguimiento",
        icon: "gps_fixed",
        colorClass: "success",
      },
    ];
  });

  // ── Top programas ─────────────────────────────────────────
  topPrograms = computed(() =>
    this.programs()
      .filter((p) => p.status === "IN_PROGRESS" || p.status === "APPROVED")
      .sort((a, b) => b.goalAchievedPct - a.goalAchievedPct)
      .slice(0, 5),
  );

  hasTopPrograms = computed(() => this.topPrograms().length > 0);

  // ── Resumen por estado ────────────────────────────────────
  statusSummary = computed(() => {
    const progs = this.programs();

    return (
      ["IN_PROGRESS", "APPROVED", "DRAFT", "CLOSED"] as ProgramStatus[]
    ).map((status) => {
      const filtered = progs.filter((p) => p.status === status);
      return {
        status,
        label: getProgramStatusLabel(status),
        cssClass: getProgramStatusClass(status),
        count: filtered.length,
        budget: filtered.reduce((sum, p) => sum + p.plannedBudget, 0),
      };
    });
  });

  // ── Resumen general ───────────────────────────────────────
  totalPrograms = computed(() => this.programs().length);

  ngOnInit(): void {
    this.loadDashboard();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDashboard(): void {
    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      stats: this.patApi.getDashboardStats(),
      programs: this.patApi.getProgramsWithMetrics(),
    })
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loading.set(false)),
      )
      .subscribe({
        next: ({ stats, programs }) => {
          this.stats.set(stats);
          this.programs.set(programs);
        },
        error: (err) => {
          this.error.set(
            err.error?.message ?? "Error al cargar el tablero de control",
          );
        },
      });
  }

  createProgram(): void {
    this.router.navigate(["/pat/programs/create"]);
  }

  trackByProgramId(_: number, prog: ProgramWithMetrics): number {
    return prog.id;
  }

  trackByKpiTitle(_: number, kpi: KpiCardConfig): string {
    return kpi.title;
  }

  trackByStatus(_: number, item: { status: ProgramStatus }): ProgramStatus {
    return item.status;
  }

  private getKpiColor(pct: number): "success" | "warning" | "danger" {
    if (pct >= 80) return "success";
    if (pct >= 50) return "warning";
    return "danger";
  }

  private formatCurrency(value: number): string {
    return value.toLocaleString("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    });
  }
}
