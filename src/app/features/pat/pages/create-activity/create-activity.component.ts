import {
  Component,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  CreatePatActivity,
  PatActivityService,
} from '@/app/core/services/pat/pat-activity.service';
import { ContextSearchSelectComponent } from '@/app/shared/components/context-search-select/context-search-select.component';
import { SearchSelectContextFactory } from '@/app/shared/components/search-select/on-search-select.interface';
import { PatTacticalActivityService } from '@/app/core/services/pat/tactical-activity.service';
import { PatProgramService } from '@/app/core/services/pat/pat-program.service';
import { PolicyService } from '@/app/core/services/pat/policy.service';
import { PatUnitMeasureService } from '@/app/core/services/pat/pat-unit-measure.service';
import { PatPolicy, PatTacticalActivity, PatUnitMeasure } from '@/app/core/models/pat/pat-models';
import { Observable, of } from 'rxjs';
import { FormFieldErrorDirective } from '@/app/shared/directives/form-field-error.directive';

function matchesYear(
  targetYear: number,
  control: AbstractControl,
): Observable<ValidationErrors | null> {
  if (!control.value) return of(null);
  const date = new Date(control.value);
  if (isNaN(date.getTime())) return of({ invalidDate: true });
  if (date.getUTCFullYear() !== targetYear) {
    return of({ yearMismatch: { expected: targetYear } });
  }
  return of(null);
}

function endsShouldBeAfterStarts(
  starts: string,
  control: AbstractControl,
): Observable<ValidationErrors | null> {
  const ends = control.value;
  if (!ends) return of(null);
  if (new Date(ends) <= new Date(starts)) {
    return of({ endsBeforeStarts: true });
  }
  return of(null);
}

@Component({
  selector: 'app-create-pat-activity',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ContextSearchSelectComponent,
    FormFieldErrorDirective,
  ],
  templateUrl: './create-activity.component.html',
})
export class CreatePatActivityComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly activityService = inject(PatActivityService);
  private readonly tacticalActivityService = inject(PatTacticalActivityService);
  private readonly programService = inject(PatProgramService);
  private readonly policyService = inject(PolicyService);
  private readonly unitMeasureService = inject(PatUnitMeasureService);

  year = input.required<number>();

  formErrors = {
    endsBeforeStarts:
      'La fecha de finalización debe ser posterior a la fecha de inicio',
    yearMismatch: 'El año debe coincidir con el año del PAT',
  };

  submitting = signal(false);
  error = signal<string | null>(null);

  tacticalActivityCtx = computed(() =>
    this.tacticalActivityService.newSearchSelectContext(
      this.year(),
      (ta: PatTacticalActivity) =>
        this.form.patchValue({ tacticalActivityId: ta.id }),
      { isRequired: true, label: 'Actividad táctica' },
      () => this.form.patchValue({ tacticalActivityId: null }),
    ),
  );

  programCtx = computed(() =>
    this.programService
      .getServiceByAdenda(null)
      .newSearchSelectContext(
        (p) => this.form.patchValue({ programId: p.id }),
        undefined,
        () => this.form.patchValue({ programId: null }),
      ),
  );

  policyCtx: SearchSelectContextFactory<PatPolicy> =
    this.policyService.newSearchSelectContext(
      (p) => this.form.patchValue({ policyId: p.id }),
      undefined,
      () => this.form.patchValue({ policyId: null }),
    );

  unitMeasureCtx: SearchSelectContextFactory<PatUnitMeasure> =
    this.unitMeasureService.newSearchSelectContext(
      (u) => this.form.patchValue({ unitMeasureId: u.id }),
      { isRequired: false, label: 'Unidad de medida' },
      () => this.form.patchValue({ unitMeasureId: null }),
    );

  form: FormGroup = this.fb.group({
    code: [''],
    name: ['', Validators.required],
    tacticalActivityId: [null, Validators.required],
    policyId: [null],
    programId: [null],
    unitMeasureId: [null],
    unitMeasureGoal: [null],
    description: [''],
    starts: [
      '',
      Validators.required,
      (c: AbstractControl) => matchesYear(this.year(), c),
    ],
    ends: [
      '',
      Validators.required,
      (c: AbstractControl) =>
        endsShouldBeAfterStarts(this.form.get('starts')?.value, c),
    ],
  });

  isFieldInvalid(field: string): boolean {
    const c = this.form.get(field);
    return !!(c?.touched && c?.invalid);
  }

  goBack(): void {
    this.router.navigate([`/pat/${this.year()}/dashboard`]);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.error.set(null);

    const v = this.form.value;
    const dto: CreatePatActivity = {
      code: v.code || undefined,
      name: v.name,
      tacticalActivityId: v.tacticalActivityId,
      policyId: v.policyId || null,
      programId: v.programId || null,
      unitMeasureId: v.unitMeasureId || null,
      unitMeasureGoal: v.unitMeasureGoal ?? null,
      description: v.description || undefined,
      startsAt: v.starts,
      endsAt: v.ends,
    };

    this.activityService.create(dto).subscribe({
      next: (res) => {
        this.submitting.set(false);
        if (res.success && res.data) {
          this.router.navigate([`/pat/${this.year()}/activities`, res.data.id]);
        }
      },
      error: (err) => {
        this.submitting.set(false);
        this.error.set(err.error?.message ?? 'Error al crear la actividad');
      },
    });
  }
}
