import { Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ExecutionOrPlaning } from '@/app/core/models/pat/pat-models';

const MONTH_LABELS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

@Component({
  selector: 'app-monthly-overview-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './monthly-overview-card.component.html',
})
export class MonthlyOverviewCardComponent {
  data = input.required<ExecutionOrPlaning>();
  mode = input.required<'plan' | 'execution'>();
  year = input.required<number>();
  taskId = input.required<number>();

  monthLabel = computed(() => MONTH_LABELS[this.data().month - 1] ?? '');

  registerLink = computed(() => [
    '/pat',
    this.year(),
    'tasks',
    this.taskId(),
    'register',
    this.data().month,
    this.mode(),
  ]);

  budgetTotal = computed(() =>
    this.data().budgets.reduce((sum, b) => sum + this.valueOf(b), 0),
  );

  valueOf(entry: {
    planning?: { amount: number };
    execution?: { amount: number };
  }): number {
    const amount =
      this.mode() === 'plan' ? entry.planning?.amount : entry.execution?.amount;
    return amount ?? 0;
  }
}
