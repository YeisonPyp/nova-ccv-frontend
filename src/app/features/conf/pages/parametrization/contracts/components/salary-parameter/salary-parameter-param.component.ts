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
  CreateSalaryParameterDto,
} from "@/app/core/services/contract/contract-params.service";
import { SalaryParameter } from "@/app/core/models/contract/contract-params.model";
import {
  DynamicTableComponent,
  TableColumn,
} from "@/app/shared/components/dynamic-table/dynamic-table.component";

@Component({
  selector: "app-salary-parameter-param",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DynamicTableComponent],
  templateUrl: "./salary-parameter-param.component.html",
})
export class SalaryParameterParamComponent {
  private readonly auth = inject(AuthService);
  private readonly contractParamsService = inject(ContractParamsService);

  salaryParameterItems = signal<SalaryParameter[]>([]);
  salaryParameterPage = signal(1);
  salaryParameterSize = signal(10);
  salaryParameterTotalPages = signal(0);
  salaryParameterLoaded = signal(false);
  salaryParameterModalMode = signal<"create" | "update" | null>(null);
  showDeleteSalaryParameterModal = signal(false);
  editingSalaryParameter = signal<SalaryParameter | null>(null);

  salaryParameterForm = new FormGroup({
    year: new FormControl<number | null>(null, [Validators.required]),
    smmlv: new FormControl<number | null>(null, [Validators.required]),
    transportAllowance: new FormControl<number | null>(null, [
      Validators.required,
    ]),
    integralSalaryFactor: new FormControl<number | null>(null, [
      Validators.required,
    ]),
    employeeHealthPct: new FormControl<number | null>(null),
    employeePensionPct: new FormControl<number | null>(null),
    employerHealthPct: new FormControl<number | null>(null),
    employerPensionPct: new FormControl<number | null>(null),
    arlPct: new FormControl<number | null>(null),
    senaPct: new FormControl<number | null>(null),
    icbfPct: new FormControl<number | null>(null),
    compensationBoxPct: new FormControl<number | null>(null),
    uvt: new FormControl<number | null>(null),
    effectiveFrom: new FormControl("", [Validators.required]),
    effectiveTo: new FormControl(""),
  });

  salaryParameterColumns: TableColumn[] = [
    { key: "year", label: "Año" },
    { key: "smmlv", label: "SMMLV" },
    { key: "transportAllowance", label: "Auxilio transporte" },
    { key: "effectiveFrom", label: "Vigencia desde" },
  ];

  get canReadSalaryParameter() {
    return this.auth.hasPermission("SALARY_PARAMETER_READ");
  }
  get canCreateSalaryParameter() {
    return this.auth.hasPermission("SALARY_PARAMETER_CREATE");
  }
  get canUpdateSalaryParameter() {
    return this.auth.hasPermission("SALARY_PARAMETER_UPDATE");
  }
  get canDeleteSalaryParameter() {
    return this.auth.hasPermission("SALARY_PARAMETER_DELETE");
  }

  onSalaryParameterToggle(e: Event) {
    if ((e.target as HTMLDetailsElement).open && !this.salaryParameterLoaded())
      this.loadSalaryParameter();
  }

  loadSalaryParameter() {
    this.salaryParameterLoaded.set(true);
    this.contractParamsService.findSalaryParameters().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.salaryParameterItems.set(res.data);
        }
      },
      error: () => this.salaryParameterLoaded.set(false),
    });
  }

  openCreateSalaryParameter() {
    this.salaryParameterForm.reset({
      year: null,
      smmlv: null,
      transportAllowance: null,
      integralSalaryFactor: null,
      effectiveFrom: "",
      effectiveTo: "",
    });
    this.editingSalaryParameter.set(null);
    this.salaryParameterModalMode.set("create");
  }

  openEditSalaryParameter(item: SalaryParameter) {
    this.salaryParameterForm.reset({
      year: item.year,
      smmlv: item.smmlv,
      transportAllowance: item.transportAllowance,
      integralSalaryFactor: item.integralSalaryFactor,
      employeeHealthPct: item.employeeHealthPct ?? null,
      employeePensionPct: item.employeePensionPct ?? null,
      employerHealthPct: item.employerHealthPct ?? null,
      employerPensionPct: item.employerPensionPct ?? null,
      arlPct: item.arlPct ?? null,
      senaPct: item.senaPct ?? null,
      icbfPct: item.icbfPct ?? null,
      compensationBoxPct: item.compensationBoxPct ?? null,
      uvt: item.uvt ?? null,
      effectiveFrom: item.effectiveFrom,
      effectiveTo: item.effectiveTo ?? "",
    });
    this.editingSalaryParameter.set(item);
    this.salaryParameterModalMode.set("update");
  }

  closeSalaryParameterModal() {
    this.salaryParameterModalMode.set(null);
  }

  submitSalaryParameter() {
    if (this.salaryParameterForm.invalid) return;
    const dto = this.salaryParameterForm.value;
    const mode = this.salaryParameterModalMode();
    if (mode === "create") {
      this.contractParamsService
        .createSalaryParameter(dto as CreateSalaryParameterDto)
        .subscribe({
          next: () => {
            this.closeSalaryParameterModal();
            this.loadSalaryParameter();
          },
        });
    } else if (mode === "update") {
      const item = this.editingSalaryParameter()!;
      this.contractParamsService
        .updateSalaryParameter(item.id, dto as CreateSalaryParameterDto)
        .subscribe({
          next: () => {
            this.closeSalaryParameterModal();
            this.loadSalaryParameter();
          },
        });
    }
  }

  openDeleteSalaryParameter(item: SalaryParameter) {
    this.editingSalaryParameter.set(item);
    this.showDeleteSalaryParameterModal.set(true);
  }
  closeDeleteSalaryParameterModal() {
    this.showDeleteSalaryParameterModal.set(false);
    this.editingSalaryParameter.set(null);
  }
  confirmDeleteSalaryParameter() {
    const item = this.editingSalaryParameter();
    if (!item) return;
    this.contractParamsService.deleteSalaryParameter(item.id).subscribe({
      next: () => {
        this.closeDeleteSalaryParameterModal();
        this.loadSalaryParameter();
      },
    });
  }
}
