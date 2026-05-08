import { CommonModule } from "@angular/common";
import { Component, inject, signal } from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { AuthService } from "../../../../../../../core/services/auth.service";
import { ContractParamsService, CreateRangeRetentionDto } from "../../../../../../../core/services/contract/contract-params.service";
import { RangeRetention } from "../../../../../../../core/models/contract/contract-params.model";
import { DynamicTableComponent, TableColumn } from "../../../../../../../shared/components/dynamic-table/dynamic-table.component";
import { PaginationComponent } from "../../../../../../../shared/components/pagination/pagination.component";

@Component({
  selector: "app-range-retention-param",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DynamicTableComponent, PaginationComponent],
  templateUrl: "./range-retention-param.component.html",
  styles: [`
    @keyframes slideUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
    .modal-overlay { position:fixed; inset:0; z-index:50; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.4); backdrop-filter:blur(4px); }
    .modal-box { background:#fff; border-radius:12px; padding:24px; width:100%; max-width:480px; box-shadow:0 20px 60px rgba(0,0,0,0.15); animation:slideUp 0.2s ease-out; }
    .modal-title { font-size:1.1rem; font-weight:600; margin-bottom:16px; }
    .modal-footer { display:flex; justify-content:flex-end; gap:8px; margin-top:20px; }
  `],
})
export class RangeRetentionParamComponent {
  private readonly auth = inject(AuthService);
  private readonly contractParamsService = inject(ContractParamsService);

  rangeRetentionItems = signal<RangeRetention[]>([]);
  rangeRetentionPage = signal(1);
  rangeRetentionSize = signal(10);
  rangeRetentionTotalPages = signal(0);
  rangeRetentionLoaded = signal(false);
  rangeRetentionModalMode = signal<"create" | "update" | null>(null);
  showDeleteRangeRetentionModal = signal(false);
  editingRangeRetention = signal<RangeRetention | null>(null);

  rangeRetentionForm = new FormGroup({
    year: new FormControl<number | null>(null, [Validators.required]),
    minUvt: new FormControl<number | null>(null),
    maxUvt: new FormControl<number | null>(null),
    tax: new FormControl<number | null>(null),
    subtraction: new FormControl<number | null>(null),
    addition: new FormControl<number | null>(null),
  });

  rangeRetentionColumns: TableColumn<RangeRetention>[] = [
    { key: "year", label: "Año" },
    { key: "minUvt", label: "UVT Mín." },
    { key: "maxUvt", label: "UVT Máx." },
    { key: "tax", label: "Tarifa" },
  ];

  get canReadRangeRetention() { return this.auth.hasPermission("RANGE_RETENTION_READ"); }
  get canCreateRangeRetention() { return this.auth.hasPermission("RANGE_RETENTION_CREATE"); }
  get canUpdateRangeRetention() { return this.auth.hasPermission("RANGE_RETENTION_UPDATE"); }
  get canDeleteRangeRetention() { return this.auth.hasPermission("RANGE_RETENTION_DELETE"); }

  onRangeRetentionToggle(e: Event) {
    if ((e.target as HTMLDetailsElement).open && !this.rangeRetentionLoaded()) this.loadRangeRetention(1);
  }

  loadRangeRetention(page: number) {
    this.rangeRetentionPage.set(page);
    this.rangeRetentionLoaded.set(true);
    this.contractParamsService.findRangeRetentions({ page: page - 1, size: this.rangeRetentionSize() }).subscribe({
      next: (res) => { if (res.success && res.data) { this.rangeRetentionItems.set(res.data.content); this.rangeRetentionTotalPages.set(res.data.totalPages); } },
      error: () => this.rangeRetentionLoaded.set(false),
    });
  }

  openCreateRangeRetention() { this.rangeRetentionForm.reset({ year: null, minUvt: null, maxUvt: null, tax: null, subtraction: null, addition: null }); this.editingRangeRetention.set(null); this.rangeRetentionModalMode.set("create"); }
  openEditRangeRetention(item: RangeRetention) {
    this.rangeRetentionForm.reset({ year: item.year, minUvt: item.minUvt ?? null, maxUvt: item.maxUvt ?? null, tax: item.tax ?? null, subtraction: item.subtraction ?? null, addition: item.addition ?? null });
    this.editingRangeRetention.set(item); this.rangeRetentionModalMode.set("update");
  }
  closeRangeRetentionModal() { this.rangeRetentionModalMode.set(null); }

  submitRangeRetention() {
    if (this.rangeRetentionForm.invalid) return;
    const dto = this.rangeRetentionForm.value;
    const mode = this.rangeRetentionModalMode();
    if (mode === "create") {
      this.contractParamsService.createRangeRetention(dto as CreateRangeRetentionDto).subscribe({
        next: () => { this.closeRangeRetentionModal(); this.loadRangeRetention(this.rangeRetentionPage()); },
      });
    } else if (mode === "update") {
      const item = this.editingRangeRetention()!;
      this.contractParamsService.updateRangeRetention(item.id, dto as CreateRangeRetentionDto).subscribe({
        next: () => { this.closeRangeRetentionModal(); this.loadRangeRetention(this.rangeRetentionPage()); },
      });
    }
  }

  openDeleteRangeRetention(item: RangeRetention) { this.editingRangeRetention.set(item); this.showDeleteRangeRetentionModal.set(true); }
  closeDeleteRangeRetentionModal() { this.showDeleteRangeRetentionModal.set(false); this.editingRangeRetention.set(null); }
  confirmDeleteRangeRetention() {
    const item = this.editingRangeRetention();
    if (!item) return;
    this.contractParamsService.deleteRangeRetention(item.id).subscribe({
      next: () => { this.closeDeleteRangeRetentionModal(); this.loadRangeRetention(this.rangeRetentionPage()); },
    });
  }
}
