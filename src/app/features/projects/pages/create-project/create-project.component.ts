import { Component, effect, inject, input, signal } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
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
import { ProjectPriority } from '@/app/core/models/projects/project-params.model';
import { Area } from '@/app/core/models/assessment/area.model';
import { PatTacticalActivity } from '@/app/core/models/pat/pat-models';
import { PatTacticalActivityService } from '@/app/core/services/pat/tactical-activity.service';

@Component({
  selector: 'app-create-project',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ContextSearchSelectComponent],
  templateUrl: './create-project.component.html',
})
export class CreateProjectComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly projectService = inject(ProjectService);
  private readonly priorityService = inject(ProjectPriorityService);
  private readonly areaService = inject(AreaService);
  private readonly patTacticalActivityService = inject(
    PatTacticalActivityService,
  );

  year = input.required<number>();

  submitting = signal(false);
  error = signal<string | null>(null);
  priorities = signal<ProjectPriority[]>([]);

  areaCtx: SearchSelectContextFactory<Area>;
  tacticalActivityCtx: SearchSelectContextFactory<PatTacticalActivity>;

  form: FormGroup<Record<keyof CreateProjectDto, any>>;

  constructor() {
    this.form = this.fb.group({
      code: ['', [Validators.required, Validators.maxLength(20)]],
      name: ['', [Validators.required]],
      areaId: [null, Validators.required],
      starts: ['', Validators.required, this.matchesYear.bind(this)],
      ends: ['', Validators.required, this.endsShouldBeAfterStarts.bind(this)],
      priorityId: [null, Validators.required],
      employeeId: [null, Validators.required],
      generalObjective: ['', Validators.required],
      tacticalActivityCode: ['', Validators.required],
      description: [''],
      programId: [null, Validators.required],
      objectives: this.fb.array([]),
    });

    this.areaCtx = this.areaService.newSearchSelectAreaContext(
      (area) => this.form.patchValue({ areaId: area.id }),
      undefined,
      () => this.form.patchValue({ areaId: null }),
    );
    this.tacticalActivityCtx =
      this.patTacticalActivityService.newSearchSelectContext(
        this.year(),
        (ta) => this.form.patchValue({ tacticalActivityCode: ta.code }),
        undefined,
        () => this.form.patchValue({ tacticalActivityCode: '' }),
      );

    effect(() => {
      this.priorityService.findAll().subscribe({
        next: (res) => {
          if (res.success && res.data) this.priorities.set(res.data);
        },
      });
      const date = new Date();
      date.setFullYear(this.year());
      this.form.get('starts')?.setValue(date.toString());
    });
  }

  endsShouldBeAfterStarts(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const starts = this.form.get('starts')?.value as string;
      if (!starts) {
        return null;
      }

      const ends = control.value;
      if (!ends) {
        return null;
      }

      const startDate = new Date(starts);
      const endDate = new Date(ends);

      if (endDate < startDate) {
        return { endsBeforeStarts: true };
      }

      return null;
    };
  }

  matchesYear(): ValidatorFn {
    const targetYear = this.year();
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const date = new Date(control.value);

      if (isNaN(date.getTime())) {
        return { invalidDate: true };
      }

      const selectedYear = date.getUTCFullYear();

      if (selectedYear !== targetYear) {
        return { yearMismatch: { expected: targetYear, actual: selectedYear } };
      }

      return null;
    };
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
