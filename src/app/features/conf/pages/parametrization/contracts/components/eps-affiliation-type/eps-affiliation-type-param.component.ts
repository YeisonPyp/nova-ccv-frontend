import { CommonModule } from "@angular/common";
import { Component, inject, signal } from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { AuthService } from "../../../../../../../core/services/auth.service";
import { ContractParamsService } from "../../../../../../../core/services/contract/contract-params.service";
import { EpsAffiliationType } from "../../../../../../../core/models/contract/contract-params.model";
import { DynamicTableComponent, TableColumn } from "../../../../../../../shared/components/dynamic-table/dynamic-table.component";
import { PaginationComponent } from "../../../../../../../shared/components/pagination/pagination.component";

@Component({
  selector: "app-eps-affiliation-type-param",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DynamicTableComponent, PaginationComponent],
  templateUrl: "./eps-affiliation-type-param.component.html",
  styles: [`
    @keyframes slideUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
    .modal-overlay { position:fixed; inset:0; z-index:50; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.4); backdrop-filter:blur(4px); }
    .modal-box { background:#fff; border-radius:12px; padding:24px; width:100%; max-width:480px; box-shadow:0 20px 60px rgba(0,0,0,0.15); animation:slideUp 0.2s ease-out; }
    .modal-title { font-size:1.1rem; font-weight:600; margin-bottom:16px; }
    .modal-footer { display:flex; justify-content:flex-end; gap:8px; margin-top:20px; }
  `],
})
export class EpsAffiliationTypeParamComponent {
  private readonly auth = inject(AuthService);
  private readonly contractParamsService = inject(ContractParamsService);

  epsAffiliationTypeItems = signal<EpsAffiliationType[]>([]);
  epsAffiliationTypePage = signal(1);
  epsAffiliationTypeSize = signal(10);
  epsAffiliationTypeTotalPages = signal(0);
  epsAffiliationTypeLoaded = signal(false);
  epsAffiliationTypeModalMode = signal<"create" | "update" | null>(null);
  showDeleteEpsAffiliationTypeModal = signal(false);
  editingEpsAffiliationType = signal<EpsAffiliationType | null>(null);

  epsAffiliationTypeForm = new FormGroup({
    name: new FormControl("", [Validators.required]),
    description: new FormControl(""),
  });

  epsAffiliationTypeColumns: TableColumn<EpsAffiliationType>[] = [
    { key: "name", label: "Nombre" },
    { key: "description", label: "Descripción" },
  ];

  get canReadEpsAffiliationType() { return this.auth.hasPermission("EPS_AFFILIATION_TYPE_READ"); }
  get canCreateEpsAffiliationType() { return this.auth.hasPermission("EPS_AFFILIATION_TYPE_CREATE"); }
  get canUpdateEpsAffiliationType() { return this.auth.hasPermission("EPS_AFFILIATION_TYPE_UPDATE"); }
  get canDeleteEpsAffiliationType() { return this.auth.hasPermission("EPS_AFFILIATION_TYPE_DELETE"); }

  onEpsAffiliationTypeToggle(e: Event) {
    if ((e.target as HTMLDetailsElement).open && !this.epsAffiliationTypeLoaded()) this.loadEpsAffiliationType(1);
  }

  loadEpsAffiliationType(page: number) {
    this.epsAffiliationTypePage.set(page);
    this.epsAffiliationTypeLoaded.set(true);
    this.contractParamsService.findEpsAffiliationTypes({ page: page - 1, size: this.epsAffiliationTypeSize() }).subscribe({
      next: (res) => { if (res.success && res.data) { this.epsAffiliationTypeItems.set(res.data.content); this.epsAffiliationTypeTotalPages.set(res.data.totalPages); } },
      error: () => this.epsAffiliationTypeLoaded.set(false),
    });
  }

  openCreateEpsAffiliationType() {
    this.epsAffiliationTypeForm.reset({ name: "", description: "" });
    this.editingEpsAffiliationType.set(null);
    this.epsAffiliationTypeModalMode.set("create");
  }

  openEditEpsAffiliationType(item: EpsAffiliationType) {
    this.epsAffiliationTypeForm.reset({ name: item.name, description: item.description ?? "" });
    this.editingEpsAffiliationType.set(item);
    this.epsAffiliationTypeModalMode.set("update");
  }

  closeEpsAffiliationTypeModal() { this.epsAffiliationTypeModalMode.set(null); }

  submitEpsAffiliationType() {
    if (this.epsAffiliationTypeForm.invalid) return;
    const { name, description } = this.epsAffiliationTypeForm.value;
    const mode = this.epsAffiliationTypeModalMode();
    if (mode === "create") {
      this.contractParamsService.createEpsAffiliationType({ name: name!, description: description ?? undefined }).subscribe({
        next: () => { this.closeEpsAffiliationTypeModal(); this.loadEpsAffiliationType(this.epsAffiliationTypePage()); },
      });
    } else if (mode === "update") {
      const item = this.editingEpsAffiliationType()!;
      this.contractParamsService.updateEpsAffiliationType(item.id, { name: name!, description: description ?? undefined }).subscribe({
        next: () => { this.closeEpsAffiliationTypeModal(); this.loadEpsAffiliationType(this.epsAffiliationTypePage()); },
      });
    }
  }

  openDeleteEpsAffiliationType(item: EpsAffiliationType) { this.editingEpsAffiliationType.set(item); this.showDeleteEpsAffiliationTypeModal.set(true); }
  closeDeleteEpsAffiliationTypeModal() { this.showDeleteEpsAffiliationTypeModal.set(false); this.editingEpsAffiliationType.set(null); }
  confirmDeleteEpsAffiliationType() {
    const item = this.editingEpsAffiliationType();
    if (!item) return;
    this.contractParamsService.deleteEpsAffiliationType(item.id).subscribe({
      next: () => { this.closeDeleteEpsAffiliationTypeModal(); this.loadEpsAffiliationType(this.epsAffiliationTypePage()); },
    });
  }
}
