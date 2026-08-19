import { Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExecutionOrPlaning } from '@/app/core/models/pat/pat-models';
import {
  MonthlyOverviewAvance,
  MonthlyOverviewCardComponent,
} from '../monthly-overview-card/monthly-overview-card.component';

@Component({
  selector: 'app-monthly-overview-grid',
  standalone: true,
  imports: [CommonModule, MonthlyOverviewCardComponent],
  templateUrl: './monthly-overview-grid.component.html',
})
export class MonthlyOverviewGridComponent {
  overview = input.required<ExecutionOrPlaning[]>();
  year = input.required<number>();
  taskId = input.required<number>();

  /**
   * Avance (%) per month, per benefit/indicator id, is cumulative:
   * sum of executed(1..month) / target * 100.
   */
  avanceByMonth = computed(() => {
    const sorted = [...this.overview()].sort((a, b) => a.month - b.month);
    const cumulativeBenefits = new Map<number, number>();
    const cumulativeIndicators = new Map<number, number>();
    const result = new Map<number, MonthlyOverviewAvance>();

    for (const monthData of sorted) {
      const benefits: Record<number, number> = {};
      for (const b of monthData.benefits) {
        const executed = b.execution?.amount ?? 0;
        const target = b.benefit.targetValue || 0;
        const prev = cumulativeBenefits.get(b.benefit.id) ?? 0;
        const next = target > 0 ? prev + (executed / target) * 100 : prev;
        cumulativeBenefits.set(b.benefit.id, next);
        benefits[b.benefit.id] = next;
      }

      const indicators: Record<number, number> = {};
      for (const i of monthData.indicators) {
        const executed = i.execution?.amount ?? 0;
        const target = i.indicator.goalValue || 0;
        const prev = cumulativeIndicators.get(i.indicator.id) ?? 0;
        const next = target > 0 ? prev + (executed / target) * 100 : prev;
        cumulativeIndicators.set(i.indicator.id, next);
        indicators[i.indicator.id] = next;
      }

      result.set(monthData.month, { benefits, indicators });
    }

    return result;
  });

  avanceFor(month: number): MonthlyOverviewAvance {
    return this.avanceByMonth().get(month) ?? { benefits: {}, indicators: {} };
  }
}
