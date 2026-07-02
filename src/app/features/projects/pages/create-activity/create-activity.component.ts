import { Employee } from '@/app/core/models/assessment/employee.model';
import {
  PatActivity,
  PatMeasurement,
  PatPolicy,
} from '@/app/core/models/pat/pat-models';
import { EmployeeService } from '@/app/core/services/assessment/employee.service';
import { MeasurementService } from '@/app/core/services/pat/measurement.service';
import {
  CreatePatActivity,
  PatActivityService,
} from '@/app/core/services/pat/pat-activity.service';
import { PolicyService } from '@/app/core/services/pat/policy.service';
import { ColorPickerComponent } from '@/app/shared/components/color-picker/color-picker.component';
import { ContextSearchSelectComponent } from '@/app/shared/components/context-search-select/context-search-select.component';
import { SearchSelectContextFactory } from '@/app/shared/components/search-select/on-search-select.interface';
import { FormFieldErrorDirective } from '@/app/shared/directives/form-field-error.directive';
import { CommonModule } from '@angular/common';
import { Component, inject, input, output, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-create-pat-activity',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ContextSearchSelectComponent,
    FormFieldErrorDirective,
    ColorPickerComponent,
  ],
  templateUrl: './create-activity.component.html',
})
export class CreatePatActivityComponent {
  private readonly patApi = inject(PatActivityService);
  private readonly employeeService = inject(EmployeeService);
  private readonly measurementService = inject(MeasurementService);
  private readonly policyService = inject(PolicyService);
  private readonly fb = inject(FormBuilder);
  projectId = input.required<number>();

  onSaved = output<PatActivity>();

  submitting = signal(false);

  form: FormGroup<Record<keyof CreatePatActivity, any>>;

  employeeCtx: SearchSelectContextFactory<Employee> =
    this.employeeService.newSearchSelectEmployeeContext(
      (emp) => this.form.patchValue({ employeeId: emp.id }),
      { isRequired: true, maxItems: 1 },
      () => this.form.patchValue({ employeeId: null }),
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

  constructor() {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(255)]],
      code: ['', [Validators.required, Validators.maxLength(50)]],
      employeeId: [null as number | null, Validators.required],
      measurementId: [null as number | null, Validators.required],
      startsAt: ['', Validators.required],
      endsAt: ['', Validators.required],
      description: ['', Validators.maxLength(1000)],
      policyId: [null as number | null],
      colorHex: ['#FFFFFF'],
      measurementGoal: [null as number | null],
      projectId: [null as number | null],
      parentId: [null as number | null],
    });
  }

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
        measurementId: v.measurementId!,
        startsAt: v.startsAt!,
        endsAt: v.endsAt!,
        description: v.description!,
        policyId: v.policyId!,
        measurementGoal: v.measurementGoal!,
        projectId: this.projectId(),
        parentId: v.parentId!,
        colorHex: v.colorHex!,
      })
      .subscribe({
        next: (res) => {
          this.submitting.set(false);
          this.onSaved.emit(res.data);
        },
        error: (_) => {
          this.submitting.set(false);
        },
      });
  }
}
