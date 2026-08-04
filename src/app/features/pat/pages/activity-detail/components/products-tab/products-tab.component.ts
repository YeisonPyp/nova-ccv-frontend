import { Component, effect, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  DynamicTableComponent,
  TableColumn,
} from '@/app/shared/components/dynamic-table/dynamic-table.component';
import { PatActivityProductService } from '@/app/core/services/pat/pat-activity-product.service';
import { PatActivityProduct } from '@/app/core/models/pat/pat-models';
import { PatProductUpsertModalComponent } from './components/product-upsert-modal.component';
import { PatProductMonthlyModalComponent } from './components/product-monthly-modal.component';
import { ProjectSectionCardComponent } from '@/app/features/projects/pages/project-detail/components/project-section-card/project-section-card.component';

@Component({
  selector: 'app-pat-products-tab',
  standalone: true,
  imports: [
    CommonModule,
    DynamicTableComponent,
    PatProductUpsertModalComponent,
    PatProductMonthlyModalComponent,
    ProjectSectionCardComponent,
  ],
  templateUrl: './products-tab.component.html',
})
export class PatProductsTabComponent {
  private readonly service = inject(PatActivityProductService);

  activityId = input.required<number>();
  products = signal<PatActivityProduct[]>([]);

  upsertModalOpen = signal(false);
  monthlyModalOpen = signal(false);
  editingProduct = signal<PatActivityProduct | null>(null);

  readonly columns: TableColumn[] = [
    { key: 'code', label: 'Código' },
    { key: 'name', label: 'Nombre' },
    { key: 'targetQuantity', label: 'Meta' },
    { key: 'unitMeasure', label: 'Unidad' },
  ];

  constructor() {
    effect(() => {
      this.service.findByActivity(this.activityId()).subscribe((res) => {
        if (res.success) this.products.set(res.data);
      });
    });
  }

  openCreate(): void {
    this.editingProduct.set(null);
    this.upsertModalOpen.set(true);
  }

  openEdit(product: PatActivityProduct): void {
    this.editingProduct.set(product);
    this.upsertModalOpen.set(true);
  }

  openMonthly(product: PatActivityProduct): void {
    this.editingProduct.set(product);
    this.monthlyModalOpen.set(true);
  }

  closeUpsertModal(): void {
    this.upsertModalOpen.set(false);
    this.editingProduct.set(null);
  }

  closeMonthlyModal(): void {
    this.monthlyModalOpen.set(false);
    this.editingProduct.set(null);
  }

  onSaved(product: PatActivityProduct): void {
    const current = this.products();
    const idx = current.findIndex((p) => p.id === product.id);
    if (idx >= 0) {
      const updated = [...current];
      updated[idx] = product;
      this.products.set(updated);
    } else {
      this.products.set([...current, product]);
    }
    this.closeUpsertModal();
  }

  delete(product: PatActivityProduct): void {
    this.service.delete(product.id).subscribe({
      next: () => {
        this.products.set(this.products().filter((p) => p.id !== product.id));
      },
    });
  }
}
