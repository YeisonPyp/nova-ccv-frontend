import { Component, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatActivityService } from '@/app/core/services/pat/pat-activity.service';
import { PatActivityBudgetMatrix } from '@/app/core/models/pat/pat-models';
import { BudgetCalculationComponent } from '@/app/features/projects/components/budget-calculation.component';
import { OnSaveBudgetMatrix } from '@/app/features/projects/components/budget-matrix-row/budget-matrix-row.component';

@Component({
  selector: 'app-budget-tab',
  standalone: true,
  imports: [CommonModule, BudgetCalculationComponent],
  templateUrl: './budget-tab.component.html',
})
export class BudgetTabComponent {
  service = inject(PatActivityService);
  activityId = input.required<number>();
  matrix = input.required<PatActivityBudgetMatrix[]>();

  onSave = output<PatActivityBudgetMatrix>();

  $onSave(c: OnSaveBudgetMatrix) {
    this.service
      .saveBudgetMatrix(this.activityId(), c.budgetCategory.id, c.budget)
      .subscribe({
        next: (res) => {
          if (res.data) {
            // this.matrix.update((matrix) => {
            //   const index = matrix.findIndex(
            //     (m) => m.budgetCategory.id === c.budgetCategory.id,
            //   );
            //   if (index !== -1) {
            //     matrix[index] = res.data;
            //   }
            //   return matrix;
            // });
            this.onSave.emit(res.data);
          }
        },
        error: () => {},
      });
  }
}
