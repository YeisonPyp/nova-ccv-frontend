import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ContractService } from '@/app/core/services/contract/contract.service';
import { ContractManagementExecutionPlanService } from '@/app/core/services/contract/contract-management-execution-plan.service';
import { ContractFilingFileNameService } from '@/app/core/services/contract/contract-filing-file-name.service';
import { AreaService } from '@/app/core/services/assessment/area.service';
import { PositionService } from '@/app/core/services/assessment/position.service';
import { CostCenterService } from '@/app/core/services/cost-center/cost-center.service';
import {
  ContractTypeService,
  ContractType,
} from '@/app/core/services/contract/contract-type.service';
import { EpsEntityService } from '@/app/core/services/contract/eps-entity.service';
import { ArlEntityService } from '@/app/core/services/contract/arl-entity.service';
import {
  PatPresupuestalCategoryService,
  PresupuestalCategory,
} from '@/app/core/services/pat/pat-presupuestal-category.service';
import { SearchSelectContextFactory } from '@/app/shared/components/search-select/on-search-select.interface';
import { SearchSelectComponent } from '@/app/shared/components/search-select/search-select.component';
import { Area } from '@/app/core/models/assessment/area.model';
import { Position } from '@/app/core/models/assessment/position.model';
import { CostCenter } from '@/app/core/models/cost-center/cost-center.models';
import { ContractFilingFileName } from '@/app/core/models/contract/contract.models';
import {
  ArlEntity,
  ContractStatus,
  EpsEntity,
} from '@/app/core/models/contract/contract-params.model';
import { ContractParamsService } from '@/app/core/services/contract/contract-params.service';

@Component({
  selector: 'app-create-employee-contract',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SearchSelectComponent],
  templateUrl: './create-employee-contract.component.html',
  styleUrl: './create-employee-contract.component.scss',
})
export class CreateEmployeeContractComponent implements OnInit {
  private readonly contractService = inject(ContractService);
  private readonly filingFileNameService = inject(
    ContractFilingFileNameService,
  );
  private readonly areaService = inject(AreaService);
  private readonly positionService = inject(PositionService);
  private readonly costCenterService = inject(CostCenterService);
  private readonly contractTypeService = inject(ContractTypeService);
  private readonly epsEntityService = inject(EpsEntityService);
  private readonly arlEntityService = inject(ArlEntityService);
  private readonly presupuestalCategoryService = inject(
    PatPresupuestalCategoryService,
  );
  private readonly contractParamService = inject(ContractParamsService);
  private readonly executionPlanService = inject(
    ContractManagementExecutionPlanService,
  );
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  private fromExecutionId: string | null = null;

  contractTypes = signal<ContractType[]>([]);
  epsEntities = signal<EpsEntity[]>([]);
  arlEntities = signal<ArlEntity[]>([]);
  statusOptions = signal<ContractStatus[]>([]);

  submitting = signal(false);
  error = signal<string | null>(null);
  filingFileNames = signal<ContractFilingFileName[]>([]);
  selectedFiles = signal<Record<string, File>>({});

  form: FormGroup = this.fb.group({
    contractId: ['', Validators.required],
    contractTypeName: ['', Validators.required],
    status: ['', Validators.required],
    areaId: [null, Validators.required],
    costCenterId: [null, Validators.required],
    positionId: [null, Validators.required],
    presupuestalCategoryId: [null, Validators.required],
    starts: ['', Validators.required],
    ends: [''],
    basePeriodAmount: [null, [Validators.required, Validators.min(0)]],
    periodDays: [null, [Validators.required, Validators.min(1)]],
    periodTradeUnionAmount: [null],
    periodSolidarityAmount: [null],
    periodParafiscalContributionsAmount: [null],
    periodPensionAmount: [null],
    periodTransportAmount: [null],
    periodSeniorityAmount: [null],
    epsEntityName: [''],
    pensionEntity: [''],
    arlEntityName: [''],
    zone: [''],
  });
  areaCtx: SearchSelectContextFactory<Area>;
  costCenterCtx: SearchSelectContextFactory<CostCenter>;
  positionCtx: SearchSelectContextFactory<Position>;
  presupuestalCategoryCtx: SearchSelectContextFactory<PresupuestalCategory>;

