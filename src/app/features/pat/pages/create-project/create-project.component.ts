import {
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  CreateProjectDto,
  ProjectService,
} from '@/app/core/services/projects/project.service';
import { ProjectPriorityService } from '@/app/core/services/projects/project-priority.service';
import { AreaService } from '@/app/core/services/assessment/area.service';
import { ContextSearchSelectComponent } from '@/app/shared/components/context-search-select/context-search-select.component';
import { SearchSelectContextFactory } from '@/app/shared/components/search-select/on-search-select.interface';
import {
  ProjectPriority,
  ProjectStatus,
} from '@/app/core/models/projects/project-params.model';
import { Area } from '@/app/core/models/assessment/area.model';
import { PatTacticalActivityService } from '@/app/core/services/pat/tactical-activity.service';
import { Observable, of } from 'rxjs';
import { FormFieldErrorDirective } from '@/app/shared/directives/form-field-error.directive';
import { EmployeeService } from '@/app/core/services/assessment/employee.service';
import {
  PatProgramByYearService,
  PatProgramService,
} from '@/app/core/services/pat/pat-program.service';
import { ProjectStatusService } from '@/app/core/services/projects/project-status.service';

function endsShouldBeAfterStarts(
  starts: string,
  control: AbstractControl,
): Observable<ValidationErrors | null> {
  const ends = control.value;
  if (!ends) {
    return of(null);
  }

  const startDate = new Date(starts);
  const endDate = new Date(ends);

  if (endDate <= startDate) {
    return of({ endsBeforeStarts: true });
  }

  return of(null);
}

function matchesYear(
  targetYear: number,
  control: AbstractControl,
): Observable<ValidationErrors | null> {
  if (!control.value) {
    return of(null);
  }

  const date = new Date(control.value);

  if (isNaN(date.getTime())) {
    return of({ invalidDate: true });
  }

  const selectedYear = date.getUTCFullYear();

  if (selectedYear !== targetYear) {
    return of({
      yearMismatch: { expected: targetYear, actual: selectedYear },
    });
  }

  return of(null);
}

@Component({
  selector: 'app-create-project',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ContextSearchSelectComponent,
    FormFieldErrorDirective,
  ],
  templateUrl: './create-project.component.html',
})
export class CreateProjectComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly projectService = inject(ProjectService);
  private readonly priorityService = inject(ProjectPriorityService);
  private readonly areaService = inject(AreaService);
  private readonly employeeService = inject(EmployeeService);
  private readonly patTacticalActivityService = inject(
    PatTacticalActivityService,
  );
  private readonly strategicProgramService = inject(PatProgramService);
  private readonly projectStatusService = inject(ProjectStatusService);

  formErrors = {
    endsBeforeStarts:
      'La fecha de finalización debe ser posterior a la fecha de inicio',
    yearMismatch: 'El año debe coincidir con el año del PAT',
  };

  year = input.required<number>();

  submitting = signal(false);
  error = signal<string | null>(null);
  priorities = signal<ProjectPriority[]>([]);

  statuses = signal<ProjectStatus[]>([]);

  areaCtx: SearchSelectContextFactory<Area>;

  tacticalActivityCtx = computed(() =>
    this.patTacticalActivityService.newSearchSelectContext(
      this.year(),
      (ta) => this.form.patchValue({ tacticalActivityCode: ta.code }),
      undefined,
      () => this.form.patchValue({ tacticalActivityCode: '' }),
    ),
  );
  employeeCtx = this.employeeService.newSearchSelectEmployeeContext(
    (e) => this.form.patchValue({ employeeId: e.id }),
    { isRequired: true, label: 'Employee' },
    (_) => this.form.patchValue({ employeeId: null }),
  );

  strategicProgramCtx = computed(() => {
    return new PatProgramByYearService(
      this.strategicProgramService,
      this.year(),
    ).newSearchSelectContext(
      (p) => this.form.patchValue({ programId: p.id }),
      undefined,
      (_) => this.form.patchValue({ programId: null }),
    );
  });
  form: FormGroup<Record<keyof CreateProjectDto, any>>;

  constructor() {
    this.form = this.fb.group({
      code: ['', [Validators.required, Validators.maxLength(20)]],
      name: ['', [Validators.required]],
      areaId: [null, Validators.required],
      starts: [
        '',
        Validators.required,
        (control: AbstractControl) => matchesYear(Number(this.year()), control),
      ],
      ends: [
        '',
        Validators.required,
        (control: AbstractControl) =>
          endsShouldBeAfterStarts(
            this.form.get('starts')?.value as string,
            control,
          ),
      ],
      priorityId: [null, Validators.required],
      employeeId: [null, Validators.required],
      generalObjective: ['', Validators.required],
      tacticalActivityCode: ['', Validators.required],
      description: [''],
      programId: [null],
      status: ['', Validators.required],
      objectives: this.fb.array([]),
    });

    this.areaCtx = this.areaService.newSearchSelectAreaContext(
      (area) => this.form.patchValue({ areaId: area.id }),
      undefined,
      () => this.form.patchValue({ areaId: null }),
    );

    effect(() => {
      this.projectStatusService.findAll().subscribe((res) => {
        if (res.success && res.data) this.statuses.set(res.data);
      });
      this.priorityService.findAll().subscribe({
        next: (res) => {
          if (res.success && res.data) this.priorities.set(res.data);
        },
      });
    });
  }

  get objectives(): FormArray {
    return this.form.get('objectives') as FormArray;
  }

  addObjective(): void {
    this.objectives.push(
      this.fb.group({
        name: ['', Validators.required],
        description: ['', Validators.required],
      }),
    );
  }

  removeObjective(index: number): void {
    this.objectives.removeAt(index);
  }

  isFieldInvalid(field: string): boolean {
    const c = this.form.get(field);
    return !!(c?.touched && c?.invalid);
  }

  goBack(): void {
    this.router.navigate(['/projects']);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.error.set(null);

    const v = this.form.value as CreateProjectDto;

    this.projectService.create(v).subscribe({
      next: (res) => {
        this.submitting.set(false);
        if (res.success && res.data) {
          this.router.navigate(['/projects', res.data.id]);
        }
      },
      error: (err) => {
        this.submitting.set(false);
        this.error.set(err.error?.message ?? 'Error al crear el proyecto');
      },
    });
  }
}
