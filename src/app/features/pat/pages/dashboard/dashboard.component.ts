// import { Component, OnInit, inject, signal, computed } from '@angular/core';
// import { CommonModule, CurrencyPipe } from '@angular/common';
// import { Router, RouterLink } from '@angular/router';
// import { PatApiService } from '../../../../core/services/pat-api.service';
// import { AuthService } from '../../../../core/services/auth.service';
// import { DashboardStats, ProgramWithMetrics, ProgramStatus } from '../../models/pat.models';

// @Component({
//   selector: 'app-dashboard',
//   imports: [CommonModule, RouterLink, CurrencyPipe],
//   templateUrl: './dashboard.component.html',
//   styleUrl: './dashboard.component.scss'
// })
// export class DashboardComponent implements OnInit {
//   stats = signal<DashboardStats | null>(null);
//   programs = signal<ProgramWithMetrics[]>([]);
//   loading = signal(true);

//   topPrograms = computed(() =>
//     this.programs()
//       .filter(p => p.status === 'IN_PROGRESS' || p.status === 'APPROVED')
//       .slice(0, 4)
//   );

//   statusSummary = computed(() => {
//     const progs = this.programs();
//     const statuses: Array<{ status: ProgramStatus; label: string; count: number; budget: number }> = [
//       { status: 'IN_PROGRESS', label: 'En Ejecución', count: 0, budget: 0 },
//       { status: 'APPROVED', label: 'Aprobados', count: 0, budget: 0 },
//       { status: 'DRAFT', label: 'Borrador', count: 0, budget: 0 },
//       { status: 'CLOSED', label: 'Cerrados', count: 0, budget: 0 }
//     ];

//     progs.forEach(p => {
//       const s = statuses.find(s => s.status === p.status);
//       if (s) {
//         s.count++;
//         s.budget += p.plannedBudget;
//       }
//     });

//     return statuses;
//   });

//   private readonly router = inject(Router);
//   readonly auth = inject(AuthService);

//   constructor(private patApi: PatApiService) {}

//   createProgram(): void {
//     this.router.navigate(["/pat/programs/create"]);
//   }

//   ngOnInit(): void {
//     this.loadDashboard();
//   }

//   loadDashboard(): void {
//     this.loading.set(true);

//     this.patApi.getDashboardStats().subscribe(stats => {
//       this.stats.set(stats);
//     });

//     this.patApi.getProgramsWithMetrics().subscribe(programs => {
//       this.programs.set(programs);
//       this.loading.set(false);
//     });
//   }

//   getStatusLabel(status: string): string {
//     const labels: Record<string, string> = {
//       'DRAFT': 'Borrador',
//       'APPROVED': 'Aprobado',
//       'IN_PROGRESS': 'En Ejecución',
//       'CLOSED': 'Cerrado'
//     };
//     return labels[status] || status;
//   }

//   getStatusClass(status: string): string {
//     const map: Record<string, string> = {
//       'DRAFT': 'borrador',
//       'APPROVED': 'aprobado',
//       'IN_PROGRESS': 'ejecucion',
//       'CLOSED': 'cerrado'
//     };
//     return map[status] ?? status.toLowerCase();
//   }
// }


// pat/pages/dashboard/dashboard.component.ts
import {
  Component, OnInit, inject, signal, computed
} from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { PatApiService } from '../../../../core/services/pat-api.service';
import { AuthService } from '../../../../core/services/auth.service';
import {
  DashboardStats, ProgramWithMetrics, ProgramStatus
} from '../../models/pat.models';
import {
  getProgramStatusLabel, getProgramStatusClass, getProgressColor
} from '../../utils/pat-status.utils';
import { StatusBadgeComponent } from '../../components/status-badge/status-badge.component';
import { PatProgressBarComponent } from '../../components/progress-bar/progress-bar.component';
import { KpiCardComponent, KpiCardConfig } from '../../components/kpi-card/kpi-card.component';
import { AreaConsolidationPanelComponent } from '../../components/area-consolidation-panel/area-consolidation-panel.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, RouterLink, CurrencyPipe,
    StatusBadgeComponent, PatProgressBarComponent,
    KpiCardComponent, AreaConsolidationPanelComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  private readonly patApi  = inject(PatApiService);
  private readonly router  = inject(Router);
  readonly auth            = inject(AuthService);

  stats    = signal<DashboardStats | null>(null);
  programs = signal<ProgramWithMetrics[]>([]);
  loading  = signal(true);

  // ── KPIs computados ───────────────────────────────────────
  kpis = computed<KpiCardConfig[]>(() => {
    const s = this.stats();
    if (!s) return [];
    return [
      {
        title:      'Programas Activos',
        value:      s.activePrograms,
        subtitle:   `de ${s.totalPrograms} totales`,
        icon:       'folder_open',
        colorClass: 'primary',
      },
      {
        title:      'Ejecución Presupuestal',
        value:      `${s.budgetExecutionPct}%`,
        subtitle:   `${s.totalBudgetExecuted.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })} ejecutados`,
        icon:       'account_balance_wallet',
        colorClass: s.budgetExecutionPct >= 80 ? 'success' : s.budgetExecutionPct >= 50 ? 'warning' : 'danger',
        trend:      { value: s.budgetExecutionPct, positive: s.budgetExecutionPct >= 70 },
      },
      {
        title:      'Avance General Metas',
        value:      `${s.overallGoalPct}%`,
        subtitle:   'Acumulado del período',
        icon:       'flag',
        colorClass: s.overallGoalPct >= 80 ? 'success' : s.overallGoalPct >= 50 ? 'warning' : 'danger',
      },
      {
        title:      'Plan Formativo',
        value:      `${s.trainingsCompletionPct}%`,
        subtitle:   'Cumplimiento capacitaciones',
        icon:       'school',
        colorClass: 'info',
      },
      {
        title:      'Metas Estratégicas',
        value:      `${s.strategicGoalsOnTrack}/${s.strategicGoalsCount}`,
        subtitle:   'En seguimiento',
        icon:       'gps_fixed',
        colorClass: 'success',
      },
    ];
  });

  // ── Top programas en ejecución ─────────────────────────────
  topPrograms = computed(() =>
    this.programs()
      .filter(p => p.status === 'IN_PROGRESS' || p.status === 'APPROVED')
      .sort((a, b) => b.goalAchievedPct - a.goalAchievedPct)
      .slice(0, 5)
  );

  // ── Resumen por estado ─────────────────────────────────────
  statusSummary = computed(() => {
    const progs = this.programs();
    return (['IN_PROGRESS', 'APPROVED', 'DRAFT', 'CLOSED'] as ProgramStatus[]).map(status => ({
      status,
      label:  getProgramStatusLabel(status),
      count:  progs.filter(p => p.status === status).length,
      budget: progs.filter(p => p.status === status).reduce((s, p) => s + p.plannedBudget, 0),
    }));
  });

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading.set(true);
    this.patApi.getDashboardStats().subscribe(s => this.stats.set(s));
    this.patApi.getProgramsWithMetrics().subscribe(p => {
      this.programs.set(p);
      this.loading.set(false);
    });
  }

  createProgram(): void {
    this.router.navigate(['/pat/programs/create']);
  }

  getProgressColor(pct: number): string {
    return getProgressColor(pct);
  }

  getStatusClass = getProgramStatusClass;
}