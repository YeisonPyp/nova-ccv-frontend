import { PatDashboardBudget } from '@/app/core/models/pat/pat-dashboard.models';
import { PatManagementIndicatorService } from '@/app/core/services/pat/pat-management-indicator.service';
import { PatPresupuestalCategoryService } from '@/app/core/services/pat/pat-presupuestal-category.service';
import { ExecutionPieChartComponent } from '@/app/shared/components/charts/execution-pie-chart/execution-pie-chart.component';
import { PlannedExecutedLineChartComponent } from '@/app/shared/components/charts/planned-executed-line-chart/planned-executed-line-chart.component';
import { LoadingSpinnerComponent } from '@/app/shared/components/loading-spinner/loading-spinner.component';
import {
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';

@Component({
  selector: 'app-budget-section',
  standalone: true,
  imports: [
    ExecutionPieChartComponent,
    PlannedExecutedLineChartComponent,
    LoadingSpinnerComponent,
  ],
  templateUrl: './budget-section.component.html',
})
export class BudgetSectionComponent {
  private readonly service = inject(PatPresupuestalCategoryService);

  year = input.required<number>();
  areaId = input<number | null>(null);
  programId = input<number | null>(null);
  taskIds = input<number[]>([]);

  budget = signal<PatDashboardBudget | null>(null);

  loading = signal(false);

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

      this.loading.set(true);
      this.service.findSummary(filters).subscribe({
        next: (res) => {
          if (res.success) this.budget.set(res.data);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
    });
  }
}
