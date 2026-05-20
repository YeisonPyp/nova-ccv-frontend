import { Component, OnInit, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { Router } from "@angular/router";
import { ContractService } from "@/app/core/services/contract/contract.service";
import { ContractFilingFileNameService } from "@/app/core/services/contract/contract-filing-file-name.service";
import { AreaService } from "@/app/core/services/assessment/area.service";
import { EmployeeService } from "@/app/core/services/assessment/employee.service";
import { PositionService } from "@/app/core/services/assessment/position.service";
import { CostCenterService } from "@/app/core/services/cost-center/cost-center.service";
import { CompensationEntityService } from "@/app/core/services/contract/compensation-entity.service";
import {
  ContractTypeService,
  ContractType,
} from "@/app/core/services/contract/contract-type.service";
import { CotizationTypeService } from "@/app/core/services/contract/cotization-type.service";
import {
  EmployeeClassService,
  EmployeeClass,
} from "@/app/core/services/contract/employee-class.service";
import {
  EpsAfiliationService,
  EpsAfiliation,
} from "@/app/core/services/contract/eps-afiliation.service";
import { EpsEntityService } from "@/app/core/services/contract/eps-entity.service";
import { PensionTypeService } from "@/app/core/services/contract/pension-type.service";
import { SearchSelectContextFactory } from "@/app/shared/components/search-select/on-search-select.interface";
import { SearchSelectComponent } from "@/app/shared/components/search-select/search-select.component";
import { Area } from "@/app/core/models/assessment/area.model";
import { Employee } from "@/app/core/models/assessment/employee.model";
import { Position } from "@/app/core/models/assessment/position.model";
import { CostCenter } from "@/app/core/models/cost-center/cost-center.models";
import { ContractFilingFileName } from "@/app/core/models/contract/contract.models";
import {
  CompensationEntity,
  ContractStatus,
  CotizationType,
  EpsEntity,
  PensionType,
  SalaryParameter,
} from "@/app/core/models/contract/contract-params.model";
import { ContractParamsService } from "@/app/core/services/contract/contract-params.service";

@Component({
  selector: "app-create-employee-contract",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SearchSelectComponent],
  templateUrl: "./create-employee-contract.component.html",
  styleUrl: "./create-employee-contract.component.scss",
})
export class CreateEmployeeContractComponent implements OnInit {
  private readonly contractService = inject(ContractService);
  private readonly filingFileNameService = inject(
    ContractFilingFileNameService,
  );
  private readonly areaService = inject(AreaService);
  private readonly employeeService = inject(EmployeeService);
  private readonly positionService = inject(PositionService);
  private readonly costCenterService = inject(CostCenterService);
  private readonly compensationEntityService = inject(
    CompensationEntityService,
  );
  private readonly contractTypeService = inject(ContractTypeService);
  private readonly cotizationTypeService = inject(CotizationTypeService);
  private readonly employeeClassService = inject(EmployeeClassService);
  private readonly epsAfiliationTypeService = inject(EpsAfiliationService);
  private readonly epsEntityService = inject(EpsEntityService);
  private readonly pensionTypeService = inject(PensionTypeService);
  private readonly contractParamService = inject(ContractParamsService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  compensationEntities = signal<CompensationEntity[]>([]);
  contractTypes = signal<ContractType[]>([]);
  cotizationTypes = signal<CotizationType[]>([]);
  employeeClasses = signal<EmployeeClass[]>([]);
  epsAfiliationTypes = signal<EpsAfiliation[]>([]);
  epsEntities = signal<EpsEntity[]>([]);
  pensionTypes = signal<PensionType[]>([]);
  statusOptions = signal<ContractStatus[]>([]);
  salaryYears = signal<SalaryParameter[]>([]);

  submitting = signal(false);
  error = signal<string | null>(null);
  filingFileNames = signal<ContractFilingFileName[]>([]);
  selectedFiles = signal<Record<string, File>>({});

  form: FormGroup = this.fb.group({
    contractId: ["", Validators.required],
    contractTypeName: ["", Validators.required],
    status: ["", Validators.required],
    cotizationTypeName: ["", Validators.required],
    areaId: [null, Validators.required],
    costCenterId: [null, Validators.required],
    employeeId: [null, Validators.required],
    positionId: [null, Validators.required],
    salaryYear: [null, Validators.required],
    starts: ["", Validators.required],
    ends: [""],
    basePeriodAmount: [null, [Validators.required, Validators.min(0)]],
    periodDays: [null, [Validators.required, Validators.min(1)]],
    filingOrigin: ["", Validators.required],
    filingDestination: ["", Validators.required],
    periodTradeUnionAmount: [null],
    periodSolidarityAmount: [null],
    periodParafiscalContributionsAmount: [null],
    periodPensionAmount: [null],
    periodTransportAmount: [null],
    periodSeniorityAmount: [null],
    epsAffiliationType: [""],
    epsEntityName: [""],
    pensionEntity: [""],
    pensionType: [""],
    employeeClass: [""],
    compensationEntity: [""],
    retentionProcess: [null],
    zone: [""],
  });
  areaCtx: SearchSelectContextFactory<Area>;
  costCenterCtx: SearchSelectContextFactory<CostCenter>;
  employeeCtx: SearchSelectContextFactory<Employee>;
  positionCtx: SearchSelectContextFactory<Position>;

  constructor() {
    this.areaCtx = this.areaService.newSearchSelectAreaContext((area) =>
      this.form.patchValue({ areaId: area.id }),
    );
    this.employeeCtx = this.employeeService.newSearchSelectEmployeeContext(
      (emp) => this.form.patchValue({ employeeId: emp.id }),
    );
    this.costCenterCtx = this.costCenterService.newSearchSelectContext((cc) =>
      this.form.patchValue({ costCenterId: cc.id }),
    );
    this.positionCtx = this.positionService.newSearchSelectContext((pos) =>
      this.form.patchValue({ positionId: pos.id }),
    );
  }

  ngOnInit(): void {
    this.contractParamService
      .findContractStatuses()
      .subscribe((res) => this.statusOptions.set(res.data ?? []));
    this.contractParamService
      .findSalaryParameters()
      .subscribe((res) => this.salaryYears.set(res.data ?? []));
    this.contractTypeService
      .findAll()
      .subscribe((res) => this.contractTypes.set(res.data ?? []));
    this.cotizationTypeService
      .getCotizationTypes()
      .subscribe((res) => this.cotizationTypes.set(res.data ?? []));
    this.compensationEntityService
      .getCompensationEntities()
      .subscribe((res) => this.compensationEntities.set(res.data ?? []));
    this.employeeClassService
      .getEmployeeClasses()
      .subscribe((res) => this.employeeClasses.set(res.data ?? []));
    this.epsAfiliationTypeService
      .getEpsAfiliations()
      .subscribe((res) => this.epsAfiliationTypes.set(res.data ?? []));
    this.epsEntityService
      .getEpsEntities()
      .subscribe((res) => this.epsEntities.set(res.data ?? []));
    this.pensionTypeService
      .getPensionTypes()
      .subscribe((res) => this.pensionTypes.set(res.data ?? []));
    this.filingFileNameService
      .findAll()
      .subscribe((res) => this.filingFileNames.set(res.data ?? []));
  }

  isFieldInvalid(field: string): boolean {
    const c = this.form.get(field);
    return !!(c?.touched && c?.invalid);
  }

  onFieldRemove(
    field: string,
    ctx: SearchSelectContextFactory<any>,
    item: any,
  ) {
    ctx.remove(item);
    this.form.patchValue({ [field]: null });
    this.form.get(field)?.markAsTouched();
  }

  onFileChange(name: string, event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.selectedFiles.update((prev) => ({ ...prev, [name]: file }));
    } else {
      this.selectedFiles.update((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  }

  hasRequiredFileMissing(): boolean {
    return this.filingFileNames().some(
      (fn) => fn.isRequired && !this.selectedFiles()[fn.name],
    );
  }

  goBack(): void {
    this.router.navigate(["/contracts/dashboard"]);
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (this.hasRequiredFileMissing()) {
      this.error.set("Faltan archivos de radicación requeridos");
      return;
    }

    this.submitting.set(true);
    this.error.set(null);

    const v = this.form.value;

    this.contractService
      .createForEmployee(
        {
          contractId: v.contractId,
          contractTypeName: v.contractTypeName,
          status: v.status,
          cotizationTypeName: v.cotizationTypeName,
          areaId: v.areaId,
          costCenterId: v.costCenterId,
          employeeId: v.employeeId,
          positionId: v.positionId,
          salaryYear: v.salaryYear,
          starts: v.starts,
          ends: v.ends || null,
          basePeriodAmount: v.basePeriodAmount,
          periodDays: v.periodDays,
          filingOrigin: v.filingOrigin,
          filingDestination: v.filingDestination,
          periodTradeUnionAmount: v.periodTradeUnionAmount || null,
          periodSolidarityAmount: v.periodSolidarityAmount || null,
          periodParafiscalContributionsAmount:
            v.periodParafiscalContributionsAmount || null,
          periodPensionAmount: v.periodPensionAmount || null,
          periodTransportAmount: v.periodTransportAmount || null,
          periodSeniorityAmount: v.periodSeniorityAmount || null,
          epsAffiliationType: v.epsAffiliationType || null,
          epsEntityName: v.epsEntityName || null,
          pensionEntity: v.pensionEntity || null,
          pensionType: v.pensionType || null,
          employeeClass: v.employeeClass || null,
          compensationEntity: v.compensationEntity || null,
          retentionProcess: v.retentionProcess || null,
          zone: v.zone || null,
        },
        this.selectedFiles(),
      )
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.router.navigate(["/contracts/dashboard"]);
        },
        error: (err) => {
          this.submitting.set(false);
          this.error.set(err.error?.message ?? "Error al crear el contrato");
        },
      });
  }
}
