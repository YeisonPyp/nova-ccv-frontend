import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { PatActivityTaskService } from '@/app/core/services/pat/pat-activity-task.service';
import { PatActivityTaskBudgetService } from '@/app/core/services/pat/pat-activity-task-budget.service';
import { PatActivityService } from '@/app/core/services/pat/pat-activity.service';
import {
  BudgetCategory,
  PatActivityTask,
} from '@/app/core/models/pat/pat-models';
import { LoadingSpinnerComponent } from '@/app/shared/components/loading-spinner/loading-spinner.component';
import { ExecutionPieChartComponent } from '@/app/shared/components/charts/execution-pie-chart/execution-pie-chart.component';
import { TaskBudgetMonthlyTabComponent } from './components/budget-monthly-tab/budget-monthly-tab.component';

type TabKey = 'execution' | 'plan';

@Component({
  selector: 'app-pat-task-detail',
  standalone: true,
  imports: [
    CommonModule,
    LoadingSpinnerComponent,
    ExecutionPieChartComponent,
    TaskBudgetMonthlyTabComponent,
  ],
  providers: [provideCharts(withDefaultRegisterables())],
  templateUrl: './task-detail.component.html',
})
export class PatTaskDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly taskService = inject(PatActivityTaskService);
  private readonly taskBudgetService = inject(PatActivityTaskBudgetService);
  private readonly activityService = inject(PatActivityService);

  task = signal<PatActivityTask | null>(null);
  rubros = signal<BudgetCategory[]>([]);
  loading = signal(true);

  plannedTotal = signal(0);
  executedTotal = signal(0);

  activeTab = signal<TabKey>('execution');
  tabs: { key: TabKey; label: string }[] = [
    { key: 'execution', label: 'Ejecuciones' },
    { key: 'plan', label: 'Planeaciones' },
  ];

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.taskService.findById(id).subscribe({
      next: (res) => {
        if (res.success) {
          this.task.set(res.data);
          this.loadRubros(res.data.activityId);
          this.loadTotals(id);
        }
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  private loadRubros(activityId: number): void {
    this.activityService.findPresupuestalMatrix(activityId).subscribe((res) => {
      if (res.success) {
        this.rubros.set(res.data.map((m) => m.budgetCategory));
      }
    });
  }

  private loadTotals(taskId: number): void {
    this.taskBudgetService.findPlan(taskId).subscribe((res) => {
      if (res.success) {
        this.plannedTotal.set(
          res.data.reduce((sum, r) => sum + r.plannedAmount, 0),
        );
      }
    });
    this.taskBudgetService.findExecution(taskId).subscribe((res) => {
      if (res.success) {
        this.executedTotal.set(
          res.data.reduce((sum, r) => sum + r.amount, 0),
        );
      }
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
