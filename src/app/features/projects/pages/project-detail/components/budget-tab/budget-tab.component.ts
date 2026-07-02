import { Component, effect, inject, input, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ProjectService } from '@/app/core/services/projects/project.service';
import { LoadingSpinnerComponent } from '@/app/shared/components/loading-spinner/loading-spinner.component';
import { OnSaveBudgetMatrix } from '@/app/features/projects/components/budget-matrix-row/budget-matrix-row.component';
import { BudgetCalculationComponent } from '@/app/features/projects/components/budget-calculation.component';
import { PatActivityBudgetMatrix } from '@/app/core/models/pat/pat-models';

@Component({
  selector: 'app-budget-tab',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    LoadingSpinnerComponent,
    BudgetCalculationComponent,
  ],
  templateUrl: './budget-tab.component.html',
})
export class BudgetTabComponent {
  private readonly service = inject(ProjectService);
  projectId = input.required<number>();
  matrix = signal<PatActivityBudgetMatrix[]>([]);
  isLoading = signal(false);

  constructor() {
    effect(() => {
      const projectId = this.projectId();
      this.isLoading.set(true);
      this.service.findBudgetMatrix(projectId).subscribe((res) => {
        this.isLoading.set(false);
        this.matrix.set(res.data);
      });
    });
  }

  $onSave(c: OnSaveBudgetMatrix) {
    this.service
      .saveBudgetMatrix(this.projectId(), c.budgetCategory.id, c.budget)
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
