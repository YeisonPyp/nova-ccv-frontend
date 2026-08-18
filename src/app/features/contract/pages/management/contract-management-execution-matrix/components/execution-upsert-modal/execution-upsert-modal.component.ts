import { Component, OnInit, computed, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ContractManagementExecutionPlanService } from '@/app/core/services/contract/contract-management-execution-plan.service';
import { PatActivityTaskService } from '@/app/core/services/pat/pat-activity-task.service';
import {
  ContractManagementExecutionPlan,
  ContractManagementPlan,
} from '@/app/core/models/contract/contract-management-plan.model';
import { PatActivityTask } from '@/app/core/models/pat/pat-models';
import { CurrencyFormatDirective } from '@/app/shared/directives/currency-format.directive';
import { MONTH_NAMES } from '@/app/shared/utils/month-names';

@Component({
  selector: 'app-execution-upsert-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CurrencyFormatDirective],
  templateUrl: './execution-upsert-modal.component.html',
})
export class ExecutionUpsertModalComponent implements OnInit {
  private readonly service = inject(ContractManagementExecutionPlanService);
  private readonly taskService = inject(PatActivityTaskService);
  private readonly fb = inject(FormBuilder);

  plan = input.required<ContractManagementPlan>();
  execution = input<ContractManagementExecutionPlan | null>(null);
  /** Months already planned, excluded from the month selector when creating. */
  usedMonths = input<number[]>([]);
  /** All of the plan's execution rows, used to validate against the plan's total budget. */
  existingExecutions = input<ContractManagementExecutionPlan[]>([]);

  closed = output<void>();
  saved = output<ContractManagementExecutionPlan>();

  submitting = signal(false);
  error = signal<string | null>(null);
  patTasks = signal<PatActivityTask[]>([]);

  readonly monthOptions = MONTH_NAMES.map((label, i) => ({
    value: i + 1,
    label,
  }));

  /** contractsAmount contracts × unitCost each = total budget this plan can execute across all months. */
  totalPlanBudget = computed(() => {
    const p = this.plan();
    return p.contractsAmount * p.unitCost;
  });

  /** Each contract runs for `months`, so at most contractsAmount × unitCost/months can land in a single month. */
  maxPerMonth = computed(() => {
    const p = this.plan();
    return p.months > 0 ? this.totalPlanBudget() / p.months : this.totalPlanBudget();
  });

  /** Sum already committed to OTHER months (excludes the row being edited). */
  otherMonthsTotal = computed(() => {
    const currentMonth = this.execution()?.month;
    return this.existingExecutions()
      .filter((e) => e.month !== currentMonth)
      .reduce((sum, e) => sum + e.amount, 0);
  });

  remainingBudget = computed(() => this.totalPlanBudget() - this.otherMonthsTotal());

  amountCap = computed(() => Math.max(0, Math.min(this.maxPerMonth(), this.remainingBudget())));

  /** Each contract only lasts `months`, so the plan can't have more distinct execution months than that. */
  monthLimitReached = computed(() => {
    const months = this.plan().months;
    if (!months || months <= 0) return false;
    if (this.execution()) return false;
    return this.existingExecutions().length >= months;
  });

  availableMonthOptions = () => {
    const execution = this.execution();
    if (execution) return this.monthOptions;
    const used = new Set(this.usedMonths());
    return this.monthOptions.filter((m) => !used.has(m.value));
  };

  form = this.fb.group({
    month: [null as number | null, Validators.required],
    amount: [0, [Validators.required, Validators.min(0.01)]],
    patTaskId: [null as number | null],
    taskDescription: [''],
  });

  ngOnInit(): void {
    const execution = this.execution();
    const plan = this.plan();

    this.form.patchValue({
      month: execution?.month ?? null,
      amount: execution?.amount ?? 0,
      patTaskId: execution?.taskId ?? plan.patTaskId?.id ?? null,
      taskDescription: execution?.taskDescription ?? plan.task ?? '',
    });

    this.form
      .get('amount')
      ?.addValidators(Validators.max(this.amountCap()));
    this.form.get('amount')?.updateValueAndValidity();

    if (execution) this.form.get('month')?.disable();

    if (plan.areaId) {
      this.taskService
        .findByYearAndArea(plan.year, plan.areaId)
        .subscribe((res) => this.patTasks.set(res.data ?? []));
    }
  }

  close(): void {
    this.closed.emit();
  }

  submit(): void {
    if (this.monthLimitReached() || this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.error.set(null);
    const v = this.form.getRawValue();

    this.service
      .upsert(this.plan().id, {
        month: (v.month ?? this.execution()?.month)!,
        amount: v.amount!,
        taskId: v.patTaskId ?? null,
        taskDescription: v.taskDescription ?? null,
      })
      .subscribe({
        next: (res) => {
          this.submitting.set(false);
          if (res.success && res.data) this.saved.emit(res.data);
        },
        error: (err) => {
          this.submitting.set(false);
          this.error.set(
            err.error?.message ?? 'No se pudo guardar la ejecución',
          );
        },
      });
  }
}
