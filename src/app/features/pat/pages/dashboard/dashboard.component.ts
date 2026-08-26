import {
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { CommonModule, NgComponentOutlet } from '@angular/common';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { AuthService } from '../../../../core/services/auth.service';
import { ProgramsAndAdendasSectionComponent } from '../../components/programs-and-adendas-section/programs-and-adendas-section.component';
import { TacticalActivitiesTabComponent } from '../../components/tactical-activities-tab/tactical-activities-tab.component';
import { TasksTabComponent } from '../../components/tasks-tab/tasks-tab.component';
import { AreaBudgetReportComponent } from '../activity-report/components/area-budget-report/area-budget-report.component';
import { AreaTreeChipsComponent } from '../../components/area-tree/area-tree-chips.component';
import { PatActivityService } from '@/app/core/services/pat/pat-activity.service';
import { PatReportService } from '@/app/core/services/pat/pat-report.service';
import { MonthlyBudgetTotals } from '@/app/core/models/pat/pat-report-models';
import { ExecutionPieChartComponent } from '@/app/shared/components/charts/execution-pie-chart/execution-pie-chart.component';
import { PlannedExecutedLineChartComponent } from '@/app/shared/components/charts/planned-executed-line-chart/planned-executed-line-chart.component';

type TabKey = 'programs' | 'tacticalActivities' | 'tasks';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    AreaTreeChipsComponent,
    ExecutionPieChartComponent,
    PlannedExecutedLineChartComponent,
    NgComponentOutlet,
  ],
  providers: [provideCharts(withDefaultRegisterables())],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent {
  readonly auth = inject(AuthService);
  private readonly activityService = inject(PatActivityService);
  private readonly reportService = inject(PatReportService);
  readonly activeTab = signal<TabKey>('tacticalActivities');

  year = input.required<number>();

  uploading = signal(false);
  uploadError = signal<string | null>(null);

  selectedAreaId = signal<number | null>(null);

  monthlyTotals = signal<MonthlyBudgetTotals[]>([]);

  totalPlanned = computed(() =>
    this.monthlyTotals().reduce((sum, m) => sum + (m.plannedBudget ?? 0), 0),
  );
  totalExecuted = computed(() =>
    this.monthlyTotals().reduce((sum, m) => sum + (m.executedBudget ?? 0), 0),
  );
  executionPct = computed(() => {
    const planned = this.totalPlanned();
    if (!planned) return null;
    return (this.totalExecuted() / planned) * 100;
  });
  plannedValues = computed(() =>
    this.monthlyTotalsSorted().map((m) => m.plannedBudget ?? 0),
  );
  executedValues = computed(() =>
    this.monthlyTotalsSorted().map((m) => m.executedBudget ?? 0),
  );

  private monthlyTotalsSorted = computed(() => {
    const byMonth = new Map(this.monthlyTotals().map((m) => [m.month, m]));
    return Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      return (
        byMonth.get(month) ?? { month, plannedBudget: 0, executedBudget: 0 }
      );
    });
  });

  readonly tabs: { key: TabKey; label: string }[] = [
    { key: 'tacticalActivities', label: 'Actividades Tácticas' },
    { key: 'tasks', label: 'Tareas' },
    { key: 'programs', label: 'Programas Estratégicos' },
  ];

  readonly tabsComponent = {
    programs: ProgramsAndAdendasSectionComponent,
    tacticalActivities: TacticalActivitiesTabComponent,
    tasks: TasksTabComponent,
  };

  readonly tabsInputs = computed<Record<TabKey, any>>(() => {
    return {
      programs: { year: this.year() },
      tacticalActivities: { year: this.year(), areaId: this.selectedAreaId() },
      tasks: { year: this.year(), areaId: this.selectedAreaId() },
    };
  });

  activeTabInputs = computed(() => this.tabsInputs()[this.activeTab()]);

  activeTabComponent = computed(() => this.tabsComponent[this.activeTab()]);

  constructor() {
    effect(() => {
      const year = this.year();
      const areaId = this.selectedAreaId();
      this.reportService
        .findMonthlyBudgetTotals(year, areaId)
        .subscribe((res) => {
          if (res.success && res.data) this.monthlyTotals.set(res.data);
        });
    });
  }

  setTab(t: TabKey) {
    this.activeTab.set(t);
  }

  selectArea(areaId: number | null) {
    this.selectedAreaId.set(areaId);
  }

  onSeedFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.uploading.set(true);
    this.uploadError.set(null);

    this.activityService.seedFromFile(this.year(), file).subscribe({
      next: () => {
        this.uploading.set(false);
        input.value = '';
        window.location.reload();
      },
      error: (err) => {
        this.uploading.set(false);
        input.value = '';
        this.uploadError.set(
          err.error?.message ?? 'Error al cargar el archivo',
        );
      },
    });
  }
}
