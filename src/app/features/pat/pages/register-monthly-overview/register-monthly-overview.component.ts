import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {
  ExecutionOrPlaning,
  PatActivityTask,
  PatRegisterMode,
} from '@/app/core/models/pat/pat-models';
import { LoadingSpinnerComponent } from '@/app/shared/components/loading-spinner/loading-spinner.component';
import { MonthlyMetricRowComponent } from '@/app/shared/components/monthly-metric-row/monthly-metric-row.component';
import { PatTaskMonthlyOverviewService } from '@/app/core/services/pat/pat-task-monthly-overview.service';
import { MONTH_NAMES } from '@/app/shared/utils/month-names';

@Component({
  selector: 'app-register-monthly-overview',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent, MonthlyMetricRowComponent],
  templateUrl: './register-monthly-overview.component.html',
})
export class RegisterMonthlyOverviewComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly overviewService = inject(PatTaskMonthlyOverviewService);

  taskId = signal(0);
  month = signal(1);

  task = signal<PatActivityTask | null>(null);
  data = signal<ExecutionOrPlaning | null>(null);
  loading = signal(true);
  saving = signal(false);
  dirty = signal(false);
  saved = signal(false);

  monthLabel = computed(() => MONTH_NAMES[this.month() - 1] ?? '');

  title = computed(() => `Registrar mes — ${this.monthLabel()}`);

  ngOnInit(): void {
    const taskId = Number(this.route.snapshot.paramMap.get('taskId'));
    const month = Number(this.route.snapshot.paramMap.get('month'));

    this.taskId.set(taskId);
    this.month.set(month);

    this.overviewService.findRegisterPage(taskId, month).subscribe((res) => {
      if (res.success) {
        this.task.set(res.data.task);
        this.data.set(res.data.overview);
      }
      this.loading.set(false);
    });
  }

  planOf(entry: { planning?: { amount: number } }): number {
    return entry.planning?.amount ?? 0;
  }

  executionOf(entry: { execution?: { amount: number } }): number {
    return entry.execution?.amount ?? 0;
  }

  availableForPlanOf(entry: { availableForPlanning?: number }): number | null {
    return entry.availableForPlanning ?? null;
  }

  availableForExecutionOf(entry: {
    availableForExecution?: number;
  }): number | null {
    return entry.availableForExecution ?? null;
  }

  stageBudget(categoryId: number, mode: PatRegisterMode, amount: number): void {
    this.updateEntry('budgets', (b) => b.budget.id === categoryId, mode, amount);
  }

  stageProduct(productId: number, mode: PatRegisterMode, amount: number): void {
    this.updateEntry('products', (p) => p.product.id === productId, mode, amount);
  }

  stageBenefit(benefitId: number, mode: PatRegisterMode, amount: number): void {
    this.updateEntry('benefits', (b) => b.benefit.id === benefitId, mode, amount);
  }

  stageIndicator(
    indicatorId: number,
    mode: PatRegisterMode,
    amount: number,
  ): void {
    this.updateEntry(
      'indicators',
      (i) => i.indicator.id === indicatorId,
      mode,
      amount,
    );
  }

  private updateEntry<
    K extends 'budgets' | 'products' | 'benefits' | 'indicators',
  >(
    key: K,
    match: (item: ExecutionOrPlaning[K][number]) => boolean,
    mode: PatRegisterMode,
    amount: number,
  ): void {
    const current = this.data();
    if (!current) return;

    const field = mode === 'PLAN' ? 'planning' : 'execution';
    const list = current[key].map((item) =>
      match(item) ? { ...item, [field]: { ...item[field], amount } } : item,
    ) as ExecutionOrPlaning[K];

    this.data.set({ ...current, [key]: list });
    this.dirty.set(true);
    this.saved.set(false);
  }

  private buildPayload(current: ExecutionOrPlaning, mode: PatRegisterMode) {
    const valueOf =
      mode === 'PLAN'
        ? (e: { planning?: { amount: number } }) => e.planning?.amount ?? 0
        : (e: { execution?: { amount: number } }) => e.execution?.amount ?? 0;

    return {
      month: this.month(),
      mode,
      budgets: current.budgets.map((b) => ({
        presupuestalCategoryId: b.budget.id,
        amount: valueOf(b),
      })),
      products: current.products.map((p) => ({
        productId: p.product.id,
        quantity: valueOf(p),
      })),
      benefits: current.benefits.map((b) => ({
        benefitId: b.benefit.id,
        value: valueOf(b),
      })),
      indicators: current.indicators.map((i) => ({
        activityIndicatorId: i.indicator.id,
        value: valueOf(i),
      })),
    };
  }

  saveAll(): void {
    const current = this.data();
    const taskId = this.taskId();
    if (!current || this.saving()) return;

    this.saving.set(true);
    this.overviewService
      .registerMonth(taskId, this.buildPayload(current, 'PLAN'))
      .subscribe({
        next: () => {
          this.overviewService
            .registerMonth(taskId, this.buildPayload(current, 'EXECUTION'))
            .subscribe({
              next: (res) => {
                if (res.success) this.data.set(res.data);
                this.saving.set(false);
                this.dirty.set(false);
                this.saved.set(true);
              },
              error: () => this.saving.set(false),
            });
        },
        error: () => this.saving.set(false),
      });
  }

  goBack(): void {
    const task = this.task();
    if (task) {
      this.router.navigate([`/pat/${task.activityYear}/tasks`, this.taskId()]);
    }
  }
}
