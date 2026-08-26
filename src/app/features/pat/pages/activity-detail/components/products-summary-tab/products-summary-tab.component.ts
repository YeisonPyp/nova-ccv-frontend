import { Component, effect, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  DynamicTableComponent,
  TableColumn,
} from '@/app/shared/components/dynamic-table/dynamic-table.component';
import { PatActivityProductService } from '@/app/core/services/pat/pat-activity-product.service';
import { PatActivityProductSummary } from '@/app/core/models/pat/pat-models';

/**
 * Read-only rollup of the products delivered by this activity's tasks.
 * Products are created/edited on the task detail page.
 */
@Component({
  selector: 'app-pat-products-summary-tab',
  standalone: true,
  imports: [CommonModule, DynamicTableComponent],
  templateUrl: './products-summary-tab.component.html',
})
export class PatProductsSummaryTabComponent {
  private readonly service = inject(PatActivityProductService);

  activityId = input.required<number>();
  products = signal<PatActivityProductSummary[]>([]);

  readonly columns: TableColumn[] = [
    { key: 'taskName', label: 'Tarea' },
    { key: 'productName', label: 'Producto' },
    { key: 'targetQuantity', label: 'Meta' },
  ];

  constructor() {
    effect(() => {
      this.service.findByActivity(this.activityId()).subscribe((res) => {
        if (res.success) this.products.set(res.data);
      });
    });
  }
}
