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
import { EpsAffiliationType } from "@/app/core/models/contract/contract-params.model";
import {
  DynamicTableComponent,
  TableColumn,
} from "@/app/shared/components/dynamic-table/dynamic-table.component";

@Component({
  selector: "app-eps-affiliation-type-param",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DynamicTableComponent],
  templateUrl: "./eps-affiliation-type-param.component.html",
})
export class EpsAffiliationTypeParamComponent {
  private readonly auth = inject(AuthService);
  private readonly contractParamsService = inject(ContractParamsService);

  epsAffiliationTypeItems = signal<EpsAffiliationType[]>([]);
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

  get canReadEpsAffiliationType() {
    return this.auth.hasPermission("EPS_AFFILIATION_TYPE_READ");
  }
  get canCreateEpsAffiliationType() {
    return this.auth.hasPermission("EPS_AFFILIATION_TYPE_CREATE");
  }
  get canUpdateEpsAffiliationType() {
    return this.auth.hasPermission("EPS_AFFILIATION_TYPE_UPDATE");
  }
  get canDeleteEpsAffiliationType() {
    return this.auth.hasPermission("EPS_AFFILIATION_TYPE_DELETE");
  }

  onEpsAffiliationTypeToggle(e: Event) {
    if (
      (e.target as HTMLDetailsElement).open &&
      !this.epsAffiliationTypeLoaded()
    )
      this.loadEpsAffiliationType();
  }

  loadEpsAffiliationType() {
    this.epsAffiliationTypeLoaded.set(true);
    this.contractParamsService.findEpsAffiliationTypes().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          console.log(res);
          this.epsAffiliationTypeItems.set(res.data);
        }
      },
      error: () => this.epsAffiliationTypeLoaded.set(false),
    });
  }

  openCreateEpsAffiliationType() {
    this.epsAffiliationTypeForm.reset({ name: "", description: "" });
    this.editingEpsAffiliationType.set(null);
    this.epsAffiliationTypeModalMode.set("create");
  }

  openEditEpsAffiliationType(item: EpsAffiliationType) {
    this.epsAffiliationTypeForm.reset({
      name: item.name,
      description: item.description ?? "",
    });
    this.editingEpsAffiliationType.set(item);
    this.epsAffiliationTypeModalMode.set("update");
  }

  closeEpsAffiliationTypeModal() {
    this.epsAffiliationTypeModalMode.set(null);
  }

  submitEpsAffiliationType() {
    if (this.epsAffiliationTypeForm.invalid) return;
    const { name, description } = this.epsAffiliationTypeForm.value;
    const mode = this.epsAffiliationTypeModalMode();
    if (mode === "create") {
      this.contractParamsService
        .createEpsAffiliationType({
          name: name!,
          description: description ?? undefined,
        })
        .subscribe({
          next: () => {
            this.closeEpsAffiliationTypeModal();
            this.loadEpsAffiliationType();
          },
        });
    } else if (mode === "update") {
      const item = this.editingEpsAffiliationType()!;
      this.contractParamsService
        .updateEpsAffiliationType(item.id, {
          name: name!,
          description: description ?? undefined,
        })
        .subscribe({
          next: () => {
            this.closeEpsAffiliationTypeModal();
            this.loadEpsAffiliationType();
          },
        });
    }
  }

  openDeleteEpsAffiliationType(item: EpsAffiliationType) {
    this.editingEpsAffiliationType.set(item);
    this.showDeleteEpsAffiliationTypeModal.set(true);
  }
  closeDeleteEpsAffiliationTypeModal() {
    this.showDeleteEpsAffiliationTypeModal.set(false);
    this.editingEpsAffiliationType.set(null);
  }
  confirmDeleteEpsAffiliationType() {
    const item = this.editingEpsAffiliationType();
    if (!item) return;
    this.contractParamsService.deleteEpsAffiliationType(item.id).subscribe({
      next: () => {
        this.closeDeleteEpsAffiliationTypeModal();
        this.loadEpsAffiliationType();
      },
    });
  }
}
