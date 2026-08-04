import { Component, effect, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatActivityService } from '@/app/core/services/pat/pat-activity.service';
import { LoadingSpinnerComponent } from '@/app/shared/components/loading-spinner/loading-spinner.component';
import { OnSaveBudgetMatrix } from '@/app/features/projects/components/budget-matrix-row/budget-matrix-row.component';
import { BudgetCalculationComponent } from '@/app/features/projects/components/budget-calculation.component';
import { PatActivityBudgetMatrix } from '@/app/core/models/pat/pat-models';

@Component({
  selector: 'app-pat-budget-tab',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent, BudgetCalculationComponent],
  templateUrl: './budget-tab.component.html',
})
export class PatBudgetTabComponent {
  private readonly service = inject(PatActivityService);
  activityId = input.required<number>();
  matrix = signal<PatActivityBudgetMatrix[]>([]);
  isLoading = signal(false);

  constructor() {
    effect(() => {
      const activityId = this.activityId();
      this.isLoading.set(true);
      this.service.findPresupuestalMatrix(activityId).subscribe((res) => {
        this.isLoading.set(false);
        this.matrix.set(res.data);
      });
    });
  }

  $onSave(c: OnSaveBudgetMatrix) {
    this.service
      .saveBudgetMatrix(this.activityId(), c.budgetCategory.id, c.budget)
      .subscribe((res) => {
        if (res.success) {
          const matrixMap = new Map(
            this.matrix().map((i) => [i.budgetCategory.id, i]),
          );
          matrixMap.set(res.data.budgetCategory.id, res.data);
          this.matrix.set(Array.from(matrixMap.values()));
        }
      });
  }
}
