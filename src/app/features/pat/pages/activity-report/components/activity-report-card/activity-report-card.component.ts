import { Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PlannedExecutedLineChartComponent } from '@/app/shared/components/charts/planned-executed-line-chart/planned-executed-line-chart.component';
import { ExecutionPieChartComponent } from '@/app/shared/components/charts/execution-pie-chart/execution-pie-chart.component';
import {
  ActivityBenefitMonthly,
  ActivityBudgetMonthly,
  ActivityIndicatorMonthly,
  ActivityProductMonthly,
} from '@/app/core/models/pat/pat-report-models';

interface MetricSeries {
  key: number;
  title: string;
  planned: number[];
  executed: number[];
}

function emptyMonths(): number[] {
  return Array.from({ length: 12 }, () => 0);
}

function groupMonthly<T extends { month: number }>(
  rows: T[],
  keyFn: (row: T) => number,
  titleFn: (row: T) => string,
  plannedFn: (row: T) => number,
  executedFn: (row: T) => number,
): MetricSeries[] {
  const byKey = new Map<number, MetricSeries>();
  for (const row of rows) {
    const key = keyFn(row);
    if (!byKey.has(key)) {
      byKey.set(key, {
        key,
        title: titleFn(row),
        planned: emptyMonths(),
        executed: emptyMonths(),
      });
    }
    const series = byKey.get(key)!;
    series.planned[row.month - 1] = plannedFn(row);
    series.executed[row.month - 1] = executedFn(row);
  }
  return Array.from(byKey.values());
}

@Component({
  selector: 'app-activity-report-card',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    PlannedExecutedLineChartComponent,
    ExecutionPieChartComponent,
  ],
  templateUrl: './activity-report-card.component.html',
})
export class ActivityReportCardComponent {
  activityId = input.required<number>();
  activityName = input.required<string>();
  year = input.required<number | null>();
  budgetRows = input<ActivityBudgetMonthly[]>([]);
  indicatorRows = input<ActivityIndicatorMonthly[]>([]);
  productRows = input<ActivityProductMonthly[]>([]);
  benefitRows = input<ActivityBenefitMonthly[]>([]);

  approvedBudgetTotal = computed(
    () => this.budgetRows()[0]?.approvedBudgetTotal ?? 0,
  );
  executedBudgetTotal = computed(
    () => this.budgetRows()[0]?.executedBudgetTotal ?? 0,
  );

  budgetPlannedMonthly = computed(() => {
    const values = emptyMonths();
    for (const row of this.budgetRows()) {
      values[row.month - 1] = row.monthlyPlannedBudget;
    }
    return values;
  });

  budgetExecutedMonthly = computed(() => {
    const values = emptyMonths();
    for (const row of this.budgetRows()) {
      values[row.month - 1] = row.monthlyExecutedBudget;
    }
    return values;
  });

  indicatorSeries = computed<MetricSeries[]>(() =>
    groupMonthly(
      this.indicatorRows(),
      (r) => r.indicatorId,
      (r) => r.indicatorName,
      (r) => r.plannedValue,
      (r) => r.executedValue,
    ),
  );

  productSeries = computed<MetricSeries[]>(() =>
    groupMonthly(
      this.productRows(),
      (r) => r.productId,
      (r) => r.productName,
      (r) => r.plannedQuantity,
      (r) => r.executedQuantity,
    ),
  );

  benefitSeries = computed<MetricSeries[]>(() =>
    groupMonthly(
      this.benefitRows(),
      (r) => r.benefitId,
      (r) => r.benefitTypeName,
      (r) => r.plannedValue,
      (r) => r.executedValue,
    ),
  );
}
