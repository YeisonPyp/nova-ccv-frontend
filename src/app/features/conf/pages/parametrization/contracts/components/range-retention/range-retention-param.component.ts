import { CommonModule } from "@angular/common";
import { Component, inject, signal } from "@angular/core";
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { AuthService } from "@/app/core/services/auth.service";
import {
  ContractParamsService,
  CreateRangeRetentionDto,
} from "@/app/core/services/contract/contract-params.service";
import { RangeRetention } from "@/app/core/models/contract/contract-params.model";
import {
  DynamicTableComponent,
  TableColumn,
} from "@/app/shared/components/dynamic-table/dynamic-table.component";

@Component({
  selector: "app-range-retention-param",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DynamicTableComponent],
  templateUrl: "./range-retention-param.component.html",
})
export class RangeRetentionParamComponent {
  private readonly auth = inject(AuthService);
  private readonly contractParamsService = inject(ContractParamsService);

  rangeRetentionItems = signal<RangeRetention[]>([]);
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

  get canReadRangeRetention() {
    return this.auth.hasPermission("RANGE_RETENTION_READ");
  }
  get canCreateRangeRetention() {
    return this.auth.hasPermission("RANGE_RETENTION_CREATE");
  }
  get canUpdateRangeRetention() {
    return this.auth.hasPermission("RANGE_RETENTION_UPDATE");
  }
  get canDeleteRangeRetention() {
    return this.auth.hasPermission("RANGE_RETENTION_DELETE");
  }

  onRangeRetentionToggle(e: Event) {
    if ((e.target as HTMLDetailsElement).open && !this.rangeRetentionLoaded())
      this.loadRangeRetention();
  }

  loadRangeRetention() {
    this.rangeRetentionLoaded.set(true);
    this.contractParamsService.findRangeRetentions().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.rangeRetentionItems.set(res.data);
        }
      },
      error: () => this.rangeRetentionLoaded.set(false),
    });
  }

  openCreateRangeRetention() {
    this.rangeRetentionForm.reset({
      year: null,
      minUvt: null,
      maxUvt: null,
      tax: null,
      subtraction: null,
      addition: null,
    });
    this.editingRangeRetention.set(null);
    this.rangeRetentionModalMode.set("create");
  }
  openEditRangeRetention(item: RangeRetention) {
    this.rangeRetentionForm.reset({
      year: item.year,
      minUvt: item.minUvt ?? null,
      maxUvt: item.maxUvt ?? null,
      tax: item.tax ?? null,
      subtraction: item.subtraction ?? null,
      addition: item.addition ?? null,
    });
    this.editingRangeRetention.set(item);
    this.rangeRetentionModalMode.set("update");
  }
  closeRangeRetentionModal() {
    this.rangeRetentionModalMode.set(null);
  }

  submitRangeRetention() {
    if (this.rangeRetentionForm.invalid) return;
    const dto = this.rangeRetentionForm.value;
    const mode = this.rangeRetentionModalMode();
    if (mode === "create") {
      this.contractParamsService
        .createRangeRetention(dto as CreateRangeRetentionDto)
        .subscribe({
          next: () => {
            this.closeRangeRetentionModal();
            this.loadRangeRetention();
          },
        });
    } else if (mode === "update") {
      const item = this.editingRangeRetention()!;
      this.contractParamsService
        .updateRangeRetention(item.id, dto as CreateRangeRetentionDto)
        .subscribe({
          next: () => {
            this.closeRangeRetentionModal();
            this.loadRangeRetention();
          },
        });
    }
  }

  openDeleteRangeRetention(item: RangeRetention) {
    this.editingRangeRetention.set(item);
    this.showDeleteRangeRetentionModal.set(true);
  }
  closeDeleteRangeRetentionModal() {
    this.showDeleteRangeRetentionModal.set(false);
    this.editingRangeRetention.set(null);
  }
  confirmDeleteRangeRetention() {
    const item = this.editingRangeRetention();
    if (!item) return;
    this.contractParamsService.deleteRangeRetention(item.id).subscribe({
      next: () => {
        this.closeDeleteRangeRetentionModal();
        this.loadRangeRetention();
      },
    });
  }
}
