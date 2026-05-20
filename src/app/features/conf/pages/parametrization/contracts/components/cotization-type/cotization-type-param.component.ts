import { CommonModule } from "@angular/common";
import { Component, inject, signal } from "@angular/core";
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { AuthService } from "@/app/core/services/auth.service";
import { ContractParamsService } from "@/app/core/services/contract/contract-params.service";
import { CotizationType } from "@/app/core/models/contract/contract-params.model";
import {
  DynamicTableComponent,
  TableColumn,
} from "@/app/shared/components/dynamic-table/dynamic-table.component";

@Component({
  selector: "app-cotization-type-param",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DynamicTableComponent],
  templateUrl: "./cotization-type-param.component.html",
})
export class CotizationTypeParamComponent {
  private readonly auth = inject(AuthService);
  private readonly contractParamsService = inject(ContractParamsService);

  cotizationTypeItems = signal<CotizationType[]>([]);

  cotizationTypeLoaded = signal(false);
  cotizationTypeModalMode = signal<"create" | "update" | null>(null);
  showDeleteCotizationTypeModal = signal(false);
  editingCotizationType = signal<CotizationType | null>(null);

  cotizationTypeForm = new FormGroup({
    name: new FormControl("", [Validators.required]),
    description: new FormControl(""),
  });

  cotizationTypeColumns: TableColumn[] = [
    { key: "name", label: "Nombre" },
    { key: "description", label: "Descripción" },
  ];

  get canReadCotizationType() {
    return this.auth.hasPermission("COTIZATION_TYPE_READ");
  }
  get canCreateCotizationType() {
    return this.auth.hasPermission("COTIZATION_TYPE_CREATE");
  }
  get canUpdateCotizationType() {
    return this.auth.hasPermission("COTIZATION_TYPE_UPDATE");
  }
  get canDeleteCotizationType() {
    return this.auth.hasPermission("COTIZATION_TYPE_DELETE");
  }

  onCotizationTypeToggle(e: Event) {
    if ((e.target as HTMLDetailsElement).open && !this.cotizationTypeLoaded())
      this.loadCotizationType();
  }

  loadCotizationType() {
    this.contractParamsService.findCotizationTypes().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.cotizationTypeItems.set(res.data);
          this.cotizationTypeLoaded.set(true);
        }
      },
      error: () => this.cotizationTypeLoaded.set(false),
    });
  }

  openCreateCotizationType() {
    this.cotizationTypeForm.reset({ name: "", description: "" });
    this.editingCotizationType.set(null);
    this.cotizationTypeModalMode.set("create");
  }
  openEditCotizationType(item: CotizationType) {
    this.cotizationTypeForm.reset({
      name: item.name,
      description: item.description ?? "",
    });
    this.editingCotizationType.set(item);
    this.cotizationTypeModalMode.set("update");
  }
  closeCotizationTypeModal() {
    this.cotizationTypeModalMode.set(null);
  }

  submitCotizationType() {
    if (this.cotizationTypeForm.invalid) return;
    const { name, description } = this.cotizationTypeForm.value;
    const dto = {
      name: name!,
      description: description || undefined,
    };
    const mode = this.cotizationTypeModalMode();
    if (mode === "create") {
      this.contractParamsService.createCotizationType(dto).subscribe({
        next: () => {
          this.closeCotizationTypeModal();
          this.loadCotizationType();
        },
      });
    } else if (mode === "update") {
      const item = this.editingCotizationType()!;
      this.contractParamsService.updateCotizationType(item.id, dto).subscribe({
        next: () => {
          this.closeCotizationTypeModal();
          this.loadCotizationType();
        },
      });
    }
  }

  openDeleteCotizationType(item: CotizationType) {
    this.editingCotizationType.set(item);
    this.showDeleteCotizationTypeModal.set(true);
  }
  closeDeleteCotizationTypeModal() {
    this.showDeleteCotizationTypeModal.set(false);
    this.editingCotizationType.set(null);
  }
  confirmDeleteCotizationType() {
    const item = this.editingCotizationType();
    if (!item) return;
    this.contractParamsService.deleteCotizationType(item.id).subscribe({
      next: () => {
        this.closeDeleteCotizationTypeModal();
        this.loadCotizationType();
      },
    });
  }
}
