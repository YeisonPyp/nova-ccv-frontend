import { Component, inject, signal } from "@angular/core";
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { Agency } from "@/app/core/models/contract/agency.model";
import { AuthService } from "@/app/core/services/auth.service";
import { AgencyService } from "@/app/core/services/contract/agency.service";
import {
  DynamicTableComponent,
  TableColumn,
} from "@/app/shared/components/dynamic-table/dynamic-table.component";
import { PaginationComponent } from "@/app/shared/components/pagination/pagination.component";

@Component({
  selector: "app-agency-param",
  standalone: true,
  imports: [ReactiveFormsModule, DynamicTableComponent, PaginationComponent],
  templateUrl: "./agency-param.component.html",
})
export class AgencyParamComponent {
  private readonly auth = inject(AuthService);
  private readonly agencyService = inject(AgencyService);

  agencyItems = signal<Agency[]>([]);
  agencyPage = signal(1);
  agencySize = signal(10);
  agencyTotalPages = signal(0);
  agencyLoaded = signal(false);
  agencyModalMode = signal<"create" | "update" | null>(null);
  showDeleteAgencyModal = signal(false);
  editingAgency = signal<Agency | null>(null);

  agencyForm = new FormGroup({
    name: new FormControl("", [Validators.required, Validators.maxLength(20)]),
    description: new FormControl("", [
      Validators.required,
      Validators.maxLength(100),
    ]),
    nit: new FormControl("", [Validators.required, Validators.maxLength(20)]),
    legalRepresentative: new FormControl(""),
    companyType: new FormControl(""),
    vatResponsible: new FormControl(false),
  });

  agencyColumns: TableColumn[] = [
    { key: "name", label: "Nombre" },
    { key: "nit", label: "NIT" },
    { key: "description", label: "Descripción" },
  ];

  get canReadAgency() {
    return this.auth.hasPermission("AGENCY_READ");
  }
  get canCreateAgency() {
    return this.auth.hasPermission("AGENCY_CREATE");
  }
  get canUpdateAgency() {
    return this.auth.hasPermission("AGENCY_UPDATE");
  }
  get canDeleteAgency() {
    return this.auth.hasPermission("AGENCY_DELETE");
  }

  onAgencyToggle(e: Event) {
    if ((e.target as HTMLDetailsElement).open && !this.agencyLoaded())
      this.loadAgency(1);
  }

  loadAgency(page: number) {
    this.agencyPage.set(page);
    this.agencyLoaded.set(true);
    this.agencyService
      .findAll({ page: page - 1, size: this.agencySize() })
      .subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.agencyItems.set(res.data.content);
            this.agencyTotalPages.set(res.data.totalPages);
          }
        },
        error: () => this.agencyLoaded.set(false),
      });
  }

  openCreateAgency() {
    this.agencyForm.reset({
      name: "",
      description: "",
      nit: "",
      legalRepresentative: "",
      companyType: "",
      vatResponsible: false,
    });
    this.editingAgency.set(null);
    this.agencyModalMode.set("create");
  }

  openEditAgency(item: Agency) {
    this.agencyForm.reset({
      name: item.name,
      description: item.name,
      nit: item.nit,
      legalRepresentative: item.legalRepresentative ?? "",
      companyType: item.companyType ?? "",
      vatResponsible: item.vatResponsible ?? false,
    });
    this.editingAgency.set(item);
    this.agencyModalMode.set("update");
  }

  closeAgencyModal() {
    this.agencyModalMode.set(null);
  }

  submitAgency() {
    if (this.agencyForm.invalid) return;
    const dto = this.agencyForm.value as Partial<Agency>;
    const mode = this.agencyModalMode();
    if (mode === "create") {
      this.agencyService.create(dto).subscribe({
        next: () => {
          this.closeAgencyModal();
          this.loadAgency(this.agencyPage());
        },
      });
    } else if (mode === "update") {
      const item = this.editingAgency()!;
      this.agencyService.update(item.id, dto).subscribe({
        next: () => {
          this.closeAgencyModal();
          this.loadAgency(this.agencyPage());
        },
      });
    }
  }

  openDeleteAgency(item: Agency) {
    this.editingAgency.set(item);
    this.showDeleteAgencyModal.set(true);
  }

  closeDeleteAgencyModal() {
    this.showDeleteAgencyModal.set(false);
    this.editingAgency.set(null);
  }

  confirmDeleteAgency() {
    const item = this.editingAgency();
    if (!item) return;
    this.agencyService.delete(item.id).subscribe({
      next: () => {
        this.closeDeleteAgencyModal();
        this.loadAgency(this.agencyPage());
      },
    });
  }
}
