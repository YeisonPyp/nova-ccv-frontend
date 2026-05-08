import { CommonModule } from "@angular/common";
import { Component, inject, signal } from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { AuthService } from "../../../../../../../core/services/auth.service";
import { ContractParamsService } from "../../../../../../../core/services/contract/contract-params.service";
import { CompensationEntity } from "../../../../../../../core/models/contract/contract-params.model";
import { DynamicTableComponent, TableColumn } from "../../../../../../../shared/components/dynamic-table/dynamic-table.component";
import { PaginationComponent } from "../../../../../../../shared/components/pagination/pagination.component";

@Component({
  selector: "app-compensation-entity-param",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DynamicTableComponent, PaginationComponent],
  templateUrl: "./compensation-entity-param.component.html",
  styles: [`
    @keyframes slideUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
    .modal-overlay { position:fixed; inset:0; z-index:50; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.4); backdrop-filter:blur(4px); }
    .modal-box { background:#fff; border-radius:12px; padding:24px; width:100%; max-width:480px; box-shadow:0 20px 60px rgba(0,0,0,0.15); animation:slideUp 0.2s ease-out; }
    .modal-title { font-size:1.1rem; font-weight:600; margin-bottom:16px; }
    .modal-footer { display:flex; justify-content:flex-end; gap:8px; margin-top:20px; }
  `],
})
export class CompensationEntityParamComponent {
  private readonly auth = inject(AuthService);
  private readonly contractParamsService = inject(ContractParamsService);

  compensationEntityItems = signal<CompensationEntity[]>([]);
  compensationEntityPage = signal(1);
  compensationEntitySize = signal(10);
  compensationEntityTotalPages = signal(0);
  compensationEntityLoaded = signal(false);
  compensationEntityModalMode = signal<"create" | "update" | null>(null);
  showDeleteCompensationEntityModal = signal(false);
  editingCompensationEntity = signal<CompensationEntity | null>(null);

  compensationEntityForm = new FormGroup({
    name: new FormControl("", [Validators.required, Validators.maxLength(40)]),
    description: new FormControl(""),
  });

  compensationEntityColumns: TableColumn<CompensationEntity>[] = [
    { key: "name", label: "Nombre" },
    { key: "description", label: "Descripción" },
  ];

  get canReadCompensationEntity() { return this.auth.hasPermission("COMPENSATION_ENTITY_READ"); }
  get canCreateCompensationEntity() { return this.auth.hasPermission("COMPENSATION_ENTITY_CREATE"); }
  get canUpdateCompensationEntity() { return this.auth.hasPermission("COMPENSATION_ENTITY_UPDATE"); }
  get canDeleteCompensationEntity() { return this.auth.hasPermission("COMPENSATION_ENTITY_DELETE"); }

  onCompensationEntityToggle(e: Event) {
    if ((e.target as HTMLDetailsElement).open && !this.compensationEntityLoaded()) this.loadCompensationEntity(1);
  }

  loadCompensationEntity(page: number) {
    this.compensationEntityPage.set(page);
    this.compensationEntityLoaded.set(true);
    this.contractParamsService.findCompensationEntities({ page: page - 1, size: this.compensationEntitySize() }).subscribe({
      next: (res) => { if (res.success && res.data) { this.compensationEntityItems.set(res.data.content); this.compensationEntityTotalPages.set(res.data.totalPages); } },
      error: () => this.compensationEntityLoaded.set(false),
    });
  }

  openCreateCompensationEntity() { this.compensationEntityForm.reset({ name: "", description: "" }); this.editingCompensationEntity.set(null); this.compensationEntityModalMode.set("create"); }
  openEditCompensationEntity(item: CompensationEntity) { this.compensationEntityForm.reset({ name: item.name, description: item.description ?? "" }); this.editingCompensationEntity.set(item); this.compensationEntityModalMode.set("update"); }
  closeCompensationEntityModal() { this.compensationEntityModalMode.set(null); }

  submitCompensationEntity() {
    if (this.compensationEntityForm.invalid) return;
    const { name, description } = this.compensationEntityForm.value;
    const mode = this.compensationEntityModalMode();
    if (mode === "create") {
      this.contractParamsService.createCompensationEntity({ name: name!, description: description ?? undefined }).subscribe({
        next: () => { this.closeCompensationEntityModal(); this.loadCompensationEntity(this.compensationEntityPage()); },
      });
    } else if (mode === "update") {
      const item = this.editingCompensationEntity()!;
      this.contractParamsService.updateCompensationEntity(item.id, { name: name!, description: description ?? undefined }).subscribe({
        next: () => { this.closeCompensationEntityModal(); this.loadCompensationEntity(this.compensationEntityPage()); },
      });
    }
  }

  openDeleteCompensationEntity(item: CompensationEntity) { this.editingCompensationEntity.set(item); this.showDeleteCompensationEntityModal.set(true); }
  closeDeleteCompensationEntityModal() { this.showDeleteCompensationEntityModal.set(false); this.editingCompensationEntity.set(null); }
  confirmDeleteCompensationEntity() {
    const item = this.editingCompensationEntity();
    if (!item) return;
    this.contractParamsService.deleteCompensationEntity(item.id).subscribe({
      next: () => { this.closeDeleteCompensationEntityModal(); this.loadCompensationEntity(this.compensationEntityPage()); },
    });
  }
}
