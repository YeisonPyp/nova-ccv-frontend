import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {
  ExecutionOrPlaning,
  PatActivityTask,
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
  mode = signal<'plan' | 'execution'>('execution');

  task = signal<PatActivityTask | null>(null);
  data = signal<ExecutionOrPlaning | null>(null);
  loading = signal(true);
  saving = signal(false);
  dirty = signal(false);
  saved = signal(false);

  monthLabel = computed(() => MONTH_NAMES[this.month() - 1] ?? '');

  title = computed(() =>
    this.mode() === 'plan'
      ? `Registrar planeación — ${this.monthLabel()}`
      : `Registrar ejecución — ${this.monthLabel()}`,
  );

  ngOnInit(): void {
    const taskId = Number(this.route.snapshot.paramMap.get('taskId'));
    const month = Number(this.route.snapshot.paramMap.get('month'));
    const mode =
      this.route.snapshot.paramMap.get('mode') === 'plan'
        ? 'plan'
        : 'execution';

    this.taskId.set(taskId);
    this.month.set(month);
    this.mode.set(mode);

    this.overviewService.findRegisterPage(taskId, month).subscribe((res) => {
      if (res.success) {
        this.task.set(res.data.task);
        this.data.set(res.data.overview);
      }
      this.loading.set(false);
    });
  }

  valueOf(entry: {
    planning?: { amount: number };
    execution?: { amount: number };
  }): number {
    const amount =
      this.mode() === 'plan' ? entry.planning?.amount : entry.execution?.amount;
    return amount ?? 0;
  }

  referenceOf(entry: { planning?: { amount: number } }): number | null {
    return this.mode() === 'execution' ? (entry.planning?.amount ?? 0) : null;
  }

  availableOf(entry: {
    availableForPlanning?: number;
    availableForExecution?: number;
  }): number | null {
    const available =
      this.mode() === 'plan'
        ? entry.availableForPlanning
        : entry.availableForExecution;
    return available ?? null;
  }

  stageBudget(categoryId: number, amount: number): void {
    this.updateEntry('budgets', (b) => b.budget.id === categoryId, amount);
  }

  stageProduct(productId: number, amount: number): void {
    this.updateEntry('products', (p) => p.product.id === productId, amount);
  }

  stageBenefit(benefitId: number, amount: number): void {
    this.updateEntry('benefits', (b) => b.benefit.id === benefitId, amount);
  }

  stageIndicator(indicatorId: number, amount: number): void {
    this.updateEntry(
      'indicators',
      (i) => i.indicator.id === indicatorId,
      amount,
    );
  }

  private updateEntry<
    K extends 'budgets' | 'products' | 'benefits' | 'indicators',
  >(
    key: K,
    match: (item: ExecutionOrPlaning[K][number]) => boolean,
    amount: number,
  ): void {
    const current = this.data();
    if (!current) return;

    const field = this.mode() === 'plan' ? 'planning' : 'execution';
    const list = current[key].map((item) =>
      match(item) ? { ...item, [field]: { ...item[field], amount } } : item,
    ) as ExecutionOrPlaning[K];

    this.data.set({ ...current, [key]: list });
    this.dirty.set(true);
    this.saved.set(false);
  }

  saveAll(): void {
    const current = this.data();
    const taskId = this.taskId();
    const month = this.month();
    if (!current || this.saving()) return;

    this.saving.set(true);
    this.overviewService
      .registerMonth(taskId, {
        month,
        mode: this.mode() === 'plan' ? 'PLAN' : 'EXECUTION',
        budgets: current.budgets.map((b) => ({
          presupuestalCategoryId: b.budget.id,
          amount: this.valueOf(b),
        })),
        products: current.products.map((p) => ({
          productId: p.product.id,
          quantity: this.valueOf(p),
        })),
        benefits: current.benefits.map((b) => ({
          benefitId: b.benefit.id,
          value: this.valueOf(b),
        })),
        indicators: current.indicators.map((i) => ({
          activityIndicatorId: i.indicator.id,
          value: this.valueOf(i),
        })),
      })
      .subscribe({
        next: (res) => {
          if (res.success) this.data.set(res.data);
          this.saving.set(false);
          this.dirty.set(false);
          this.saved.set(true);
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
