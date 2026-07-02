import {
  Component,
  computed,
  effect,
  inject,
  input,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged, filter } from 'rxjs';
import { CurrencyFormatDirective } from '@/app/shared/directives/currency-format.directive';
import { FormFieldErrorDirective } from '@/app/shared/directives/form-field-error.directive';
import {
  BudgetCategory,
  PatActivityBudgetMatrix,
} from '@/app/core/models/pat/pat-models';

export interface OnSaveBudgetMatrix {
  budgetCategory: BudgetCategory;
  budget: number;
}

@Component({
  selector: '[app-budget-matrix-row]',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CurrencyPipe,
    CurrencyFormatDirective,
    FormFieldErrorDirective,
  ],
  templateUrl: './budget-matrix-row.component.html',
})
export class BudgetMatrixRowComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  row = input.required<PatActivityBudgetMatrix>();

  newPlannedBudget = signal<number>(0);

  delta = computed(() => {
    const r = this.row();
    const originalBudget = r.budget?.amount ?? 0;
    return this.newPlannedBudget() - originalBudget;
  });

  plannedBudget = computed(() => {
    const r = this.row();
    return r.budgetCategory.plannedBudget + this.delta();
  });

  unplannedBudget = computed(() => {
    const r = this.row();
    return r.budgetCategory.unplannedBudget - this.delta();
  });

  onSave = output<OnSaveBudgetMatrix>();

  formGroup = this.fb.group({
    amount: [0, Validators.required],
  });

  constructor() {
    effect(() => {
      const row = this.row();
      const currentTotal = row.budget?.amount || 0;

      this.formGroup.patchValue({ amount: currentTotal }, { emitEvent: false });

      this.newPlannedBudget.set(currentTotal);

      const amountControl = this.formGroup.get('amount');
      if (amountControl) {
        amountControl.clearValidators();

        const maxAllowed = row.budgetCategory.unplannedBudget + currentTotal;

        amountControl.addValidators([
          Validators.required,
          Validators.min(0),
          Validators.max(maxAllowed),
        ]);

        amountControl.updateValueAndValidity({ emitEvent: false });
      }
    });
  }

  ngOnInit(): void {
    this.formGroup.valueChanges
      .pipe(
        debounceTime(800),
        distinctUntilChanged((prev, curr) => prev.amount === curr.amount),
        filter((values) => {
          if (values?.amount != null) {
            this.newPlannedBudget.set(Number(values.amount));
          }
          return this.formGroup.valid;
        }),
      )
      .subscribe((values) => {
        if (values?.amount != null) {
          this.onSave.emit({
            budgetCategory: this.row().budgetCategory,
            budget: Number(values.amount),
          });
        }
      });
  }
}
