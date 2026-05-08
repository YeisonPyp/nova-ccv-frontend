import { CommonModule } from "@angular/common";
import { Component, inject, signal } from "@angular/core";
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { AuthService } from "../../../../../../../core/services/auth.service";
import { AreaService } from "../../../../../../../core/services/assessment/area.service";
import { Area } from "../../../../../../../core/models/assessment/area.model";
import {
  DynamicTableComponent,
  TableColumn,
} from "../../../../../../../shared/components/dynamic-table/dynamic-table.component";
import { PaginationComponent } from "../../../../../../../shared/components/pagination/pagination.component";

@Component({
  selector: "app-areas-param",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DynamicTableComponent, PaginationComponent],
  templateUrl: "./areas-param.component.html",
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
export class AreasParamComponent {
  private readonly auth = inject(AuthService);
  private readonly areaService = inject(AreaService);

  areas = signal<Area[]>([]);
  areaPage = signal(1);
  areaSize = signal(10);
  areaTotalPages = signal(0);
  areasLoaded = signal(false);

  areaModalMode = signal<"create" | "update" | null>(null);
  showDeleteAreaModal = signal(false);
  editingArea = signal<Area | null>(null);

  areaForm = new FormGroup({
    name: new FormControl("", [Validators.required, Validators.maxLength(50)]),
  });

  areaColumns: TableColumn<Area>[] = [{ key: "name", label: "Nombre" }];

  get canReadArea() { return this.auth.hasPermission("AREA_READ"); }
  get canCreateArea() { return this.auth.hasPermission("AREA_CREATE"); }
  get canUpdateArea() { return this.auth.hasPermission("AREA_UPDATE"); }
  get canDeleteArea() { return this.auth.hasPermission("AREA_DELETE"); }

  onAreasToggle(event: Event) {
    if ((event.target as HTMLDetailsElement).open && !this.areasLoaded()) {
      this.loadAreas(1);
    }
  }

  loadAreas(page: number) {
    this.areaPage.set(page);
    this.areasLoaded.set(true);
    this.areaService
      .findAreas({ page: page - 1, size: this.areaSize() })
      .subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.areas.set(res.data.content);
            this.areaTotalPages.set(res.data.totalPages);
          }
        },
        error: () => this.areasLoaded.set(false),
      });
  }

  openCreateArea() {
    this.areaForm.reset({ name: "" });
    this.editingArea.set(null);
    this.areaModalMode.set("create");
  }

  openEditArea(area: Area) {
    this.areaForm.reset({ name: area.name });
    this.editingArea.set(area);
    this.areaModalMode.set("update");
  }

  closeAreaModal() { this.areaModalMode.set(null); }

  submitArea() {
    if (this.areaForm.invalid) return;
    const { name } = this.areaForm.value;
    const dto = { name: name! };
    const mode = this.areaModalMode();
    if (mode === "create") {
      this.areaService.createArea(dto).subscribe({
        next: () => { this.closeAreaModal(); this.loadAreas(this.areaPage()); },
      });
    } else if (mode === "update") {
      const area = this.editingArea()!;
      this.areaService.updateArea(area.id, dto).subscribe({
        next: () => { this.closeAreaModal(); this.loadAreas(this.areaPage()); },
      });
    }
  }

  openDeleteArea(area: Area) {
    this.editingArea.set(area);
    this.showDeleteAreaModal.set(true);
  }

  closeDeleteAreaModal() {
    this.showDeleteAreaModal.set(false);
    this.editingArea.set(null);
  }

  confirmDeleteArea() {
    const area = this.editingArea();
    if (!area) return;
    this.areaService.deleteArea(area.id).subscribe({
      next: () => { this.closeDeleteAreaModal(); this.loadAreas(this.areaPage()); },
    });
  }
}
