import { Component, computed, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatActivityBudgetMatrix } from '@/app/core/models/pat/pat-models';
import {
  BudgetMatrixRowComponent,
  OnSaveBudgetMatrix,
} from './budget-matrix-row/budget-matrix-row.component';

@Component({
  selector: 'app-budget-calculation',
  standalone: true,
  imports: [CommonModule, BudgetMatrixRowComponent],
  templateUrl: './budget-calculation.component.html',
})
export class BudgetCalculationComponent {
  matrix = input.required<PatActivityBudgetMatrix[]>();
  onSave = output<OnSaveBudgetMatrix>();

  budgetCalculation = computed<number>(() =>
    this.matrix().reduce((acc, curr) => {
      acc += curr.budget?.amount ?? 0;
      return acc;
    }, 0),
  );
}
