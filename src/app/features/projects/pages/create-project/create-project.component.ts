import { Component, effect, inject, signal } from '@angular/core';
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
import { Observable, of } from 'rxjs';
import { FormFieldErrorDirective } from '@/app/shared/directives/form-field-error.directive';
import { EmployeeService } from '@/app/core/services/assessment/employee.service';
import { ProjectStatusService } from '@/app/core/services/projects/project-status.service';
import { CostCenterService } from '@/app/core/services/cost-center/cost-center.service';
import { CostCenter } from '@/app/core/models/cost-center/cost-center.models';

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
  private readonly costCenterService = inject(CostCenterService);
  private readonly projectStatusService = inject(ProjectStatusService);

  formErrors = {
    endsBeforeStarts:
      'La fecha de finalización debe ser posterior a la fecha de inicio',
  };

  submitting = signal(false);
  error = signal<string | null>(null);
  priorities = signal<ProjectPriority[]>([]);
  statuses = signal<ProjectStatus[]>([]);

  areaCtx: SearchSelectContextFactory<Area>;
  costCenterCtx: SearchSelectContextFactory<CostCenter>;

  employeeCtx = this.employeeService.newSearchSelectEmployeeContext(
    (e) => this.form.patchValue({ employeeId: e.id }),
    { isRequired: true, label: 'Empleado' },
    (_) => this.form.patchValue({ employeeId: null }),
  );

  form: FormGroup;

  constructor() {
    this.form = this.fb.group({
      code: ['', [Validators.required, Validators.maxLength(20)]],
      name: ['', [Validators.required]],
      areaId: [null, Validators.required],
      costCenterId: [null],
      starts: ['', Validators.required],
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
      description: [''],
      totalBudget: [null],
      status: ['', Validators.required],
      objectives: this.fb.array([]),
    });

    this.areaCtx = this.areaService.newSearchSelectAreaContext(
      (area) => this.form.patchValue({ areaId: area.id }),
      undefined,
      () => this.form.patchValue({ areaId: null }),
    );

    this.costCenterCtx = this.costCenterService.newSearchSelectContext(
      (cc) => this.form.patchValue({ costCenterId: cc.id }),
      undefined,
      () => this.form.patchValue({ costCenterId: null }),
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

    const v = this.form.value satisfies CreateProjectDto;

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
