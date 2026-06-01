import { Employee } from "@/app/core/models/assessment/employee.model";
import { CostCenter } from "@/app/core/models/cost-center/cost-center.models";
import {
  PatActivity,
  PatBenefitType,
  PatMeasurement,
  PatPolicy,
  PatTacticalActivity,
} from "@/app/core/models/pat/pat-models";
import { EmployeeService } from "@/app/core/services/assessment/employee.service";
import { CostCenterService } from "@/app/core/services/cost-center/cost-center.service";
import { BenefitTypeService } from "@/app/core/services/pat/benefit-type.service";
import { MeasurementService } from "@/app/core/services/pat/measurement.service";
import { PatActivityService } from "@/app/core/services/pat/pat-activity.service";
import { PatProgramService } from "@/app/core/services/pat/pat-program.service";
import { PolicyService } from "@/app/core/services/pat/policy.service";
import { PatTacticalActivityService } from "@/app/core/services/pat/tactical-activity.service";
import { ContextSearchSelectComponent } from "@/app/shared/components/context-search-select/context-search-select.component";
import { SearchSelectContextFactory } from "@/app/shared/components/search-select/on-search-select.interface";
import { FormFieldErrorDirective } from "@/app/shared/directives/form-field-error.directive";
import { CommonModule } from "@angular/common";
import {
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";

@Component({
  selector: "app-create-pat-activity",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ContextSearchSelectComponent,
    FormFieldErrorDirective,
  ],
  templateUrl: "./create-activity.component.html",
})
export class CreatePatActivityComponent {
  private readonly patApi = inject(PatActivityService);
  private readonly employeeService = inject(EmployeeService);
  private readonly costCenterService = inject(CostCenterService);
  private readonly measurementService = inject(MeasurementService);
  private readonly benefitTypeService = inject(BenefitTypeService);
  private readonly policyService = inject(PolicyService);
  private readonly tacticalActivityService = inject(PatTacticalActivityService);
  private readonly programService = inject(PatProgramService);
  private readonly fb = inject(FormBuilder);
  year = input<number>(new Date().getFullYear());

  onSaved = output<PatActivity>();

  submitting = signal(false);

  form = this.fb.group({
    name: ["", [Validators.required, Validators.maxLength(255)]],
    code: [
      "",
      [
        Validators.required,
        Validators.maxLength(50),
        Validators.pattern(/^PRG-\d{4}-\d{3}$/),
      ],
    ],
    employeeId: [null as number | null, Validators.required],
    tacticalActivityId: [null as number | null, Validators.required],
    costCenterId: [null as number | null, Validators.required],
    measurementId: [null as number | null, Validators.required],
    indicatorId: [null as number | null, Validators.required],
    benefitTypeId: [null as number | null, Validators.required],
    startsAt: ["", Validators.required],
    endsAt: ["", Validators.required],
    description: ["", Validators.maxLength(1000)],
    strategicProgramId: [null as number | null],
    policyId: [null as number | null],
    measurementGoal: [null as number | null],
    indicatorBaseLine: [null as number | null],
    indicatorGoal: [null as number | null],
    benefitAmount: [null as number | null],
  });

  employeeCtx: SearchSelectContextFactory<Employee> =
    this.employeeService.newSearchSelectEmployeeContext(
      (emp) => this.form.patchValue({ employeeId: emp.id }),
      { isRequired: true, maxItems: 1 },
      () => this.form.patchValue({ employeeId: null }),
    );

  costCenterCtx: SearchSelectContextFactory<CostCenter> =
    this.costCenterService.newSearchSelectContext(
      (cc) => this.form.patchValue({ costCenterId: cc.id }),
      { isRequired: true, maxItems: 1 },
      () => this.form.patchValue({ costCenterId: null }),
    );

  policyCtx: SearchSelectContextFactory<PatPolicy> =
    this.policyService.newSearchSelectContext(
      (policy) => this.form.patchValue({ policyId: policy.id }),
      { isRequired: true, maxItems: 1 },
      () => this.form.patchValue({ policyId: null }),
    );

  measurementCtx: SearchSelectContextFactory<PatMeasurement> =
    this.measurementService.newSearchSelectContext(
      (measurement) => this.form.patchValue({ measurementId: measurement.id }),
      { isRequired: true, maxItems: 1 },
      () => this.form.patchValue({ measurementId: null }),
    );

  benefitCtx: SearchSelectContextFactory<PatBenefitType> =
    this.benefitTypeService.newSearchSelectContext(
      (benefit) => this.form.patchValue({ benefitTypeId: benefit.id }),
      { isRequired: true, maxItems: 1 },
      () => this.form.patchValue({ benefitTypeId: null }),
    );

  programCtx = computed(() =>
    this.programService.getServiceByYear(this.year()).newSearchSelectContext(
      (pillar) => this.form.patchValue({ strategicProgramId: pillar.id }),
      { isRequired: false, maxItems: 1 },
      () => this.form.patchValue({ strategicProgramId: null }),
    ),
  );

  tacticalActivityCtx: SearchSelectContextFactory<PatTacticalActivity> =
    this.tacticalActivityService.newSearchSelectContext(
      this.year(),
      (ta) => this.form.patchValue({ tacticalActivityId: ta.id }),
      { isRequired: true, maxItems: 1 },
      () => this.form.patchValue({ tacticalActivityId: null }),
    );

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting.set(true);

    const v = this.form.value;

    this.patApi
      .create({
        code: v.code!,
        name: v.name!,
        employeeId: v.employeeId!,
        costCenterId: v.costCenterId!,
        tacticalActivityId: v.tacticalActivityId!,
        measurementId: v.measurementId!,
        indicatorId: v.indicatorId!,
        benefitTypeId: v.benefitTypeId!,
        startsAt: v.startsAt!,
        endsAt: v.endsAt!,
        description: v.description!,
        strategicProgramId: v.strategicProgramId!,
        policyId: v.policyId!,
        measurementGoal: v.measurementGoal!,
        indicatorBaseLine: v.indicatorBaseLine!,
        indicatorGoal: v.indicatorGoal!,
        benefitAmount: v.benefitAmount!,
      })
      .subscribe({
        next: (res) => {
          this.submitting.set(false);
          this.onSaved.emit(res.data);
        },
      });
  }
}
