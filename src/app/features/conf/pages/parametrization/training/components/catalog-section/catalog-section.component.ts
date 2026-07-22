import { CommonModule } from '@angular/common';
import { Component, inject, input, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '@/app/core/services/auth.service';
import {
  DynamicTableComponent,
  TableColumn,
} from '@/app/shared/components/dynamic-table/dynamic-table.component';
import { ParametrizationSectionComponent } from '@/app/features/conf/components/parametrization-section.component';
import {
  TrainingCatalog,
  TrainingCatalogService,
} from '@/app/core/services/training/training-catalog.service';

/**
 * Reusable CRUD section for any name-only training catalog. Configure it with
 * the API `path` and permission `prefix`; everything else is shared.
 */
@Component({
  selector: 'app-catalog-section',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DynamicTableComponent,
    ParametrizationSectionComponent,
  ],
  templateUrl: './catalog-section.component.html',
})
export class CatalogSectionComponent {
  private readonly auth = inject(AuthService);
  private readonly service = inject(TrainingCatalogService);

  /** e.g. "training-topics" */
  path = input.required<string>();
  /** e.g. "TRAINING_TOPIC" */
  prefix = input.required<string>();
  title = input.required<string>();
  createLabel = input<string>('+ Nuevo');
  entityLabel = input<string>('registro');

  items = signal<TrainingCatalog[]>([]);
  loaded = signal(false);

  modalMode = signal<'create' | 'update' | null>(null);
  editing = signal<TrainingCatalog | null>(null);
  deleteTarget = signal<TrainingCatalog | null>(null);

  form = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.maxLength(255)]),
  });

  columns: TableColumn[] = [{ key: 'name', label: 'Nombre' }];

  get canRead() {
    return this.auth.hasPermission(`${this.prefix()}_READ`);
  }
  get canCreate() {
    return this.auth.hasPermission(`${this.prefix()}_CREATE`);
  }
  get canUpdate() {
    return this.auth.hasPermission(`${this.prefix()}_UPDATE`);
  }
  get canDelete() {
    return this.auth.hasPermission(`${this.prefix()}_DELETE`);
  }

  onToggle(open: boolean) {
    if (open && !this.loaded()) this.load();
  }

  load() {
    this.loaded.set(true);
    this.service.list(this.path()).subscribe({
      next: (res) => {
        if (res.success && res.data) this.items.set(res.data);
      },
      error: () => this.loaded.set(false),
    });
  }

  openCreate() {
    this.form.reset({ name: '' });
    this.editing.set(null);
    this.modalMode.set('create');
  }

  openEdit(item: TrainingCatalog) {
    this.form.reset({ name: item.name });
    this.editing.set(item);
    this.modalMode.set('update');
  }

  closeModal() {
    this.modalMode.set(null);
  }

  submit() {
    if (this.form.invalid) return;
    const dto = { name: this.form.value.name! };
    const done = () => {
      this.closeModal();
      this.load();
    };
    if (this.modalMode() === 'create') {
      this.service.create(this.path(), dto).subscribe({ next: done });
    } else {
      const item = this.editing()!;
      this.service.update(this.path(), item.id, dto).subscribe({ next: done });
    }
  }

  openDelete(item: TrainingCatalog) {
    this.deleteTarget.set(item);
  }

  closeDelete() {
    this.deleteTarget.set(null);
  }

  confirmDelete() {
    const item = this.deleteTarget();
    if (!item) return;
    this.service.delete(this.path(), item.id).subscribe({
      next: () => {
        this.closeDelete();
        this.load();
      },
    });
  }
}
