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
import { MonthlyOverviewGridComponent } from './components/monthly-overview-grid/monthly-overview-grid.component';
import { RegisterMonthlyOverviewModalComponent } from './components/register-monthly-overview-modal/register-monthly-overview-modal.component';

type TabKey = 'execution' | 'plan';

@Component({
  selector: 'app-pat-task-detail',
  standalone: true,
  imports: [
    CommonModule,
    LoadingSpinnerComponent,
    ExecutionPieChartComponent,
    MonthlyOverviewGridComponent,
    RegisterMonthlyOverviewModalComponent,
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

  activeTab = signal<TabKey>('execution');
  tabs: { key: TabKey; label: string }[] = [
    { key: 'execution', label: 'Ejecuciones' },
    { key: 'plan', label: 'Planeaciones' },
  ];

  registerModalOpen = signal(false);
  registerMonth = signal(1);

  registerData = computed(() => {
    const month = this.registerMonth();
    return (
      this.overview().find((m) => m.month === month) ?? {
        month,
        budgets: [],
        products: [],
        benefits: [],
        indicators: [],
      }
    );
  });

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

  openRegister(month: number): void {
    this.registerMonth.set(month);
    this.registerModalOpen.set(true);
  }

  closeRegister(): void {
    this.registerModalOpen.set(false);
  }

  onOverviewSaved(updated: ExecutionOrPlaning): void {
    this.overview.update((list) =>
      list.map((m) => (m.month === updated.month ? updated : m)),
    );
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
