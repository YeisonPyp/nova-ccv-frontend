import { Component, effect, inject, input, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PatActivityService } from '@/app/core/services/pat/pat-activity.service';
import {
  PatActivityExecutionService,
  PatActivityExecutionServiceByActivityId,
} from '@/app/core/services/pat/pat-activity-execution.service';
import {
  BudgetCategory,
  PatActivityBudgetMatrix,
  PatActivityExecution,
} from '@/app/core/models/pat/pat-models';
import { LoadingSpinnerComponent } from '@/app/shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-pat-execution-tab',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, ReactiveFormsModule, LoadingSpinnerComponent],
  templateUrl: './execution-tab.component.html',
})
export class PatExecutionTabComponent {
  private readonly fb = inject(FormBuilder);
  private readonly activityService = inject(PatActivityService);
  private readonly executionService = inject(PatActivityExecutionService);

  activityId = input.required<number>();

  categories = signal<BudgetCategory[]>([]);
  executions = signal<PatActivityExecution[]>([]);
  isLoading = signal(false);
  submitting = signal(false);
  error = signal<string | null>(null);

  months = Array.from({ length: 12 }, (_, i) => i + 1);

  form: FormGroup = this.fb.group({
    month: [1, Validators.required],
    budgetCategoryId: [null, Validators.required],
    amount: [null, [Validators.required, Validators.min(0)]],
  });

  constructor() {
    effect(() => {
      const activityId = this.activityId();
      this.isLoading.set(true);
      this.activityService
        .findPresupuestalMatrix(activityId)
        .subscribe((res) => {
          this.categories.set(
            res.data.map((m: PatActivityBudgetMatrix) => m.budgetCategory),
          );
        });
      new PatActivityExecutionServiceByActivityId(
        this.executionService,
        activityId,
      )
        .findAll({ size: 50 })
        .subscribe((res) => {
          this.isLoading.set(false);
          this.executions.set(res.data.content);
        });
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    this.error.set(null);

    const v = this.form.value;
    this.executionService
      .saveBudgetExecution({
        activityId: this.activityId(),
        month: v.month,
        budgetCategoryId: v.budgetCategoryId,
        amount: v.amount,
      })
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.form.reset({ month: 1, budgetCategoryId: null, amount: null });
          new PatActivityExecutionServiceByActivityId(
            this.executionService,
            this.activityId(),
          )
            .findAll({ size: 50 })
            .subscribe((res) => this.executions.set(res.data.content));
        },
        error: (err) => {
          this.submitting.set(false);
          this.error.set(
            err.error?.message ?? 'Error al guardar la ejecución',
          );
        },
      });
  }
}
