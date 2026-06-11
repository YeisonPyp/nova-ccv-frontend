import {
  ActivityBudgetExecution,
  PatActivityBudgetMatrix,
} from "@/app/core/models/pat/pat-models";
import { PatActivityExecutionService } from "@/app/core/services/pat/pat-activity-execution.service";
import { CurrencyFormatDirective } from "@/app/shared/directives/currency-format.directive";
import { FormFieldErrorDirective } from "@/app/shared/directives/form-field-error.directive";
import { CommonModule } from "@angular/common";
import { Component, effect, inject, input, output } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { debounceTime, distinctUntilChanged, filter } from "rxjs";

@Component({
  selector: "app-budget-execution",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CurrencyFormatDirective,
    FormFieldErrorDirective,
  ],
  templateUrl: "./budget-execution.component.html",
})
export class BudgetExecutionComponent {
  private readonly service = inject(PatActivityExecutionService);
  private readonly fb = inject(FormBuilder);

  execution = input.required<ActivityBudgetExecution | null>();
  activityId = input.required<number>();
  month = input.required<number>();
  matrix = input.required<PatActivityBudgetMatrix>();
  onSave = output<ActivityBudgetExecution>();

  form = this.fb.group({
    executedBudget: [0],
  });

  constructor() {
    effect(() => {
      const matrix = this.matrix();
      this.form
        .get("executedBudget")
        ?.setValidators([
          Validators.max(matrix.patActivityBudget?.totalBudget ?? 0),
        ]);

      const execution = this.execution();

      if (execution) {
        this.form.patchValue(
          { executedBudget: execution.amount },
          { emitEvent: false },
        );
      }

      // const executedBudget = this.matrix()?.;
      // if (executedBudget) {
      //   this.form.patchValue({ executedBudget }, { emitEvent: false });
      // }

      this.form.valueChanges
        .pipe(
          debounceTime(300),
          filter(() => this.form.valid),
          distinctUntilChanged(),
        )
        .subscribe((value) => {
          this.service
            .saveBudgetExecution({
              activityId: this.activityId(),
              month: this.month(),
              amount: value.executedBudget ?? 0,
              budgetCategoryId: matrix.budgetCategory.id,
            })
            .subscribe((res) => {
              this.onSave.emit(res.data);
            });
        });
    });
  }
}
