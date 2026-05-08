import { Component, inject, signal } from "@angular/core";
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { Agency } from "../../../../../../../core/models/contract/agency.model";
import { AuthService } from "../../../../../../../core/services/auth.service";
import { AgencyService } from "../../../../../../../core/services/contract/agency.service";
import {
  DynamicTableComponent,
  TableColumn,
} from "../../../../../../../shared/components/dynamic-table/dynamic-table.component";
import { PaginationComponent } from "../../../../../../../shared/components/pagination/pagination.component";

@Component({
  selector: "app-agency-param",
  standalone: true,
  imports: [ReactiveFormsModule, DynamicTableComponent, PaginationComponent],
  templateUrl: "./agency-param.component.html",
  styles: [
    `
      @keyframes slideUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .modal-overlay { position: fixed; inset: 0; z-index: 50; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.4); backdrop-filter: blur(4px); }
      .modal-box { background: #fff; border-radius: 12px; padding: 24px; width: 100%; max-width: 480px; box-shadow: 0 20px 60px rgba(0,0,0,0.15); animation: slideUp 0.2s ease-out; }
      .modal-title { font-size: 1.1rem; font-weight: 600; margin-bottom: 16px; }
      .modal-footer { display: flex; justify-content: flex-end; gap: 8px; margin-top: 20px; }
    `,
  ],
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

  agencyColumns: TableColumn<Agency>[] = [
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
