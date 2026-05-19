// pat/pages/programs/programs.component.ts
import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  signal,
  computed,
} from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, finalize } from 'rxjs';
import { PatApiService } from '../../../../core/services/pat-api.service';
import { ProgramWithMetrics, ProgramStatus } from '../../models/pat.models';
import {
  getProgramStatusLabel,
  getProgramStatusClass,
  PROGRAM_STATUS_CONFIG,
} from '../../utils/pat-status.utils';
import { StatusBadgeComponent } from '../../components/status-badge/status-badge.component';
import { PatProgressBarComponent } from '../../components/progress-bar/progress-bar.component';

interface StatusFilterOption {
  value: ProgramStatus;
  label: string;
  icon: string;
}

const STATUS_FILTERS: StatusFilterOption[] = [
  { value: 'IN_PROGRESS', label: 'En Ejecución', icon: 'play_circle' },
  { value: 'APPROVED', label: 'Aprobado', icon: 'verified' },
  { value: 'DRAFT', label: 'Borrador', icon: 'edit_note' },
  { value: 'CLOSED', label: 'Cerrado', icon: 'lock' },
];

@Component({
  selector: 'app-programs',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    CurrencyPipe,
    StatusBadgeComponent,
    PatProgressBarComponent,
  ],
  templateUrl: './programs.component.html',
  styleUrl: './programs.component.scss',
})
export class ProgramsComponent implements OnInit, OnDestroy {
  private readonly patApi = inject(PatApiService);
  private readonly router = inject(Router);
  private readonly destroy$ = new Subject<void>();

  readonly statusFilters = STATUS_FILTERS;

  // ── Estado ────────────────────────────────────────────────
  programs = signal<ProgramWithMetrics[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  searchTerm = signal('');
  statusFilter = signal<ProgramStatus | null>(null);

  // ── Computed: filtros ─────────────────────────────────────
  filteredPrograms = computed(() => {
    let result = this.programs();

    const status = this.statusFilter();
    if (status) {
      result = result.filter((p) => p.status === status);
    }

    const term = this.searchTerm().toLowerCase().trim();
    if (term) {
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.code.toLowerCase().includes(term) ||
          p.areaName.toLowerCase().includes(term) ||
          p.employeeName.toLowerCase().includes(term)
      );
    }

    return result;
  });

  // ── Computed: métricas ────────────────────────────────────
  filteredCount = computed(() => this.filteredPrograms().length);

  totalBudget = computed(() =>
    this.filteredPrograms().reduce((sum, p) => sum + p.plannedBudget, 0)
  );

  totalExecuted = computed(() =>
    this.filteredPrograms().reduce((sum, p) => sum + p.executedBudget, 0)
  );

  averageGoalProgress = computed(() => {
    const progs = this.filteredPrograms();
    if (progs.length === 0) return 0;
    return Math.round(
      progs.reduce((s, p) => s + p.goalAchievedPct, 0) / progs.length
    );
  });

  averageBudgetProgress = computed(() => {
    const progs = this.filteredPrograms();
    if (progs.length === 0) return 0;
    return Math.round(
      progs.reduce((s, p) => s + p.budgetExecutedPct, 0) / progs.length
    );
  });

  hasActiveFilters = computed(
    () => this.statusFilter() !== null || this.searchTerm().trim() !== ''
  );

  ngOnInit(): void {
    this.loadPrograms();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadPrograms(): void {
    this.loading.set(true);
    this.error.set(null);

    this.patApi
      .getProgramsWithMetrics()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: (programs) => this.programs.set(programs),
        error: (err) =>
          this.error.set(
            err.error?.message ?? 'Error al cargar los programas'
          ),
      });
  }

  // ── Filtros ───────────────────────────────────────────────
  onSearchChange(value: string): void {
    this.searchTerm.set(value);
  }

  filterByStatus(status: ProgramStatus | null): void {
    this.statusFilter.set(status);
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.statusFilter.set(null);
  }

  countByStatus(status: ProgramStatus): number {
    return this.programs().filter((p) => p.status === status).length;
  }

  // ── Navegación ────────────────────────────────────────────
  createProgram(): void {
    this.router.navigate(['/pat/programs/create']);
  }

  // ── TrackBy ───────────────────────────────────────────────
  trackByProgramId(_: number, prog: ProgramWithMetrics): number {
    return prog.id;
  }

  trackByStatusValue(_: number, opt: StatusFilterOption): string {
    return opt.value;
  }

  // ── Delegación a utils ────────────────────────────────────
  getStatusLabel = getProgramStatusLabel;
  getStatusClass = getProgramStatusClass;
}