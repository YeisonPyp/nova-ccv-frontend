import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExecutionOrPlaning } from '@/app/core/models/pat/pat-models';
import { MonthlyMetricRowComponent } from '@/app/shared/components/monthly-metric-row/monthly-metric-row.component';
import { PatActivityTaskBudgetService } from '@/app/core/services/pat/pat-activity-task-budget.service';
import { PatActivityTaskIndicatorService } from '@/app/core/services/pat/pat-activity-task-indicator.service';
import { PatActivityTaskProductMonthlyService } from '@/app/core/services/pat/pat-activity-task-product-monthly.service';
import { PatActivityTaskBenefitMonthlyService } from '@/app/core/services/pat/pat-activity-task-benefit-monthly.service';

const MONTH_LABELS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

@Component({
  selector: 'app-register-monthly-overview-modal',
  standalone: true,
  imports: [CommonModule, MonthlyMetricRowComponent],
  templateUrl: './register-monthly-overview-modal.component.html',
})
export class RegisterMonthlyOverviewModalComponent {
  private readonly budgetService = inject(PatActivityTaskBudgetService);
  private readonly indicatorService = inject(PatActivityTaskIndicatorService);
  private readonly productService = inject(PatActivityTaskProductMonthlyService);
  private readonly benefitService = inject(PatActivityTaskBenefitMonthlyService);

  isOpen = input.required<boolean>();
  taskId = input.required<number>();
  mode = input.required<'plan' | 'execution'>();
  data = input.required<ExecutionOrPlaning>();

  onClose = output<void>();
  onSaved = output<ExecutionOrPlaning>();

  local = signal<ExecutionOrPlaning | null>(null);

  monthLabel = computed(() => {
    const d = this.local();
    return d ? (MONTH_LABELS[d.month - 1] ?? '') : '';
  });

  title = computed(() =>
    this.mode() === 'plan'
      ? `Registrar planeación — ${this.monthLabel()}`
      : `Registrar ejecución — ${this.monthLabel()}`,
  );

  constructor() {
    effect(() => {
      if (this.isOpen()) {
        this.local.set(structuredClone(this.data()));
      }
    });
  }

  close(): void {
    this.onClose.emit();
  }

  valueOf(entry: {
    planning?: { amount: number };
    execution?: { amount: number };
  }): number {
    const amount =
      this.mode() === 'plan' ? entry.planning?.amount : entry.execution?.amount;
    return amount ?? 0;
  }

  referenceOf(entry: {
    planning?: { amount: number };
  }): number | null {
    return this.mode() === 'execution' ? (entry.planning?.amount ?? 0) : null;
  }

  saveBudget(categoryId: number, amount: number): void {
    const taskId = this.taskId();
    const month = this.local()?.month;
    if (month == null) return;

    const onSuccess = () =>
      this.updateEntry('budgets', (b) => b.budget.id === categoryId, amount);

    if (this.mode() === 'plan') {
      this.budgetService
        .upsertPlan(taskId, { presupuestalCategoryId: categoryId, month, plannedAmount: amount })
        .subscribe((res) => res.success && onSuccess());
    } else {
      this.budgetService
        .upsertExecution(taskId, { presupuestalCategoryId: categoryId, month, amount })
        .subscribe((res) => res.success && onSuccess());
    }
  }

  saveProduct(productId: number, amount: number): void {
    const taskId = this.taskId();
    const month = this.local()?.month;
    if (month == null) return;

    const onSuccess = () =>
      this.updateEntry('products', (p) => p.product.id === productId, amount);

    if (this.mode() === 'plan') {
      this.productService
        .upsertPlan(taskId, { productId, month, plannedQuantity: amount })
        .subscribe((res) => res.success && onSuccess());
    } else {
      this.productService
        .upsertExecution(taskId, { productId, month, executedQuantity: amount })
        .subscribe((res) => res.success && onSuccess());
    }
  }

  saveBenefit(benefitId: number, amount: number): void {
    const taskId = this.taskId();
    const month = this.local()?.month;
    if (month == null) return;

    const onSuccess = () =>
      this.updateEntry('benefits', (b) => b.benefit.id === benefitId, amount);

    if (this.mode() === 'plan') {
      this.benefitService
        .upsertPlan(taskId, { benefitId, month, plannedValue: amount })
        .subscribe((res) => res.success && onSuccess());
    } else {
      this.benefitService
        .upsertExecution(taskId, { benefitId, month, executedValue: amount })
        .subscribe((res) => res.success && onSuccess());
    }
  }

  saveIndicator(indicatorId: number, amount: number): void {
    const taskId = this.taskId();
    const month = this.local()?.month;
    if (month == null) return;

    const onSuccess = () =>
      this.updateEntry(
        'indicators',
        (i) => i.indicator.id === indicatorId,
        amount,
      );

    if (this.mode() === 'plan') {
      this.indicatorService
        .upsertPlan(taskId, { activityIndicatorId: indicatorId, month, plannedValue: amount })
        .subscribe((res) => res.success && onSuccess());
    } else {
      this.indicatorService
        .upsertExecution(taskId, { activityIndicatorId: indicatorId, month, executedValue: amount })
        .subscribe((res) => res.success && onSuccess());
    }
  }

  private updateEntry<K extends 'budgets' | 'products' | 'benefits' | 'indicators'>(
    key: K,
    match: (item: ExecutionOrPlaning[K][number]) => boolean,
    amount: number,
  ): void {
    const current = this.local();
    if (!current) return;

    const field = this.mode() === 'plan' ? 'planning' : 'execution';
    const list = current[key].map((item) =>
      match(item)
        ? { ...item, [field]: { ...item[field], amount } }
        : item,
    ) as ExecutionOrPlaning[K];

    const updated: ExecutionOrPlaning = { ...current, [key]: list };
    this.local.set(updated);
    this.onSaved.emit(updated);
  }
}
