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
import { PensionType } from "@/app/core/models/contract/contract-params.model";
import {
  DynamicTableComponent,
  TableColumn,
} from "@/app/shared/components/dynamic-table/dynamic-table.component";
import { ParametrizationSectionComponent } from "@/app/features/conf/components/parametrization-section.component";

@Component({
  selector: "app-pension-type-param",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DynamicTableComponent,
    ParametrizationSectionComponent,
  ],
  templateUrl: "./pension-type-param.component.html",
})
export class PensionTypeParamComponent {
  private readonly auth = inject(AuthService);
  private readonly contractParamsService = inject(ContractParamsService);

  pensionTypeItems = signal<PensionType[]>([]);
  pensionTypeLoaded = signal(false);
  pensionTypeModalMode = signal<"create" | "update" | null>(null);
  showDeletePensionTypeModal = signal(false);
  editingPensionType = signal<PensionType | null>(null);

  pensionTypeForm = new FormGroup({
    name: new FormControl("", [Validators.required]),
    description: new FormControl(""),
  });

  pensionTypeColumns: TableColumn[] = [
    { key: "name", label: "Nombre" },
    { key: "description", label: "Descripción" },
  ];

  get canReadPensionType() {
    return this.auth.hasPermission("PENSION_TYPE_READ");
  }
  get canCreatePensionType() {
    return this.auth.hasPermission("PENSION_TYPE_CREATE");
  }
  get canUpdatePensionType() {
    return this.auth.hasPermission("PENSION_TYPE_UPDATE");
  }
  get canDeletePensionType() {
    return this.auth.hasPermission("PENSION_TYPE_DELETE");
  }

  onPensionTypeToggle(open: boolean) {
    if (open && !this.pensionTypeLoaded()) this.loadPensionType();
  }

  loadPensionType() {
    this.pensionTypeLoaded.set(true);
    this.contractParamsService.findPensionTypes().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.pensionTypeItems.set(res.data);
        }
      },
      error: () => this.pensionTypeLoaded.set(false),
    });
  }

  openCreatePensionType() {
    this.pensionTypeForm.reset({ name: "", description: "" });
    this.editingPensionType.set(null);
    this.pensionTypeModalMode.set("create");
  }
  openEditPensionType(item: PensionType) {
    this.pensionTypeForm.reset({
      name: item.name,
      description: item.description ?? "",
    });
    this.editingPensionType.set(item);
    this.pensionTypeModalMode.set("update");
  }
  closePensionTypeModal() {
    this.pensionTypeModalMode.set(null);
  }

  submitPensionType() {
    if (this.pensionTypeForm.invalid) return;
    const { name, description } = this.pensionTypeForm.value;
    const mode = this.pensionTypeModalMode();
    if (mode === "create") {
      this.contractParamsService
        .createPensionType({
          name: name!,
          description: description ?? undefined,
        })
        .subscribe({
          next: () => {
            this.closePensionTypeModal();
            this.loadPensionType();
          },
        });
    } else if (mode === "update") {
      const item = this.editingPensionType()!;
      this.contractParamsService
        .updatePensionType(item.id, {
          name: name!,
          description: description ?? undefined,
        })
        .subscribe({
          next: () => {
            this.closePensionTypeModal();
            this.loadPensionType();
          },
        });
    }
  }

  openDeletePensionType(item: PensionType) {
    this.editingPensionType.set(item);
    this.showDeletePensionTypeModal.set(true);
  }
  closeDeletePensionTypeModal() {
    this.showDeletePensionTypeModal.set(false);
    this.editingPensionType.set(null);
  }
  confirmDeletePensionType() {
    const item = this.editingPensionType();
    if (!item) return;
    this.contractParamsService.deletePensionType(item.id).subscribe({
      next: () => {
        this.closeDeletePensionTypeModal();
        this.loadPensionType();
      },
    });
  }
}
