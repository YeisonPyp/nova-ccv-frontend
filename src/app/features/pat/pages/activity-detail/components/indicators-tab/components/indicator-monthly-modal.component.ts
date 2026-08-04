import { Component, effect, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatActivityIndicatorService } from '@/app/core/services/pat/pat-activity-indicator.service';
import { PatActivityIndicator } from '@/app/core/models/pat/pat-models';
import {
  MonthlyValue,
  MonthlyValuesGridComponent,
} from '@/app/shared/components/monthly-values-grid/monthly-values-grid.component';

@Component({
  selector: 'app-indicator-monthly-modal',
  standalone: true,
  imports: [CommonModule, MonthlyValuesGridComponent],
  templateUrl: './indicator-monthly-modal.component.html',
})
export class IndicatorMonthlyModalComponent {
  readonly isOpen = input<boolean>(false);
  readonly indicator = input<PatActivityIndicator | null>(null);

  readonly onClose = output<void>();

  private readonly service = inject(PatActivityIndicatorService);

  planned = signal<MonthlyValue[]>([]);
  executed = signal<MonthlyValue[]>([]);

  constructor() {
    effect(() => {
      const indicator = this.indicator();
      if (this.isOpen() && indicator) {
        this.service.findMonthlyPlan(indicator.id).subscribe((res) => {
          this.planned.set(
            res.data.map((p) => ({ month: p.month, value: p.plannedValue })),
          );
        });
        this.service.findExecution(indicator.id).subscribe((res) => {
          this.executed.set(
            res.data.map((e) => ({ month: e.month, value: e.executedValue })),
          );
        });
      }
    });
  }

  savePlan(e: { month: number; value: number }): void {
    const indicator = this.indicator();
    if (!indicator) return;
    this.service
      .upsertMonthlyPlan(indicator.id, e.month, e.value)
      .subscribe((res) => {
        if (res.success) {
          const current = this.planned().filter((p) => p.month !== e.month);
          this.planned.set([
            ...current,
            { month: e.month, value: res.data.plannedValue },
          ]);
        }
      });
  }

  saveExecution(e: { month: number; value: number }): void {
    const indicator = this.indicator();
    if (!indicator) return;
    this.service
      .upsertExecution(indicator.id, e.month, e.value)
      .subscribe((res) => {
        if (res.success) {
          const current = this.executed().filter((p) => p.month !== e.month);
          this.executed.set([
            ...current,
            { month: e.month, value: res.data.executedValue },
          ]);
        }
      });
  }

  close(): void {
    this.onClose.emit();
  }
}
