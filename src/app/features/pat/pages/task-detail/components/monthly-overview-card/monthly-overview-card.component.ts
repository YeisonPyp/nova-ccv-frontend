import { Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ExecutionOrPlaning } from '@/app/core/models/pat/pat-models';
import { MONTH_NAMES } from '@/app/shared/utils/month-names';

export interface MonthlyOverviewAvance {
  benefits: Record<number, number>;
  indicators: Record<number, number>;
}

@Component({
  selector: 'app-monthly-overview-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './monthly-overview-card.component.html',
})
export class MonthlyOverviewCardComponent {
  data = input.required<ExecutionOrPlaning>();
  year = input.required<number>();
  taskId = input.required<number>();
  avance = input<MonthlyOverviewAvance>({ benefits: {}, indicators: {} });

  monthLabel = computed(() => MONTH_NAMES[this.data().month - 1] ?? '');

  registerLink = computed(() => [
    '/pat',
    this.year(),
    'tasks',
    this.taskId(),
    'register',
    this.data().month,
  ]);

  budgetPlanTotal = computed(() =>
    this.data().budgets.reduce((sum, b) => sum + this.planOf(b), 0),
  );
  budgetExecutionTotal = computed(() =>
    this.data().budgets.reduce((sum, b) => sum + this.executionOf(b), 0),
  );

  planOf(entry: { planning?: { amount: number } }): number {
    return entry.planning?.amount ?? 0;
  }

  executionOf(entry: { execution?: { amount: number } }): number {
    return entry.execution?.amount ?? 0;
  }

  benefitAvance(benefitId: number): number {
    return this.avance().benefits[benefitId] ?? 0;
  }

  indicatorAvance(indicatorId: number): number {
    return this.avance().indicators[indicatorId] ?? 0;
  }
}
