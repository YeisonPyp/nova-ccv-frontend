import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatActivityTaskService } from '@/app/core/services/pat/pat-activity-task.service';
import { PatMonthlyTaskExecution } from '@/app/core/models/pat/pat-dashboard.models';
import { PlannedExecutedBarChartComponent } from '@/app/shared/components/charts/planned-executed-bar-chart/planned-executed-bar-chart.component';
import { LoadingSpinnerComponent } from '@/app/shared/components/loading-spinner/loading-spinner.component';

/**
 * Monthly task execution: how many tasks each month was supposed to move
 * forward against how many actually did. A task counts for a month when its
 * management indicator has a planned (resp. executed) quantity for it, which
 * is what marks the task as worked on that month.
 */
@Component({
  selector: 'app-task-execution-section',
  standalone: true,
  imports: [
    CommonModule,
    PlannedExecutedBarChartComponent,
    LoadingSpinnerComponent,
  ],
  templateUrl: './task-execution-section.component.html',
})
export class TaskExecutionSectionComponent {
  private readonly service = inject(PatActivityTaskService);

  year = input.required<number>();
  areaId = input<number | null>(null);
  programId = input<number | null>(null);
  taskIds = input<number[]>([]);

  loading = signal(false);
  months = signal<PatMonthlyTaskExecution[]>([]);

  /** The endpoint always returns the 12 months, but never trust that. */
  private readonly byMonth = computed(() => {
    const map = new Map(this.months().map((m) => [m.month, m]));
    return Array.from({ length: 12 }, (_, i) => map.get(i + 1) ?? null);
  });

  plannedValues = computed(() =>
    this.byMonth().map((m) => m?.plannedTasks ?? 0),
  );
  executedValues = computed(() =>
    this.byMonth().map((m) => m?.executedTasks ?? 0),
  );

  totalPlanned = computed(() =>
    this.plannedValues().reduce((sum, v) => sum + v, 0),
  );
  totalExecuted = computed(() =>
    this.executedValues().reduce((sum, v) => sum + v, 0),
  );

  constructor() {
    effect(() => {
      this.loading.set(true);
      this.service
        .findMonthlyExecution({
          year: this.year(),
          areaId: this.areaId(),
          programId: this.programId(),
          taskIds: this.taskIds(),
        })
        .subscribe({
          next: (res) => {
            this.months.set(res.data ?? []);
            this.loading.set(false);
          },
          error: () => this.loading.set(false),
        });
    });
  }
}
