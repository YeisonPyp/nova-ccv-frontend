import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '@/app/core/services/auth.service';
import { ProjectStatusService } from '@/app/core/services/projects/project-status.service';
import { ProjectStatus } from '@/app/core/models/projects/project-params.model';
import {
  DynamicTableComponent,
  TableColumn,
} from '@/app/shared/components/dynamic-table/dynamic-table.component';
import { PaginationComponent } from '@/app/shared/components/pagination/pagination.component';
import { ParametrizationSectionComponent } from '@/app/features/conf/components/parametrization-section.component';

@Component({
  selector: 'app-project-status-param',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DynamicTableComponent,
    PaginationComponent,
    ParametrizationSectionComponent,
  ],
  templateUrl: './project-status-param.component.html',
})
export class ProjectStatusParamComponent {
  private readonly auth = inject(AuthService);
  private readonly projectStatusService = inject(ProjectStatusService);

  projectStatusItems = signal<ProjectStatus[]>([]);
  projectStatusLoaded = signal(false);
  projectStatusModalMode = signal<'create' | 'update' | null>(null);
  showDeleteProjectStatusModal = signal(false);
  editingProjectStatus = signal<ProjectStatus | null>(null);

  projectStatusForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.maxLength(20)]),
  });

  projectStatusColumns: TableColumn[] = [{ key: 'name', label: 'Nombre' }];

  get canReadProjectStatus() {
    return this.auth.hasPermission('PROJECT_STATUS_READ');
  }
  get canCreateProjectStatus() {
    return this.auth.hasPermission('PROJECT_STATUS_CREATE');
  }
  get canUpdateProjectStatus() {
    return this.auth.hasPermission('PROJECT_STATUS_UPDATE');
  }
  get canDeleteProjectStatus() {
    return this.auth.hasPermission('PROJECT_STATUS_DELETE');
  }

  onProjectStatusToggle(open: boolean) {
    if (open && !this.projectStatusLoaded()) {
      this.loadProjectStatus();
    }
  }

  loadProjectStatus() {
    this.projectStatusLoaded.set(true);
    this.projectStatusService.findAll().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.projectStatusItems.set(res.data);
        }
      },
      error: () => this.projectStatusLoaded.set(false),
    });
  }

  openCreateProjectStatus() {
    this.projectStatusForm.reset({ name: '' });
    this.editingProjectStatus.set(null);
    this.projectStatusModalMode.set('create');
  }

  openEditProjectStatus(item: ProjectStatus) {
    this.projectStatusForm.reset({ name: item.name });
    this.editingProjectStatus.set(item);
    this.projectStatusModalMode.set('update');
  }

  closeProjectStatusModal() {
    this.projectStatusModalMode.set(null);
  }

  submitProjectStatus() {
    if (this.projectStatusForm.invalid) return;
    const { name } = this.projectStatusForm.value;
    const mode = this.projectStatusModalMode();
    if (mode === 'create') {
      this.projectStatusService.create(name!).subscribe({
        next: () => {
          this.closeProjectStatusModal();
          this.loadProjectStatus();
        },
      });
    } else if (mode === 'update') {
      const item = this.editingProjectStatus()!;
      this.projectStatusService.update(item.id, name!).subscribe({
        next: () => {
          this.closeProjectStatusModal();
          this.loadProjectStatus();
        },
      });
    }
  }

  openDeleteProjectStatus(item: ProjectStatus) {
    this.editingProjectStatus.set(item);
    this.showDeleteProjectStatusModal.set(true);
  }

  closeDeleteProjectStatusModal() {
    this.showDeleteProjectStatusModal.set(false);
    this.editingProjectStatus.set(null);
  }

  confirmDeleteProjectStatus() {
    const item = this.editingProjectStatus();
    if (!item) return;
    this.projectStatusService.delete(item.id).subscribe({
      next: () => {
        this.closeDeleteProjectStatusModal();
        this.loadProjectStatus();
      },
    });
  }
}
