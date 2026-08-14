import {
  Component,
  inject,
  signal,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PaginationTableComponent } from '@/app/shared/components/pagination-table/pagination-table.component';
import { TableColumn } from '@/app/shared/components/dynamic-table/dynamic-table.component';
import {
  PatPresupuestalCategoryService,
  PresupuestalCategory,
} from '@/app/core/services/pat/pat-presupuestal-category.service';
import { ParametrizationSectionComponent } from '@/app/features/conf/components/parametrization-section.component';

@Component({
  selector: 'app-presupuestal-category-param',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ParametrizationSectionComponent,
    PaginationTableComponent,
  ],
  template: `
    <app-parametrization-section
      title="Categorías Presupuestales"
      [canCreate]="true"
      createLabel="+ Nueva Categoría"
      (onOpen)="isOpen.set($event)"
      (onCreate)="openCreateModal()"
    >
      @if (isOpen()) {
        <app-pagination-table [service]="service" [tableColumns]="columns">
          <ng-template #actions let-item>
            <button
              class="icon-btn text-indigo-600 hover:text-indigo-900"
              (click)="openEditModal(item)"
              title="Editar"
            >
              <i class="fi fi-rr-edit"></i>
            </button>
            <button
              class="icon-btn text-red-600 hover:text-red-900"
              (click)="deleteItem(item)"
              title="Eliminar"
            >
              <i class="fi fi-rr-trash"></i>
            </button>
          </ng-template>
        </app-pagination-table>
      }
    </app-parametrization-section>

    <!-- Modal -->
    @if (isModalOpen()) {
      <div class="modal-overlay" (click)="closeModal()">
        <div class="modal-container" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2 class="modal-title">
              {{ selectedCategory() ? 'Editar Categoría' : 'Nueva Categoría' }}
            </h2>
            <button type="button" class="close-btn" (click)="closeModal()">
              &times;
            </button>
          </div>

          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <div class="modal-body space-y-4">
              <div class="form-group">
                <label>Código <span class="required">*</span></label>
                <input
                  type="text"
                  formControlName="code"
                  class="form-control"
                  [class.is-invalid]="
                    form.get('code')?.invalid && form.get('code')?.touched
                  "
                />
              </div>

              <div class="form-group">
                <label>Nombre <span class="required">*</span></label>
                <input
                  type="text"
                  formControlName="name"
                  class="form-control"
                  [class.is-invalid]="
                    form.get('name')?.invalid && form.get('name')?.touched
                  "
                />
              </div>

              <div class="form-group">
                <label>Tipo de Recurso</label>
                <select formControlName="resourceType" class="form-control">
                  <option value="public">Público</option>
                  <option value="private">Privado</option>
                </select>
              </div>

              <div class="form-group">
                <label>Descripción</label>
                <textarea
                  formControlName="description"
                  class="form-control"
                  rows="3"
                ></textarea>
              </div>
            </div>

            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-secondary"
                (click)="closeModal()"
              >
                Cancelar
              </button>
              <button
                type="submit"
                class="btn btn-primary"
                [disabled]="form.invalid || submitting"
              >
                Guardar
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
})
export class PresupuestalCategoryParamComponent {
  service = inject(PatPresupuestalCategoryService);
  private fb = inject(FormBuilder);

  isOpen = signal(false);
  isModalOpen = signal(false);
  submitting = false;
  selectedCategory = signal<PresupuestalCategory | null>(null);

  @ViewChild(PaginationTableComponent) table?: PaginationTableComponent;

  form = this.fb.group({
    code: ['', [Validators.required, Validators.maxLength(20)]],
    name: ['', [Validators.required, Validators.maxLength(300)]],
    resourceType: ['public', Validators.maxLength(20)],
    description: [''],
  });

  columns: TableColumn[] = [
    { key: 'code', label: 'Código' },
    { key: 'name', label: 'Nombre' },
    { key: 'resourceType', label: 'Tipo' },
    { key: 'description', label: 'Descripción' },
  ];

  openCreateModal() {
    this.selectedCategory.set(null);
    this.form.reset({ resourceType: 'public' });
    this.isModalOpen.set(true);
  }

  openEditModal(item: PresupuestalCategory) {
    this.selectedCategory.set(item);
    this.form.patchValue({
      code: item.code,
      name: item.name,
      resourceType: item.resourceType,
      description: item.description,
    });
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.submitting = true;

    const dto = this.form.value as any;
    const current = this.selectedCategory();

    const request = current
      ? this.service.update(current.id, dto)
      : this.service.create(dto);

    request.subscribe({
      next: (res) => {
        if (res.success) {
          this.closeModal();
          // this.table?.load(this.table?.currentPage());
        }
        this.submitting = false;
      },
      error: () => (this.submitting = false),
    });
  }

  deleteItem(item: PresupuestalCategory) {
    if (!confirm(`¿Eliminar categoría presupuestal "${item.name}"?`)) return;

    this.service.delete(item.id).subscribe({
      next: (res) => {
        if (res.success) {
          // this.table?.load(this.table?.currentPage());
        }
      },
    });
  }
}
