import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
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
import { SearchSelectComponent } from '@/app/shared/components/search-select/search-select.component';
import {
  CreateTrainerDto,
  Trainer,
  TrainerService,
} from '@/app/core/services/training/trainer.service';
import { EmployeeService } from '@/app/core/services/assessment/employee.service';

@Component({
  selector: 'app-trainer-section',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DynamicTableComponent,
    ParametrizationSectionComponent,
    SearchSelectComponent,
  ],
  templateUrl: './trainer-section.component.html',
})
export class TrainerSectionComponent {
  private readonly auth = inject(AuthService);
  private readonly service = inject(TrainerService);
  private readonly employeeService = inject(EmployeeService);

  items = signal<Trainer[]>([]);
  loaded = signal(false);

  modalMode = signal<'create' | 'update' | null>(null);
  editing = signal<Trainer | null>(null);
  deleteTarget = signal<Trainer | null>(null);

  selectedEmployeeId = signal<number | null>(null);

  // Employee live-search context for the search-select
  employeeContext = this.employeeService.newSearchSelectEmployeeContext(
    (e) => this.selectedEmployeeId.set(e.id),
    { maxItems: 1, label: 'Empleado (opcional)', placeholder: 'Buscar empleado…' },
    () => this.selectedEmployeeId.set(null),
  );

  form = new FormGroup({
    name: new FormControl('', [Validators.required]),
    lastname: new FormControl('', [Validators.required]),
  });

  columns: TableColumn[] = [
    { key: 'name', label: 'Nombre' },
    { key: 'lastname', label: 'Apellido' },
    {
      key: 'type',
      label: 'Tipo',
      valueCallBack: (t: Trainer) => (t.employeeId ? 'Interno' : 'Externo'),
    },
  ];

  get canCreate() {
    return this.auth.hasPermission('TRAINER_CREATE');
  }
  get canUpdate() {
    return this.auth.hasPermission('TRAINER_UPDATE');
  }
  get canDelete() {
    return this.auth.hasPermission('TRAINER_DELETE');
  }

  onToggle(open: boolean) {
    if (open && !this.loaded()) this.load();
  }

  load() {
    this.loaded.set(true);
    this.service.list().subscribe({
      next: (res) => {
        if (res.success && res.data) this.items.set(res.data);
      },
      error: () => this.loaded.set(false),
    });
  }

  openCreate() {
    this.form.reset({ name: '', lastname: '' });
    this.editing.set(null);
    this.selectedEmployeeId.set(null);
    this.employeeContext.clear();
    this.modalMode.set('create');
  }

  openEdit(item: Trainer) {
    this.form.reset({ name: item.name, lastname: item.lastname });
    this.editing.set(item);
    this.selectedEmployeeId.set(item.employeeId ?? null);
    this.employeeContext.clear();
    if (item.employeeId) {
      this.employeeContext.selectedOptions.set([
        {
          id: item.employeeId,
          title: `${item.employeeName ?? ''} ${item.employeeLastName ?? ''}`,
        },
      ]);
    }
    this.modalMode.set('update');
  }

  closeModal() {
    this.modalMode.set(null);
  }

  searchEmployee(term: string) {
    this.employeeContext.search(term);
  }

  submit() {
    if (this.form.invalid) return;
    const dto: CreateTrainerDto = {
      name: this.form.value.name!,
      lastname: this.form.value.lastname!,
      employeeId: this.selectedEmployeeId(),
    };
    const done = () => {
      this.closeModal();
      this.load();
    };
    if (this.modalMode() === 'create') {
      this.service.create(dto).subscribe({ next: done });
    } else {
      this.service.update(this.editing()!.id, dto).subscribe({ next: done });
    }
  }

  openDelete(item: Trainer) {
    this.deleteTarget.set(item);
  }

  closeDelete() {
    this.deleteTarget.set(null);
  }

  confirmDelete() {
    const item = this.deleteTarget();
    if (!item) return;
    this.service.delete(item.id).subscribe({
      next: () => {
        this.closeDelete();
        this.load();
      },
    });
  }
}
