import { Component, OnInit, effect, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { ContractService } from "../../../../core/services/contract/contract.service";
import { ContractFilingFileNameService } from "../../../../core/services/contract/contract-filing-file-name.service";
import { AreaService } from "../../../../core/services/assessment/area.service";
import { EmployeeService } from "../../../../core/services/assessment/employee.service";
import { PositionService } from "../../../../core/services/assessment/position.service";
import { CostCenterService } from "../../../../core/services/cost-center/cost-center.service";
import { AgencyService } from "../../../../core/services/contract/agency.service";
import { CompensationEntityService } from "../../../../core/services/contract/compensation-entity.service";
import {
  ContractTypeService,
  ContractType,
} from "../../../../core/services/contract/contract-type.service";
import { CotizationTypeService } from "../../../../core/services/contract/cotization-type.service";
import {
  EmployeeClassService,
  EmployeeClass,
} from "../../../../core/services/contract/employee-class.service";
import {
  EpsAfiliationService,
  EpsAfiliation,
} from "../../../../core/services/contract/eps-afiliation.service";
import { EpsEntityService } from "../../../../core/services/contract/eps-entity.service";
import { PensionTypeService } from "../../../../core/services/contract/pension-type.service";
import { SearchSelectContextFactory } from "../../../../shared/components/search-select/on-search-select.interface";
import { SearchSelectComponent } from "../../../../shared/components/search-select/search-select.component";
import { Area } from "../../../../core/models/assessment/area.model";
import { Employee } from "../../../../core/models/assessment/employee.model";
import { Position } from "../../../../core/models/assessment/position.model";
import { CostCenter } from "../../../../core/models/cost-center/cost-center.models";
import { Agency } from "../../../../core/models/contract/agency.model";
import { ContractFilingFileName } from "../../../../core/models/contract/contract.models";
import {
  CompensationEntity,
  CotizationType,
  EpsEntity,
  PensionType,
} from "../../../../core/models/contract/contract-params.model";

const currentYear = new Date().getFullYear();
const SALARY_YEARS = Array.from({ length: 6 }, (_, i) => currentYear - i);

const STATUS_OPTIONS = ["ACTIVO", "SUSPENDIDO", "CANCELADO"];

@Component({
  selector: "app-create-contract-modal",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SearchSelectComponent],
  templateUrl: "./create-contract-modal.component.html",
  styleUrl: "./create-contract-modal.component.scss",
})
export class CreateContractModalComponent implements OnInit {
  private readonly contractService = inject(ContractService);
  private readonly filingFileNameService = inject(
    ContractFilingFileNameService,
  );
  private readonly areaService = inject(AreaService);
  private readonly employeeService = inject(EmployeeService);
  private readonly positionService = inject(PositionService);
  private readonly costCenterService = inject(CostCenterService);
  private readonly agencyService = inject(AgencyService);
  private readonly compensationEntityService = inject(
    CompensationEntityService,
  );
  private readonly contractTypeService = inject(ContractTypeService);
  private readonly cotizationTypeService = inject(CotizationTypeService);
  private readonly employeeClassService = inject(EmployeeClassService);
  private readonly epsAfiliationTypeService = inject(EpsAfiliationService);
  private readonly epsEntityService = inject(EpsEntityService);
  private readonly pensionTypeService = inject(PensionTypeService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  contractType = signal<"employee" | "agency">("employee");

  // HTTP-loaded option signals
  compensationEntities = signal<CompensationEntity[]>([]);
  contractTypes = signal<ContractType[]>([]);
  cotizationTypes = signal<CotizationType[]>([]);
  employeeClasses = signal<EmployeeClass[]>([]);
  epsAfiliationTypes = signal<EpsAfiliation[]>([]);
  epsEntities = signal<EpsEntity[]>([]);
  pensionTypes = signal<PensionType[]>([]);

  // Static options
  readonly statusOptions = STATUS_OPTIONS;
  readonly salaryYears = SALARY_YEARS;

  submitting = signal(false);
  error = signal<string | null>(null);
  filingFileNames = signal<ContractFilingFileName[]>([]);
  selectedFiles = signal<Record<string, File>>({});

  form: FormGroup;
  areaCtx: SearchSelectContextFactory<Area>;
  costCenterCtx: SearchSelectContextFactory<CostCenter>;
  employeeCtx: SearchSelectContextFactory<Employee>;
  positionCtx: SearchSelectContextFactory<Position>;
  agencyCtx: SearchSelectContextFactory<Agency>;

  constructor() {
    this.form = this.fb.group({
      contractId: ["", Validators.required],
      contractTypeName: ["", Validators.required],
      statusName: ["", Validators.required],
      cotizationTypeName: ["", Validators.required],
      areaId: [null, Validators.required],
      costCenterId: [null, Validators.required],
      employeeId: [null],
      positionId: [null],
      salaryYear: [null],
      agencyId: [null],
      identification: [""],
      periods: [null],
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
    this.agencyCtx = this.agencyService.newSearchSelectContext((agency) =>
      this.form.patchValue({ agencyId: agency.id }),
    );

    effect(() => this.updateValidators(this.contractType()));
  }

  ngOnInit(): void {
    const type = this.route.snapshot.paramMap.get("type");
    if (type === "agency") this.contractType.set("agency");

    this.loadOptions();
    this.filingFileNameService
      .findAll()
      .subscribe((res) => this.filingFileNames.set(res.data ?? []));
  }

  private loadOptions(): void {
    this.contractTypeService
      .getContractTypes()
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
  }

  private updateValidators(type: "employee" | "agency") {
    const empFields = ["employeeId", "positionId", "salaryYear"];
    const agencyFields = ["agencyId", "identification", "periods"];

    if (type === "employee") {
      empFields.forEach((f) =>
        this.form.get(f)?.setValidators(Validators.required),
      );
      agencyFields.forEach((f) => this.form.get(f)?.clearValidators());
    } else {
      agencyFields.forEach((f) => {
        if (f === "periods") {
          this.form
            .get(f)
            ?.setValidators([Validators.required, Validators.min(1)]);
        } else {
          this.form.get(f)?.setValidators(Validators.required);
        }
      });
      empFields.forEach((f) => this.form.get(f)?.clearValidators());
    }

    [...empFields, ...agencyFields].forEach((f) =>
      this.form.get(f)?.updateValueAndValidity(),
    );
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
    const type = this.contractType();
    const files = this.selectedFiles();

    const obs =
      type === "employee"
        ? this.contractService.createForEmployee(
            {
              contractId: v.contractId,
              contractTypeName: v.contractTypeName,
              statusName: v.statusName,
              cotizationTypeName: v.cotizationTypeName,
              areaId: v.areaId,
              costCenterId: v.costCenterId,
              employeeId: v.employeeId,
              starts: v.starts,
              basePeriodAmount: v.basePeriodAmount,
              periodDays: v.periodDays,
              positionId: v.positionId,
              salaryYear: v.salaryYear,
              filingOrigin: v.filingOrigin,
              filingDestination: v.filingDestination,
              ends: v.ends || null,
              periodTradeUnionAmount: v.periodTradeUnionAmount || null,
              periodSolidarityAmount: v.periodSolidarityAmount || null,
              periodParafiscalContributionsAmount:
                v.periodParafiscalContributionsAmount || null,
              periodPensionAmount: v.periodPensionAmount || null,
              periodTransportAmount: v.periodTransportAmount || null,
              retentionProcess: v.retentionProcess || null,
              periodSeniorityAmount: v.periodSeniorityAmount || null,
              epsAffiliationType: v.epsAffiliationType || null,
              epsEntityName: v.epsEntityName || null,
              pensionEntity: v.pensionEntity || null,
              pensionType: v.pensionType || null,
              employeeClass: v.employeeClass || null,
              compensationEntity: v.compensationEntity || null,
              zone: v.zone || null,
            },
            files,
          )
        : this.contractService.createForAgency(
            {
              contractId: v.contractId,
              contractTypeName: v.contractTypeName,
              statusName: v.statusName,
              cotizationTypeName: v.cotizationTypeName,
              identification: v.identification,
              areaId: v.areaId,
              costCenterId: v.costCenterId,
              agencyId: v.agencyId,
              starts: v.starts,
              ends: v.ends || null,
              basePeriodAmount: v.basePeriodAmount,
              periodDays: v.periodDays,
              periods: v.periods,
              filingOrigin: v.filingOrigin,
              filingDestination: v.filingDestination,
              retentionProcess: v.retentionProcess || null,
              zone: v.zone || null,
            },
            files,
          );

    obs.subscribe({
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
