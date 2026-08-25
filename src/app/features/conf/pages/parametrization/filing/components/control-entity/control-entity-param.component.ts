import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '@/app/core/services/auth.service';
import { ControlEntityService } from '@/app/core/services/improvement-plan/control-entity.service';
import { ControlEntity } from '@/app/core/models/improvement-plan/control-entity.model';
import {
  DynamicTableComponent,
  TableColumn,
} from '@/app/shared/components/dynamic-table/dynamic-table.component';
import { ParametrizationSectionComponent } from '@/app/features/conf/components/parametrization-section.component';

@Component({
  selector: 'app-control-entity-param',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DynamicTableComponent,
    ParametrizationSectionComponent,
  ],
  templateUrl: './control-entity-param.component.html',
})
export class ControlEntityParamComponent {
  private readonly auth = inject(AuthService);
  private readonly controlEntityService = inject(ControlEntityService);

  ceItems = signal<ControlEntity[]>([]);
  ceLoaded = signal(false);
  ceModalMode = signal<'create' | 'update' | null>(null);
  showDeleteCeModal = signal(false);
  editingCe = signal<ControlEntity | null>(null);

  ceForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.maxLength(255)]),
  });

  ceColumns: TableColumn[] = [{ key: 'name', label: 'Nombre' }];

  get canReadCe() {
    return this.auth.hasPermission('CONTROL_ENTITY_READ');
  }
  get canCreateCe() {
    return this.auth.hasPermission('CONTROL_ENTITY_CREATE');
  }
  get canUpdateCe() {
    return this.auth.hasPermission('CONTROL_ENTITY_UPDATE');
  }
  get canDeleteCe() {
    return this.auth.hasPermission('CONTROL_ENTITY_DELETE');
  }

  onCeToggle(open: boolean) {
    if (open && !this.ceLoaded()) this.loadCe();
  }

  loadCe() {
    this.ceLoaded.set(true);
    this.controlEntityService.findAll().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.ceItems.set(res.data);
        }
      },
      error: () => this.ceLoaded.set(false),
    });
  }

  openCreateCe() {
    this.ceForm.reset({ name: '' });
    this.editingCe.set(null);
    this.ceModalMode.set('create');
  }

  openEditCe(ce: ControlEntity) {
    this.ceForm.reset({ name: ce.name });
    this.editingCe.set(ce);
    this.ceModalMode.set('update');
  }

  closeCeModal() {
    this.ceModalMode.set(null);
  }

  submitCe() {
    if (this.ceForm.invalid) return;
    const { name } = this.ceForm.value;
    const dto = { name: name! };
    const mode = this.ceModalMode();
    if (mode === 'create') {
      this.controlEntityService.create(dto).subscribe({
        next: () => {
          this.closeCeModal();
          this.loadCe();
        },
      });
    } else {
      this.controlEntityService.update(this.editingCe()!.id, dto).subscribe({
        next: () => {
          this.closeCeModal();
          this.loadCe();
        },
      });
    }
  }

  openDeleteCe(ce: ControlEntity) {
    this.editingCe.set(ce);
    this.showDeleteCeModal.set(true);
  }

  closeDeleteCeModal() {
    this.showDeleteCeModal.set(false);
    this.editingCe.set(null);
  }

  confirmDeleteCe() {
    const ce = this.editingCe();
    if (!ce) return;
    this.controlEntityService.delete(ce.id).subscribe({
      next: () => {
        this.closeDeleteCeModal();
        this.loadCe();
      },
    });
  }
}