  constructor() {
    this.areaCtx = this.areaService.newSearchSelectAreaContext((area) =>
      this.form.patchValue({ areaId: area.id }),
    );
    this.costCenterCtx = this.costCenterService.newSearchSelectContext((cc) =>
      this.form.patchValue({ costCenterId: cc.id }),
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
    this.epsEntityService
      .getEpsEntities()
      .subscribe((res) => this.epsEntities.set(res.data ?? []));
    this.arlEntityService
      .findAll()
      .subscribe((res) => this.arlEntities.set(res.data ?? []));
    this.filingFileNameService
      .findAll()
      .subscribe((res) => this.filingFileNames.set(res.data ?? []));

    this.applyPrefillFromQueryParams();
  }

  private applyPrefillFromQueryParams(): void {
    const q = this.route.snapshot.queryParamMap;
    this.fromExecutionId = q.get('fromExecutionId');

    const areaId = q.get('areaId');
    const areaName = q.get('areaName');
    if (areaId && areaName) {
      this.form.patchValue({ areaId: Number(areaId) });
      this.areaCtx.selectResults([
        { id: Number(areaId), name: areaName } as any,
      ]);
    }

    const costCenterId = q.get('costCenterId');
    const costCenterName = q.get('costCenterName');
    if (costCenterId && costCenterName) {
      this.form.patchValue({ costCenterId: Number(costCenterId) });
      this.costCenterCtx.selectResults([
        { id: Number(costCenterId), name: costCenterName } as any,
      ]);
    }

    const positionId = q.get('positionId');
    const positionName = q.get('positionName');
    if (positionId && positionName) {
      this.form.patchValue({ positionId: Number(positionId) });
      this.positionCtx.selectResults([
        { id: Number(positionId), name: positionName } as any,
      ]);
    }

    const contractTypeName = q.get('contractTypeName');
    if (contractTypeName) {
      this.form.patchValue({ contractTypeName });
    }

    const basePeriodAmount = q.get('basePeriodAmount');
    if (basePeriodAmount) {
      this.form.patchValue({ basePeriodAmount: Number(basePeriodAmount) });
    }
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
    this.router.navigate(['/contracts/dashboard']);
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (this.hasRequiredFileMissing()) {
      this.error.set('Faltan archivos de radicación requeridos');
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
          areaId: v.areaId,
          costCenterId: v.costCenterId,
          positionId: v.positionId,
          presupuestalCategoryId: v.presupuestalCategoryId,
          starts: v.starts,
          ends: v.ends || null,
          basePeriodAmount: v.basePeriodAmount,
          periodDays: v.periodDays,
          periodTradeUnionAmount: v.periodTradeUnionAmount || null,
          periodSolidarityAmount: v.periodSolidarityAmount || null,
          periodParafiscalContributionsAmount:
            v.periodParafiscalContributionsAmount || null,
          periodPensionAmount: v.periodPensionAmount || null,
          periodTransportAmount: v.periodTransportAmount || null,
          periodSeniorityAmount: v.periodSeniorityAmount || null,
          epsEntityName: v.epsEntityName || null,
          pensionEntity: v.pensionEntity || null,
          arlEntityName: v.arlEntityName || null,
          zone: v.zone || null,
        },
        this.selectedFiles(),
      )
      .subscribe({
        next: (res) => {
          this.submitting.set(false);
          const executionId = this.fromExecutionId;
          const contractId = res.data?.id;
          if (executionId && contractId) {
            this.executionPlanService
              .linkContract(executionId, { contractId })
              .subscribe(() => this.goBackAfterCreate());
          } else {
            this.goBackAfterCreate();
          }
        },
        error: (err) => {
          this.submitting.set(false);
          this.error.set(err.error?.message ?? 'Error al crear el contrato');
        },
      });
  }

  private goBackAfterCreate(): void {
    this.router.navigate(['/contracts/dashboard']);
  }
}
