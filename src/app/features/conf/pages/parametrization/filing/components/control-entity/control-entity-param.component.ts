import { CommonModule } from "@angular/common";
import { Component, inject, signal } from "@angular/core";
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { AuthService } from "../../../../../../../core/services/auth.service";
import { ControlEntityService } from "../../../../../../../core/services/improvement-plan/control-entity.service";
import { ControlEntity } from "../../../../../../../core/models/improvement-plan/control-entity.model";
import {
  DynamicTableComponent,
  TableColumn,
} from "../../../../../../../shared/components/dynamic-table/dynamic-table.component";
import { PaginationComponent } from "../../../../../../../shared/components/pagination/pagination.component";

@Component({
  selector: "app-control-entity-param",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DynamicTableComponent, PaginationComponent],
  templateUrl: "./control-entity-param.component.html",
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
export class ControlEntityParamComponent {
  private readonly auth = inject(AuthService);
  private readonly controlEntityService = inject(ControlEntityService);

  ceItems = signal<ControlEntity[]>([]);
  cePage = signal(1);
  ceSize = signal(10);
  ceTotalPages = signal(0);
  ceLoaded = signal(false);
  ceModalMode = signal<"create" | "update" | null>(null);
  showDeleteCeModal = signal(false);
  editingCe = signal<ControlEntity | null>(null);

  ceForm = new FormGroup({
    name: new FormControl("", [Validators.required, Validators.maxLength(255)]),
  });

  ceColumns: TableColumn<ControlEntity>[] = [{ key: "name", label: "Nombre" }];

  get canReadCe() { return this.auth.hasPermission("CONTROL_ENTITY_READ"); }
  get canCreateCe() { return this.auth.hasPermission("CONTROL_ENTITY_CREATE"); }
  get canUpdateCe() { return this.auth.hasPermission("CONTROL_ENTITY_UPDATE"); }
  get canDeleteCe() { return this.auth.hasPermission("CONTROL_ENTITY_DELETE"); }

  onCeToggle(e: Event) {
    if ((e.target as HTMLDetailsElement).open && !this.ceLoaded()) this.loadCe(1);
  }

  loadCe(page: number) {
    this.cePage.set(page);
    this.ceLoaded.set(true);
    this.controlEntityService
      .findAll({ page: page - 1, size: this.ceSize() })
      .subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.ceItems.set(res.data.content);
            this.ceTotalPages.set(res.data.totalPages);
          }
        },
        error: () => this.ceLoaded.set(false),
      });
  }

  openCreateCe() {
    this.ceForm.reset({ name: "" });
    this.editingCe.set(null);
    this.ceModalMode.set("create");
  }

  openEditCe(ce: ControlEntity) {
    this.ceForm.reset({ name: ce.name });
    this.editingCe.set(ce);
    this.ceModalMode.set("update");
  }

  closeCeModal() { this.ceModalMode.set(null); }

  submitCe() {
    if (this.ceForm.invalid) return;
    const { name } = this.ceForm.value;
    const dto = { name: name! };
    const mode = this.ceModalMode();
    if (mode === "create") {
      this.controlEntityService.create(dto).subscribe({
        next: () => { this.closeCeModal(); this.loadCe(this.cePage()); },
      });
    } else {
      this.controlEntityService.update(this.editingCe()!.id, dto).subscribe({
        next: () => { this.closeCeModal(); this.loadCe(this.cePage()); },
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
      next: () => { this.closeDeleteCeModal(); this.loadCe(this.cePage()); },
    });
  }
}
