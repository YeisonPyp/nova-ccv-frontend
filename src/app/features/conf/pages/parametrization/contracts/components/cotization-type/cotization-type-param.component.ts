import { CommonModule } from "@angular/common";
import { Component, inject, signal } from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { AuthService } from "../../../../../../../core/services/auth.service";
import { ContractParamsService } from "../../../../../../../core/services/contract/contract-params.service";
import { CotizationType } from "../../../../../../../core/models/contract/contract-params.model";
import { DynamicTableComponent, TableColumn } from "../../../../../../../shared/components/dynamic-table/dynamic-table.component";
import { PaginationComponent } from "../../../../../../../shared/components/pagination/pagination.component";

@Component({
  selector: "app-cotization-type-param",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DynamicTableComponent, PaginationComponent],
  templateUrl: "./cotization-type-param.component.html",
  styles: [`
    @keyframes slideUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
    .modal-overlay { position:fixed; inset:0; z-index:50; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.4); backdrop-filter:blur(4px); }
    .modal-box { background:#fff; border-radius:12px; padding:24px; width:100%; max-width:480px; box-shadow:0 20px 60px rgba(0,0,0,0.15); animation:slideUp 0.2s ease-out; }
    .modal-title { font-size:1.1rem; font-weight:600; margin-bottom:16px; }
    .modal-footer { display:flex; justify-content:flex-end; gap:8px; margin-top:20px; }
  `],
})
export class CotizationTypeParamComponent {
  private readonly auth = inject(AuthService);
  private readonly contractParamsService = inject(ContractParamsService);

  cotizationTypeItems = signal<CotizationType[]>([]);
  cotizationTypePage = signal(1);
  cotizationTypeSize = signal(10);
  cotizationTypeTotalPages = signal(0);
  cotizationTypeLoaded = signal(false);
  cotizationTypeModalMode = signal<"create" | "update" | null>(null);
  showDeleteCotizationTypeModal = signal(false);
  editingCotizationType = signal<CotizationType | null>(null);

  cotizationTypeForm = new FormGroup({
    name: new FormControl("", [Validators.required]),
    description: new FormControl(""),
  });

  cotizationTypeColumns: TableColumn<CotizationType>[] = [
    { key: "name", label: "Nombre" },
    { key: "description", label: "Descripción" },
  ];

  get canReadCotizationType() { return this.auth.hasPermission("COTIZATION_TYPE_READ"); }
  get canCreateCotizationType() { return this.auth.hasPermission("COTIZATION_TYPE_CREATE"); }
  get canUpdateCotizationType() { return this.auth.hasPermission("COTIZATION_TYPE_UPDATE"); }
  get canDeleteCotizationType() { return this.auth.hasPermission("COTIZATION_TYPE_DELETE"); }

  onCotizationTypeToggle(e: Event) {
    if ((e.target as HTMLDetailsElement).open && !this.cotizationTypeLoaded()) this.loadCotizationType(1);
  }

  loadCotizationType(page: number) {
    this.cotizationTypePage.set(page);
    this.cotizationTypeLoaded.set(true);
    this.contractParamsService.findCotizationTypes({ page: page - 1, size: this.cotizationTypeSize() }).subscribe({
      next: (res) => { if (res.success && res.data) { this.cotizationTypeItems.set(res.data.content); this.cotizationTypeTotalPages.set(res.data.totalPages); } },
      error: () => this.cotizationTypeLoaded.set(false),
    });
  }

  openCreateCotizationType() { this.cotizationTypeForm.reset({ name: "", description: "" }); this.editingCotizationType.set(null); this.cotizationTypeModalMode.set("create"); }
  openEditCotizationType(item: CotizationType) { this.cotizationTypeForm.reset({ name: item.name, description: item.description ?? "" }); this.editingCotizationType.set(item); this.cotizationTypeModalMode.set("update"); }
  closeCotizationTypeModal() { this.cotizationTypeModalMode.set(null); }

  submitCotizationType() {
    if (this.cotizationTypeForm.invalid) return;
    const { name, description } = this.cotizationTypeForm.value;
    const mode = this.cotizationTypeModalMode();
    if (mode === "create") {
      this.contractParamsService.createCotizationType({ name: name!, description: description ?? undefined }).subscribe({
        next: () => { this.closeCotizationTypeModal(); this.loadCotizationType(this.cotizationTypePage()); },
      });
    } else if (mode === "update") {
      const item = this.editingCotizationType()!;
      this.contractParamsService.updateCotizationType(item.id, { name: name!, description: description ?? undefined }).subscribe({
        next: () => { this.closeCotizationTypeModal(); this.loadCotizationType(this.cotizationTypePage()); },
      });
    }
  }

  openDeleteCotizationType(item: CotizationType) { this.editingCotizationType.set(item); this.showDeleteCotizationTypeModal.set(true); }
  closeDeleteCotizationTypeModal() { this.showDeleteCotizationTypeModal.set(false); this.editingCotizationType.set(null); }
  confirmDeleteCotizationType() {
    const item = this.editingCotizationType();
    if (!item) return;
    this.contractParamsService.deleteCotizationType(item.id).subscribe({
      next: () => { this.closeDeleteCotizationTypeModal(); this.loadCotizationType(this.cotizationTypePage()); },
    });
  }
}
