import { CommonModule } from '@angular/common';
import { Component, ViewChild, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  CreatePresupuestalCategoryDto,
  PatPresupuestalCategoryService,
  PresupuestalCategory,
} from '@/app/core/services/pat/pat-presupuestal-category.service';
import { PaginationTableComponent } from '@/app/shared/components/pagination-table/pagination-table.component';
import { TableColumn } from '@/app/shared/components/dynamic-table/dynamic-table.component';

@Component({
  selector: 'app-presupuestal-categories',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PaginationTableComponent],
  templateUrl: './presupuestal-categories.component.html',
})
export class PresupuestalCategoriesComponent {
  service = inject(PatPresupuestalCategoryService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  @ViewChild(PaginationTableComponent)
  table?: PaginationTableComponent<PresupuestalCategory>;

  modalOpen = signal(false);
  saving = signal(false);

  columns: TableColumn[] = [
    { key: 'code', label: 'Código' },
    { key: 'name', label: 'Nombre' },
    { key: 'resourceType', label: 'Tipo de recurso' },
    {
      key: 'amount',
      label: 'Disponible',
      valueCallBack: (c: PresupuestalCategory) => this.money(c.amount),
    },
    {
      key: 'plannedBudget',
      label: 'Planeado',
      valueCallBack: (c: PresupuestalCategory) => this.money(c.plannedBudget),
    },
    {
      key: 'unplannedBudget',
      label: 'No planeado',
      valueCallBack: (c: PresupuestalCategory) => this.money(c.unplannedBudget),
    },
  ];

  form = this.fb.group({
    code: ['', [Validators.maxLength(20)]],
    name: ['', [Validators.required, Validators.maxLength(300)]],
    resourceType: ['', [Validators.maxLength(20)]],
    description: [''],
  });

  private money(v: number | null | undefined): string {
    return (v ?? 0).toLocaleString('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    });
  }

  openDetail(c: PresupuestalCategory) {
    this.router.navigate(['/pat/budget', c.id]);
  }

  openCreate() {
    this.form.reset({ code: '', name: '', resourceType: '', description: '' });
    this.modalOpen.set(true);
  }

  closeModal() {
    this.modalOpen.set(false);
  }

  submit() {
    if (this.form.invalid || this.saving()) return;
    this.saving.set(true);
    const dto = this.form.value as unknown as CreatePresupuestalCategoryDto;
    this.service.create(dto).subscribe({
      next: () => {
        this.saving.set(false);
        this.closeModal();
        const t = this.table;
        if (t) t.load(t.currentPage());
      },
      error: () => this.saving.set(false),
    });
  }
}
