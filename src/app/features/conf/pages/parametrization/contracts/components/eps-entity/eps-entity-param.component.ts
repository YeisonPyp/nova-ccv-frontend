import { CommonModule } from "@angular/common";
import { Component, inject, signal } from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { AuthService } from "../../../../../../../core/services/auth.service";
import { ContractParamsService } from "../../../../../../../core/services/contract/contract-params.service";
import { EpsEntity } from "../../../../../../../core/models/contract/contract-params.model";
import { DynamicTableComponent, TableColumn } from "../../../../../../../shared/components/dynamic-table/dynamic-table.component";
import { PaginationComponent } from "../../../../../../../shared/components/pagination/pagination.component";

@Component({
  selector: "app-eps-entity-param",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DynamicTableComponent, PaginationComponent],
  templateUrl: "./eps-entity-param.component.html",
  styles: [`
    @keyframes slideUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
    .modal-overlay { position:fixed; inset:0; z-index:50; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.4); backdrop-filter:blur(4px); }
    .modal-box { background:#fff; border-radius:12px; padding:24px; width:100%; max-width:480px; box-shadow:0 20px 60px rgba(0,0,0,0.15); animation:slideUp 0.2s ease-out; }
    .modal-title { font-size:1.1rem; font-weight:600; margin-bottom:16px; }
    .modal-footer { display:flex; justify-content:flex-end; gap:8px; margin-top:20px; }
  `],
})
export class EpsEntityParamComponent {
  private readonly auth = inject(AuthService);
  private readonly contractParamsService = inject(ContractParamsService);

  epsEntityItems = signal<EpsEntity[]>([]);
  epsEntityPage = signal(1);
  epsEntitySize = signal(10);
  epsEntityTotalPages = signal(0);
  epsEntityLoaded = signal(false);
  epsEntityModalMode = signal<"create" | "update" | null>(null);
  showDeleteEpsEntityModal = signal(false);
  editingEpsEntity = signal<EpsEntity | null>(null);

  epsEntityForm = new FormGroup({
    name: new FormControl("", [Validators.required, Validators.maxLength(40)]),
    description: new FormControl(""),
  });

  epsEntityColumns: TableColumn<EpsEntity>[] = [
    { key: "name", label: "Nombre" },
    { key: "description", label: "Descripción" },
  ];

  get canReadEpsEntity() { return this.auth.hasPermission("EPS_ENTITY_READ"); }
  get canCreateEpsEntity() { return this.auth.hasPermission("EPS_ENTITY_CREATE"); }
  get canUpdateEpsEntity() { return this.auth.hasPermission("EPS_ENTITY_UPDATE"); }
  get canDeleteEpsEntity() { return this.auth.hasPermission("EPS_ENTITY_DELETE"); }

  onEpsEntityToggle(e: Event) {
    if ((e.target as HTMLDetailsElement).open && !this.epsEntityLoaded()) this.loadEpsEntity(1);
  }

  loadEpsEntity(page: number) {
    this.epsEntityPage.set(page);
    this.epsEntityLoaded.set(true);
    this.contractParamsService.findEpsEntities({ page: page - 1, size: this.epsEntitySize() }).subscribe({
      next: (res) => { if (res.success && res.data) { this.epsEntityItems.set(res.data.content); this.epsEntityTotalPages.set(res.data.totalPages); } },
      error: () => this.epsEntityLoaded.set(false),
    });
  }

  openCreateEpsEntity() { this.epsEntityForm.reset({ name: "", description: "" }); this.editingEpsEntity.set(null); this.epsEntityModalMode.set("create"); }
  openEditEpsEntity(item: EpsEntity) { this.epsEntityForm.reset({ name: item.name, description: item.description ?? "" }); this.editingEpsEntity.set(item); this.epsEntityModalMode.set("update"); }
  closeEpsEntityModal() { this.epsEntityModalMode.set(null); }

  submitEpsEntity() {
    if (this.epsEntityForm.invalid) return;
    const { name, description } = this.epsEntityForm.value;
    const mode = this.epsEntityModalMode();
    if (mode === "create") {
      this.contractParamsService.createEpsEntity({ name: name!, description: description ?? undefined }).subscribe({
        next: () => { this.closeEpsEntityModal(); this.loadEpsEntity(this.epsEntityPage()); },
      });
    } else if (mode === "update") {
      const item = this.editingEpsEntity()!;
      this.contractParamsService.updateEpsEntity(item.id, { name: name!, description: description ?? undefined }).subscribe({
        next: () => { this.closeEpsEntityModal(); this.loadEpsEntity(this.epsEntityPage()); },
      });
    }
  }

  openDeleteEpsEntity(item: EpsEntity) { this.editingEpsEntity.set(item); this.showDeleteEpsEntityModal.set(true); }
  closeDeleteEpsEntityModal() { this.showDeleteEpsEntityModal.set(false); this.editingEpsEntity.set(null); }
  confirmDeleteEpsEntity() {
    const item = this.editingEpsEntity();
    if (!item) return;
    this.contractParamsService.deleteEpsEntity(item.id).subscribe({
      next: () => { this.closeDeleteEpsEntityModal(); this.loadEpsEntity(this.epsEntityPage()); },
    });
  }
}
