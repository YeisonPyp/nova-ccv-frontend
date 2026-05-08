import { CommonModule } from "@angular/common";
import { Component, inject, signal } from "@angular/core";
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { AuthService } from "../../../../../../../core/services/auth.service";
import { ProjectPriorityService } from "../../../../../../../core/services/projects/project-priority.service";
import { ProjectPriority } from "../../../../../../../core/models/projects/project-params.model";
import {
  DynamicTableComponent,
  TableColumn,
} from "../../../../../../../shared/components/dynamic-table/dynamic-table.component";
import { PaginationComponent } from "../../../../../../../shared/components/pagination/pagination.component";

@Component({
  selector: "app-project-priority-param",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DynamicTableComponent, PaginationComponent],
  templateUrl: "./project-priority-param.component.html",
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
export class ProjectPriorityParamComponent {
  private readonly auth = inject(AuthService);
  private readonly projectPriorityService = inject(ProjectPriorityService);

  projectPriorityItems = signal<ProjectPriority[]>([]);
  projectPriorityPage = signal(1);
  projectPrioritySize = signal(10);
  projectPriorityTotalPages = signal(0);
  projectPriorityLoaded = signal(false);
  projectPriorityModalMode = signal<"create" | "update" | null>(null);
  showDeleteProjectPriorityModal = signal(false);
  editingProjectPriority = signal<ProjectPriority | null>(null);

  projectPriorityForm = new FormGroup({
    name: new FormControl("", [Validators.required, Validators.maxLength(20)]),
    scale: new FormControl<number | null>(null, [Validators.required]),
  });

  projectPriorityColumns: TableColumn<ProjectPriority>[] = [
    { key: "name", label: "Nombre" },
    { key: "scale", label: "Escala" },
  ];

  get canReadProjectPriority() { return this.auth.hasPermission("PROJECT_PRIORITY_READ"); }
  get canCreateProjectPriority() { return this.auth.hasPermission("PROJECT_PRIORITY_CREATE"); }
  get canUpdateProjectPriority() { return this.auth.hasPermission("PROJECT_PRIORITY_UPDATE"); }
  get canDeleteProjectPriority() { return this.auth.hasPermission("PROJECT_PRIORITY_DELETE"); }

  onProjectPriorityToggle(e: Event) {
    if ((e.target as HTMLDetailsElement).open && !this.projectPriorityLoaded()) {
      this.loadProjectPriority(1);
    }
  }

  loadProjectPriority(page: number) {
    this.projectPriorityPage.set(page);
    this.projectPriorityLoaded.set(true);
    this.projectPriorityService
      .findAll({ page: page - 1, size: this.projectPrioritySize() })
      .subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.projectPriorityItems.set(res.data.content);
            this.projectPriorityTotalPages.set(res.data.totalPages);
          }
        },
        error: () => this.projectPriorityLoaded.set(false),
      });
  }

  openCreateProjectPriority() {
    this.projectPriorityForm.reset({ name: "", scale: null });
    this.editingProjectPriority.set(null);
    this.projectPriorityModalMode.set("create");
  }

  openEditProjectPriority(item: ProjectPriority) {
    this.projectPriorityForm.reset({ name: item.name, scale: item.scale });
    this.editingProjectPriority.set(item);
    this.projectPriorityModalMode.set("update");
  }

  closeProjectPriorityModal() { this.projectPriorityModalMode.set(null); }

  submitProjectPriority() {
    if (this.projectPriorityForm.invalid) return;
    const { name, scale } = this.projectPriorityForm.value;
    const mode = this.projectPriorityModalMode();
    if (mode === "create") {
      this.projectPriorityService.create(name!, scale!).subscribe({
        next: () => { this.closeProjectPriorityModal(); this.loadProjectPriority(this.projectPriorityPage()); },
      });
    } else if (mode === "update") {
      const item = this.editingProjectPriority()!;
      this.projectPriorityService.update(item.id, name!, scale!).subscribe({
        next: () => { this.closeProjectPriorityModal(); this.loadProjectPriority(this.projectPriorityPage()); },
      });
    }
  }

  openDeleteProjectPriority(item: ProjectPriority) {
    this.editingProjectPriority.set(item);
    this.showDeleteProjectPriorityModal.set(true);
  }

  closeDeleteProjectPriorityModal() {
    this.showDeleteProjectPriorityModal.set(false);
    this.editingProjectPriority.set(null);
  }

  confirmDeleteProjectPriority() {
    const item = this.editingProjectPriority();
    if (!item) return;
    this.projectPriorityService.delete(item.id).subscribe({
      next: () => { this.closeDeleteProjectPriorityModal(); this.loadProjectPriority(this.projectPriorityPage()); },
    });
  }
}
