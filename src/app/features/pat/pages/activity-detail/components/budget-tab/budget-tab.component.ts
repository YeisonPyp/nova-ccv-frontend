import {
  Component,
  computed,
  effect,
  inject,
  input,
  OnInit,
  output,
  signal,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import {
  BudgetCategory,
  PatActivityBudgetMatrix,
  PatActivityService,
} from "@/app/core/services/pat/pat-activity.service";
import {
  BudgetMatrixRowComponent,
  OnSaveBudgetMatrix,
} from "./budget-matrix-row/budget-matrix-row.component";

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
  matrix = signal<PatActivityBudgetMatrix[]>([]);

  onSave = output<number>();

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

  isLoading = signal(false);

  constructor() {
    effect(() => {
      this.isLoading.set(true);
      this.service.findPresupuestalMatrix(this.activityId()).subscribe({
        next: (res) => {
          this.matrix.set(res.data);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
        },
      });
    });
  }

  $onSave(c: OnSaveBudgetMatrix) {
    this.service
      .saveBudgetMatrix(this.activityId(), c.budgetCategory.id, c.budget)
      .subscribe({
        next: (res) => {
          if (res.data) {
            this.matrix.update((matrix) => {
              const index = matrix.findIndex(
                (m) => m.budgetCategory.id === c.budgetCategory.id,
              );
              if (index !== -1) {
                matrix[index] = res.data;
              }
              return matrix;
            });
            this.onSave.emit(this.budgetCalculation().totalBudget);
          }
        },
        error: () => {},
      });
  }
}
