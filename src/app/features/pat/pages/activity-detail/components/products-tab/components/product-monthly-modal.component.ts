import { Component, effect, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatActivityProductService } from '@/app/core/services/pat/pat-activity-product.service';
import { PatActivityProduct } from '@/app/core/models/pat/pat-models';
import {
  MonthlyValue,
  MonthlyValuesGridComponent,
} from '@/app/shared/components/monthly-values-grid/monthly-values-grid.component';

@Component({
  selector: 'app-pat-product-monthly-modal',
  standalone: true,
  imports: [CommonModule, MonthlyValuesGridComponent],
  templateUrl: './product-monthly-modal.component.html',
})
export class PatProductMonthlyModalComponent {
  readonly isOpen = input<boolean>(false);
  readonly product = input<PatActivityProduct | null>(null);

  readonly onClose = output<void>();

  private readonly service = inject(PatActivityProductService);

  planned = signal<MonthlyValue[]>([]);
  executed = signal<MonthlyValue[]>([]);

  constructor() {
    effect(() => {
      const product = this.product();
      if (this.isOpen() && product) {
        this.service.findMonthlyPlan(product.id).subscribe((res) => {
          this.planned.set(
            res.data.map((p) => ({ month: p.month, value: p.plannedQuantity })),
          );
        });
        this.service.findExecution(product.id).subscribe((res) => {
          this.executed.set(
            res.data.map((e) => ({ month: e.month, value: e.executedQuantity })),
          );
        });
      }
    });
  }

  savePlan(e: { month: number; value: number }): void {
    const product = this.product();
    if (!product) return;
    this.service
      .upsertMonthlyPlan(product.id, e.month, e.value)
      .subscribe((res) => {
        if (res.success) {
          const current = this.planned().filter((p) => p.month !== e.month);
          this.planned.set([
            ...current,
            { month: e.month, value: res.data.plannedQuantity },
          ]);
        }
      });
  }

  saveExecution(e: { month: number; value: number }): void {
    const product = this.product();
    if (!product) return;
    this.service
      .upsertExecution(product.id, e.month, e.value)
      .subscribe((res) => {
        if (res.success) {
          const current = this.executed().filter((p) => p.month !== e.month);
          this.executed.set([
            ...current,
            { month: e.month, value: res.data.executedQuantity },
          ]);
        }
      });
  }

  close(): void {
    this.onClose.emit();
  }
}
