import { Component, computed, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { PatDashboardBudget } from '@/app/core/models/pat/pat-dashboard.models';
import { AreaTreeChipsComponent } from '../../components/area-tree/area-tree-chips.component';
import { ProgramsSectionComponent } from './components/programs-section/programs-section.component';
import { TasksSectionComponent } from './components/tasks-section/tasks-section.component';
import { BudgetSectionComponent } from './components/budget-section/budget-section.component';
import { IndicatorProgressListComponent } from './components/indicator-progress-list/indicator-progress-list.component';

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
    AreaTreeChipsComponent,
    ProgramsSectionComponent,
    TasksSectionComponent,
    BudgetSectionComponent,
    IndicatorProgressListComponent,
  ],
  providers: [provideCharts(withDefaultRegisterables())],
  templateUrl: './home-dashboard.component.html',
})
export class PatHomeDashboardComponent {
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

  loadingBudget = signal(false);

  plannedValues = computed(() =>
    (this.budget()?.monthly ?? []).map((m) => m.planned),
  );
  executedValues = computed(() =>
    (this.budget()?.monthly ?? []).map((m) => m.executed),
  );

  onAreaChange(areaId: number | null): void {
    this.areaId.set(areaId);
    // A different area invalidates the program/task picks below it.
    this.programId.set(null);
    this.taskIds.set([]);
  }

  onProgramChange(ids: string[]): void {
    this.programId.set(ids.length > 0 ? Number(ids[0]) : null);
    this.taskIds.set([]);
  }

  onTasksChange(ids: string[]): void {
    this.taskIds.set(ids.map(Number));
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
