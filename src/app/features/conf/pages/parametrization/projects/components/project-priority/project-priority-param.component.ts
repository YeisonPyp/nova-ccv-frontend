import { CommonModule } from "@angular/common";
import { Component, inject, signal } from "@angular/core";
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { AuthService } from "@/app/core/services/auth.service";
import { ProjectPriorityService } from "@/app/core/services/projects/project-priority.service";
import { ProjectPriority } from "@/app/core/models/projects/project-params.model";
import {
  DynamicTableComponent,
  TableColumn,
} from "@/app/shared/components/dynamic-table/dynamic-table.component";

@Component({
  selector: "app-project-priority-param",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DynamicTableComponent],
  templateUrl: "./project-priority-param.component.html",
})
export class ProjectPriorityParamComponent {
  private readonly auth = inject(AuthService);
  private readonly projectPriorityService = inject(ProjectPriorityService);

  projectPriorityItems = signal<ProjectPriority[]>([]);
  projectPriorityLoaded = signal(false);
  projectPriorityModalMode = signal<"create" | "update" | null>(null);
  showDeleteProjectPriorityModal = signal(false);
  editingProjectPriority = signal<ProjectPriority | null>(null);

  projectPriorityForm = new FormGroup({
    name: new FormControl("", [Validators.required, Validators.maxLength(20)]),
    scale: new FormControl<number | null>(null, [Validators.required]),
  });

  projectPriorityColumns: TableColumn[] = [
    { key: "name", label: "Nombre" },
    { key: "scale", label: "Escala" },
  ];

  get canReadProjectPriority() {
    return this.auth.hasPermission("PROJECT_PRIORITY_READ");
  }
  get canCreateProjectPriority() {
    return this.auth.hasPermission("PROJECT_PRIORITY_CREATE");
  }
  get canUpdateProjectPriority() {
    return this.auth.hasPermission("PROJECT_PRIORITY_UPDATE");
  }
  get canDeleteProjectPriority() {
    return this.auth.hasPermission("PROJECT_PRIORITY_DELETE");
  }

  onProjectPriorityToggle(e: Event) {
    if (
      (e.target as HTMLDetailsElement).open &&
      !this.projectPriorityLoaded()
    ) {
      this.loadProjectPriority();
    }
  }

  loadProjectPriority() {
    this.projectPriorityLoaded.set(true);
    this.projectPriorityService.findAll().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.projectPriorityItems.set(res.data);
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

  closeProjectPriorityModal() {
    this.projectPriorityModalMode.set(null);
  }

  submitProjectPriority() {
    if (this.projectPriorityForm.invalid) return;
    const { name, scale } = this.projectPriorityForm.value;
    const mode = this.projectPriorityModalMode();
    if (mode === "create") {
      this.projectPriorityService.create(name!, scale!).subscribe({
        next: () => {
          this.closeProjectPriorityModal();
          this.loadProjectPriority();
        },
      });
    } else if (mode === "update") {
      const item = this.editingProjectPriority()!;
      this.projectPriorityService.update(item.id, name!, scale!).subscribe({
        next: () => {
          this.closeProjectPriorityModal();
          this.loadProjectPriority();
        },
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
      next: () => {
        this.closeDeleteProjectPriorityModal();
        this.loadProjectPriority();
      },
    });
  }
}
