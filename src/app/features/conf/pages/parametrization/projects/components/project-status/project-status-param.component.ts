import { CommonModule } from "@angular/common";
import { Component, inject, signal } from "@angular/core";
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { AuthService } from "../../../../../../../core/services/auth.service";
import { ProjectStatusService } from "../../../../../../../core/services/projects/project-status.service";
import { ProjectStatus } from "../../../../../../../core/models/projects/project-params.model";
import {
  DynamicTableComponent,
  TableColumn,
} from "../../../../../../../shared/components/dynamic-table/dynamic-table.component";
import { PaginationComponent } from "../../../../../../../shared/components/pagination/pagination.component";

@Component({
  selector: "app-project-status-param",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DynamicTableComponent, PaginationComponent],
  templateUrl: "./project-status-param.component.html",
  styles: [
    `
      @keyframes slideUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .modal-overlay {
        position: fixed; inset: 0; z-index: 50;
        display: flex; align-items: center; justify-content: center;
        background: rgba(0,0,0,0.4); backdrop-filter: blur(4px);
      }
      .modal-box {
        background: #fff; border-radius: 12px; padding: 24px;
        width: 100%; max-width: 480px;
        box-shadow: 0 20px 60px rgba(0,0,0,0.15);
        animation: slideUp 0.2s ease-out;
      }
      .modal-title { font-size: 1.1rem; font-weight: 600; margin-bottom: 16px; }
      .modal-footer { display: flex; justify-content: flex-end; gap: 8px; margin-top: 20px; }
    `,
  ],
})
export class ProjectStatusParamComponent {
  private readonly auth = inject(AuthService);
  private readonly projectStatusService = inject(ProjectStatusService);

  projectStatusItems = signal<ProjectStatus[]>([]);
  projectStatusPage = signal(1);
  projectStatusSize = signal(10);
  projectStatusTotalPages = signal(0);
  projectStatusLoaded = signal(false);
  projectStatusModalMode = signal<"create" | "update" | null>(null);
  showDeleteProjectStatusModal = signal(false);
  editingProjectStatus = signal<ProjectStatus | null>(null);

  projectStatusForm = new FormGroup({
    name: new FormControl("", [Validators.required, Validators.maxLength(20)]),
  });

  projectStatusColumns: TableColumn<ProjectStatus>[] = [
    { key: "name", label: "Nombre" },
  ];

  get canReadProjectStatus() { return this.auth.hasPermission("PROJECT_STATUS_READ"); }
  get canCreateProjectStatus() { return this.auth.hasPermission("PROJECT_STATUS_CREATE"); }
  get canUpdateProjectStatus() { return this.auth.hasPermission("PROJECT_STATUS_UPDATE"); }
  get canDeleteProjectStatus() { return this.auth.hasPermission("PROJECT_STATUS_DELETE"); }

  onProjectStatusToggle(e: Event) {
    if ((e.target as HTMLDetailsElement).open && !this.projectStatusLoaded()) {
      this.loadProjectStatus(1);
    }
  }

  loadProjectStatus(page: number) {
    this.projectStatusPage.set(page);
    this.projectStatusLoaded.set(true);
    this.projectStatusService
      .findAll({ page: page - 1, size: this.projectStatusSize() })
      .subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.projectStatusItems.set(res.data.content);
            this.projectStatusTotalPages.set(res.data.totalPages);
          }
        },
        error: () => this.projectStatusLoaded.set(false),
      });
  }

  openCreateProjectStatus() {
    this.projectStatusForm.reset({ name: "" });
    this.editingProjectStatus.set(null);
    this.projectStatusModalMode.set("create");
  }

  openEditProjectStatus(item: ProjectStatus) {
    this.projectStatusForm.reset({ name: item.name });
    this.editingProjectStatus.set(item);
    this.projectStatusModalMode.set("update");
  }

  closeProjectStatusModal() { this.projectStatusModalMode.set(null); }

  submitProjectStatus() {
    if (this.projectStatusForm.invalid) return;
    const { name } = this.projectStatusForm.value;
    const mode = this.projectStatusModalMode();
    if (mode === "create") {
      this.projectStatusService.create(name!).subscribe({
        next: () => { this.closeProjectStatusModal(); this.loadProjectStatus(this.projectStatusPage()); },
      });
    } else if (mode === "update") {
      const item = this.editingProjectStatus()!;
      this.projectStatusService.update(item.id, name!).subscribe({
        next: () => { this.closeProjectStatusModal(); this.loadProjectStatus(this.projectStatusPage()); },
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
      next: () => { this.closeDeleteProjectStatusModal(); this.loadProjectStatus(this.projectStatusPage()); },
    });
  }
}
