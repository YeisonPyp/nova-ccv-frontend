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
import { CostCenterService } from "@/app/core/services/cost-center/cost-center.service";
import { AgencyService } from "@/app/core/services/contract/agency.service";
import { PositionService } from "@/app/core/services/assessment/position.service";
import {
  PatPresupuestalCategoryService,
  PresupuestalCategory,
} from "@/app/core/services/pat/pat-presupuestal-category.service";
import {
  ContractTypeService,
  ContractType,
} from "@/app/core/services/contract/contract-type.service";
import { SearchSelectContextFactory } from "@/app/shared/components/search-select/on-search-select.interface";
import { SearchSelectComponent } from "@/app/shared/components/search-select/search-select.component";
import { Area } from "@/app/core/models/assessment/area.model";
import { CostCenter } from "@/app/core/models/cost-center/cost-center.models";
import { Agency } from "@/app/core/models/contract/agency.model";
import { ContractFilingFileName } from "@/app/core/models/contract/contract.models";
import { ContractStatus } from "@/app/core/models/contract/contract-params.model";
import { Position } from "@/app/core/models/assessment/position.model";
import { ContractParamsService } from "@/app/core/services/contract/contract-params.service";

@Component({
  selector: "app-create-agency-contract",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SearchSelectComponent],
  templateUrl: "./create-agency-contract.component.html",
  styleUrl: "./create-agency-contract.component.scss",
})
export class CreateAgencyContractComponent implements OnInit {
  private readonly contractService = inject(ContractService);
  private readonly filingFileNameService = inject(
    ContractFilingFileNameService,
  );
  private readonly areaService = inject(AreaService);
  private readonly costCenterService = inject(CostCenterService);
  private readonly agencyService = inject(AgencyService);
  private readonly positionService = inject(PositionService);
  private readonly presupuestalCategoryService = inject(
    PatPresupuestalCategoryService,
  );
  private readonly contractTypeService = inject(ContractTypeService);
  private readonly contractParamService = inject(ContractParamsService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  contractTypes = signal<ContractType[]>([]);
  statusOptions = signal<ContractStatus[]>([]);

  submitting = signal(false);
  error = signal<string | null>(null);
  filingFileNames = signal<ContractFilingFileName[]>([]);
  selectedFiles = signal<Record<string, File>>({});

  form: FormGroup;
  areaCtx: SearchSelectContextFactory<Area>;
  costCenterCtx: SearchSelectContextFactory<CostCenter>;
  agencyCtx: SearchSelectContextFactory<Agency>;
  positionCtx: SearchSelectContextFactory<Position>;
  presupuestalCategoryCtx: SearchSelectContextFactory<PresupuestalCategory>;

  constructor() {
    this.form = this.fb.group({
      contractId: ["", Validators.required],
      contractTypeName: ["", Validators.required],
      statusName: ["", Validators.required],
      areaId: [null, Validators.required],
      costCenterId: [null, Validators.required],
      agencyId: [null, Validators.required],
      positionId: [null, Validators.required],
      presupuestalCategoryId: [null, Validators.required],
      identification: ["", Validators.required],
      starts: ["", Validators.required],
      ends: [""],
      basePeriodAmount: [null, [Validators.required, Validators.min(0)]],
      periodDays: [null, [Validators.required, Validators.min(1)]],
      periods: [null, [Validators.required, Validators.min(1)]],
      zone: [""],
    });

    this.areaCtx = this.areaService.newSearchSelectAreaContext((area) =>
      this.form.patchValue({ areaId: area.id }),
    );
    this.costCenterCtx = this.costCenterService.newSearchSelectContext((cc) =>
      this.form.patchValue({ costCenterId: cc.id }),
    );
    this.agencyCtx = this.agencyService.newSearchSelectContext((agency) =>
      this.form.patchValue({ agencyId: agency.id }),
    );
    this.positionCtx = this.positionService.newSearchSelectContext((pos) =>
      this.form.patchValue({ positionId: pos.id }),
    );
    this.presupuestalCategoryCtx =
      this.presupuestalCategoryService.newSearchSelectContext((category) =>
        this.form.patchValue({ presupuestalCategoryId: category.id }),
      );
  }

  ngOnInit(): void {
    this.contractParamService
      .findContractStatuses()
      .subscribe((res) => this.statusOptions.set(res.data ?? []));
    this.contractTypeService
      .findAll()
      .subscribe((res) => this.contractTypes.set(res.data ?? []));
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
      .createForAgency(
        {
          contractId: v.contractId,
          contractTypeName: v.contractTypeName,
          statusName: v.statusName,
          areaId: v.areaId,
          costCenterId: v.costCenterId,
          agencyId: v.agencyId,
          positionId: v.positionId,
          presupuestalCategoryId: v.presupuestalCategoryId,
          identification: v.identification,
          starts: v.starts,
          ends: v.ends || null,
          basePeriodAmount: v.basePeriodAmount,
          periodDays: v.periodDays,
          periods: v.periods,
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
