import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { PatActivityTaskService } from '@/app/core/services/pat/pat-activity-task.service';
import { PatTaskMonthlyOverviewService } from '@/app/core/services/pat/pat-task-monthly-overview.service';
import {
  ExecutionOrPlaning,
  PatActivityTask,
} from '@/app/core/models/pat/pat-models';
import { LoadingSpinnerComponent } from '@/app/shared/components/loading-spinner/loading-spinner.component';
import { ExecutionPieChartComponent } from '@/app/shared/components/charts/execution-pie-chart/execution-pie-chart.component';
import { PlannedExecutedLineChartComponent } from '@/app/shared/components/charts/planned-executed-line-chart/planned-executed-line-chart.component';
import { MonthlyOverviewGridComponent } from './components/monthly-overview-grid/monthly-overview-grid.component';
import { PatTaskBudgetTabComponent } from './components/budget-tab/budget-tab.component';

type TabKey = 'execution' | 'plan' | 'budget';

@Component({
  selector: 'app-pat-task-detail',
  standalone: true,
  imports: [
    CommonModule,
    LoadingSpinnerComponent,
    ExecutionPieChartComponent,
    PlannedExecutedLineChartComponent,
    MonthlyOverviewGridComponent,
    PatTaskBudgetTabComponent,
  ],
  providers: [provideCharts(withDefaultRegisterables())],
  templateUrl: './task-detail.component.html',
})
export class PatTaskDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly taskService = inject(PatActivityTaskService);
  private readonly overviewService = inject(PatTaskMonthlyOverviewService);

  task = signal<PatActivityTask | null>(null);
  overview = signal<ExecutionOrPlaning[]>([]);
  loading = signal(true);

  plannedTotal = computed(() =>
    this.overview().reduce(
      (sum, m) =>
        sum + m.budgets.reduce((s, b) => s + (b.planning?.amount ?? 0), 0),
      0,
    ),
  );
  executedTotal = computed(() =>
    this.overview().reduce(
      (sum, m) =>
        sum + m.budgets.reduce((s, b) => s + (b.execution?.amount ?? 0), 0),
      0,
    ),
  );

  plannedByMonth = computed(() => {
    const values = new Array(12).fill(0);
    for (const m of this.overview()) {
      values[m.month - 1] = m.budgets.reduce(
        (s, b) => s + (b.planning?.amount ?? 0),
        0,
      );
    }
    return values;
  });
  executedByMonth = computed(() => {
    const values = new Array(12).fill(0);
    for (const m of this.overview()) {
      values[m.month - 1] = m.budgets.reduce(
        (s, b) => s + (b.execution?.amount ?? 0),
        0,
      );
    }
    return values;
  });

  activeTab = signal<TabKey>('execution');
  tabs: { key: TabKey; label: string }[] = [
    { key: 'execution', label: 'Ejecuciones' },
    { key: 'plan', label: 'Planeaciones' },
    { key: 'budget', label: 'Presupuesto' },
  ];

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.taskService.findById(id).subscribe({
      next: (res) => {
        if (res.success) {
          this.task.set(res.data);
        }
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });

    this.overviewService.findOverview(id).subscribe((res) => {
      if (res.success) this.overview.set(res.data);
    });
  }

  goBack(): void {
    const task = this.task();
    if (task) {
      this.router.navigate([
        `/pat/${task.activityYear}/activities`,
        task.activityId,
      ]);
    }
  }
}
