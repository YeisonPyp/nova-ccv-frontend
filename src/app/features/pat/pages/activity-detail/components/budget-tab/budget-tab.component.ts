import {
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  BudgetMatrixRowComponent,
  OnSaveBudgetMatrix,
} from "./budget-matrix-row/budget-matrix-row.component";
import { PatActivityService } from "@/app/core/services/pat/pat-activity.service";
import { PatActivityBudgetMatrix } from "@/app/core/models/pat/pat-models";

export interface budgetCalculation {
  totalPrivate: number;
  totalPublic: number;
  totalBudget: number;
}

@Component({
  selector: "app-budget-tab",
  standalone: true,
  imports: [CommonModule, BudgetMatrixRowComponent],
  templateUrl: "./budget-tab.component.html",
})
export class BudgetTabComponent {
  service = inject(PatActivityService);
  activityId = input.required<number>();
  matrix = input.required<PatActivityBudgetMatrix[]>();

  onSave = output<PatActivityBudgetMatrix>();

  budgetCalculation = computed<budgetCalculation>(() =>
    this.matrix().reduce(
      (acc, curr) => {
        acc.totalPrivate += curr.patActivityBudget?.privateBudget ?? 0;
        acc.totalPublic += curr.patActivityBudget?.publicBudget ?? 0;
        acc.totalBudget += curr.patActivityBudget?.totalBudget ?? 0;
        return acc;
      },
      { totalPrivate: 0, totalPublic: 0, totalBudget: 0 },
    ),
  );

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
