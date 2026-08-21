import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { PatDashboardService } from '@/app/core/services/pat/pat-dashboard.service';
import {
  PatDashboardBudget,
  PatDashboardIndicator,
} from '@/app/core/models/pat/pat-dashboard.models';
import {
  PatActivityTask,
  PatStrategicProgram,
} from '@/app/core/models/pat/pat-models';
import { ExecutionPieChartComponent } from '@/app/shared/components/charts/execution-pie-chart/execution-pie-chart.component';
import { PlannedExecutedLineChartComponent } from '@/app/shared/components/charts/planned-executed-line-chart/planned-executed-line-chart.component';
import { AreaTreeChipsComponent } from './components/area-tree-chips.component';
import { IndicatorProgressListComponent } from './components/indicator-progress-list.component';
import {
  SelectableItem,
  SelectableListComponent,
} from './components/selectable-list.component';

type SectionKey = 'budget' | 'programs' | 'indicators' | 'tasks';

/**
 * Interactive PAT dashboard. Selections cascade downwards: the area scopes
 * everything (including its descendant areas), the program narrows tasks,
 * budget and indicators, and the task selection narrows budget and
 * indicators further.
 */
@Component({
  selector: 'app-pat-home-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ExecutionPieChartComponent,
    PlannedExecutedLineChartComponent,
    AreaTreeChipsComponent,
    IndicatorProgressListComponent,
    SelectableListComponent,
  ],
  providers: [provideCharts(withDefaultRegisterables())],
  templateUrl: './home-dashboard.component.html',
})
export class PatHomeDashboardComponent {
  private readonly service = inject(PatDashboardService);

  year = input.required<number>();

  // ── Selections ────────────────────────────────────────────────────────
  areaId = signal<number | null>(null);
  programId = signal<number | null>(null);
  taskIds = signal<number[]>([]);

  // ── Section visibility ────────────────────────────────────────────────
  readonly sections: { key: SectionKey; label: string }[] = [
    { key: 'budget', label: 'Presupuesto' },
    { key: 'programs', label: 'Programas' },
    { key: 'indicators', label: 'Indicadores' },
    { key: 'tasks', label: 'Tareas' },
  ];
  visibleSections = signal<Set<SectionKey>>(
    new Set<SectionKey>(['budget', 'programs', 'indicators', 'tasks']),
  );

  // ── Data ──────────────────────────────────────────────────────────────
  budget = signal<PatDashboardBudget | null>(null);
  indicators = signal<PatDashboardIndicator[]>([]);
  programs = signal<PatStrategicProgram[]>([]);
  tasks = signal<PatActivityTask[]>([]);

  loadingBudget = signal(false);
  loadingIndicators = signal(false);
  loadingPrograms = signal(false);
  loadingTasks = signal(false);

  programItems = computed<SelectableItem[]>(() =>
    this.programs().map((p) => ({
      id: p.id,
      label: p.description || `Programa ${p.id}`,
      sublabel: `${p.startsAt} — ${p.endsAt}`,
    })),
  );

  taskItems = computed<SelectableItem[]>(() =>
    this.tasks().map((t) => ({
      id: t.id,
      label: t.name,
      sublabel: t.area?.name,
    })),
  );

  plannedValues = computed(() =>
    (this.budget()?.monthly ?? []).map((m) => m.planned),
  );
  executedValues = computed(() =>
    (this.budget()?.monthly ?? []).map((m) => m.executed),
  );

  constructor() {
    // Budget + indicators react to every selection.
    effect(() => {
      const filters = {
        year: this.year(),
        areaId: this.areaId(),
        programId: this.programId(),
        taskIds: this.taskIds(),
      };

      this.loadingBudget.set(true);
      this.service.findBudget(filters).subscribe({
        next: (res) => {
          if (res.success) this.budget.set(res.data);
          this.loadingBudget.set(false);
        },
        error: () => this.loadingBudget.set(false),
      });

      this.loadingIndicators.set(true);
      this.service.findIndicators(filters).subscribe({
        next: (res) => {
          if (res.success) this.indicators.set(res.data);
          this.loadingIndicators.set(false);
        },
        error: () => this.loadingIndicators.set(false),
      });
    });

    // Programs only depend on year + area.
    effect(() => {
      const filters = { year: this.year(), areaId: this.areaId() };
      this.loadingPrograms.set(true);
      this.service.findPrograms(filters).subscribe({
        next: (res) => {
          if (res.success) this.programs.set(res.data);
          this.loadingPrograms.set(false);
        },
        error: () => this.loadingPrograms.set(false),
      });
    });

    // Tasks additionally depend on the selected program.
    effect(() => {
      const filters = {
        year: this.year(),
        areaId: this.areaId(),
        programId: this.programId(),
      };
      this.loadingTasks.set(true);
      this.service.findTasks(filters).subscribe({
        next: (res) => {
          if (res.success) this.tasks.set(res.data);
          this.loadingTasks.set(false);
        },
        error: () => this.loadingTasks.set(false),
      });
    });
  }

  onAreaChange(areaId: number | null): void {
    this.areaId.set(areaId);
    // A different area invalidates the program/task picks below it.
    this.programId.set(null);
    this.taskIds.set([]);
  }

  onProgramChange(ids: number[]): void {
    this.programId.set(ids.length ? ids[0] : null);
    this.taskIds.set([]);
  }

  onTasksChange(ids: number[]): void {
    this.taskIds.set(ids);
  }

  isSectionVisible(key: SectionKey): boolean {
    return this.visibleSections().has(key);
  }

  toggleSection(key: SectionKey): void {
    const next = new Set(this.visibleSections());
    if (next.has(key)) next.delete(key);
    else next.add(key);
    this.visibleSections.set(next);
  }
}
