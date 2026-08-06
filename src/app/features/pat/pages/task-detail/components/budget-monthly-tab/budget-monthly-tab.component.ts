import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatActivityTaskBudgetService } from '@/app/core/services/pat/pat-activity-task-budget.service';
import {
  BudgetCategory,
  PatActivityTaskBudgetExecution,
  PatActivityTaskBudgetPlan,
} from '@/app/core/models/pat/pat-models';
import {
  MonthlyValue,
  MonthlyValuesGridComponent,
} from '@/app/shared/components/monthly-values-grid/monthly-values-grid.component';
import { PositionService } from '@/app/core/services/assessment/position.service';
import { ContextSearchSelectComponent } from '@/app/shared/components/context-search-select/context-search-select.component';

type Row = PatActivityTaskBudgetPlan | PatActivityTaskBudgetExecution;

function emptyMonthly(): MonthlyValue[] {
  return Array.from({ length: 12 }, (_, i) => ({ month: i + 1, value: 0 }));
}

@Component({
  selector: 'app-task-budget-monthly-tab',
  standalone: true,
  imports: [CommonModule, MonthlyValuesGridComponent, ContextSearchSelectComponent],
  templateUrl: './budget-monthly-tab.component.html',
})
export class TaskBudgetMonthlyTabComponent {
  private readonly service = inject(PatActivityTaskBudgetService);
  private readonly positionService = inject(PositionService);

  taskId = input.required<number>();
  mode = input.required<'plan' | 'execution'>();
  rubros = input<BudgetCategory[]>([]);

  rows = signal<Row[]>([]);
  planRows = signal<PatActivityTaskBudgetPlan[]>([]);

  positionCtx = this.positionService.newSearchSelectContext(
    (p) => this.selectedPositionId.set(p.id),
    { isRequired: true, label: 'Cargo que registra' },
  );

  selectedPositionId = signal<number | null>(null);

  title = computed(() =>
    this.mode() === 'plan' ? 'Planeaciones Mensuales' : 'Ejecuciones Mensuales',
  );

  constructor() {
    effect(() => {
      const taskId = this.taskId();
      // Always load the plan: it's shown as reference alongside executions,
      // and is the main dataset when mode is "plan".
      this.service.findPlan(taskId).subscribe((res) => {
        if (res.success) this.planRows.set(res.data);
      });
    });

    effect(() => {
      const taskId = this.taskId();
      if (this.mode() === 'execution') {
        this.service.findExecution(taskId).subscribe((res) => {
          if (res.success) this.rows.set(res.data);
        });
      }
    });
  }

  valuesFor(categoryId: number): MonthlyValue[] {
    if (this.mode() === 'plan') {
      return this.aggregate(this.planRows(), categoryId, (r) => r.plannedAmount);
    }
    return this.aggregate(
      this.rows() as PatActivityTaskBudgetExecution[],
      categoryId,
      (r) => r.amount,
    );
  }

  planValuesFor(categoryId: number): MonthlyValue[] {
    return this.aggregate(this.planRows(), categoryId, (r) => r.plannedAmount);
  }

  private aggregate<T extends { presupuestalCategory: BudgetCategory; month: number }>(
    rows: T[],
    categoryId: number,
    amountFn: (row: T) => number,
  ): MonthlyValue[] {
    const values = emptyMonthly();
    for (const row of rows) {
      if (row.presupuestalCategory.id !== categoryId) continue;
      values[row.month - 1].value = (values[row.month - 1].value ?? 0) + amountFn(row);
    }
    return values;
  }

  save(categoryId: number, e: { month: number; value: number }): void {
    const positionId = this.selectedPositionId();
    if (!positionId) return;

    if (this.mode() === 'plan') {
      this.service
        .upsertPlan(this.taskId(), {
          presupuestalCategoryId: categoryId,
          month: e.month,
          plannedAmount: e.value,
          positionId,
        })
        .subscribe((res) => {
          if (res.success) this.replacePlanRow(res.data);
        });
    } else {
      this.service
        .upsertExecution(this.taskId(), {
          presupuestalCategoryId: categoryId,
          month: e.month,
          amount: e.value,
          positionId,
        })
        .subscribe((res) => {
          if (res.success) this.replaceRow(res.data);
        });
    }
  }

  private replaceRow(row: PatActivityTaskBudgetExecution): void {
    const current = this.rows() as PatActivityTaskBudgetExecution[];
    const idx = current.findIndex((r) => r.id === row.id);
    if (idx >= 0) {
      const updated = [...current];
      updated[idx] = row;
      this.rows.set(updated);
    } else {
      this.rows.set([...current, row]);
    }
  }

  private replacePlanRow(row: PatActivityTaskBudgetPlan): void {
    const current = this.planRows();
    const idx = current.findIndex((r) => r.id === row.id);
    if (idx >= 0) {
      const updated = [...current];
      updated[idx] = row;
      this.planRows.set(updated);
    } else {
      this.planRows.set([...current, row]);
    }
  }
}
