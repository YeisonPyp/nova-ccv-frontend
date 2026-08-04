import {
  Component,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import {
  CreateProjectActivityDto,
  ProjectService,
  RISK_SCALE_OPTIONS,
  UpdateProjectActivityDto,
} from '@/app/core/services/projects/project.service';
import { ProjectActivity } from '@/app/core/models/projects/project.model';
import { ActivityStatusService } from '@/app/core/services/projects/activity-status.service';
import { ActivityStatus } from '@/app/core/models/projects/project-params.model';

@Component({
  selector: 'app-activity-upsert-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './activity-upsert-modal.component.html',
})
export class ActivityUpsertModalComponent {
  readonly isOpen = input<boolean>(false);
  readonly projectId = input.required<number>();
  readonly activity = input<ProjectActivity | null>(null);
  readonly activities = input<ProjectActivity[]>([]);

  readonly onClose = output<void>();
  readonly onSaved = output<ProjectActivity>();

  private readonly fb = inject(FormBuilder);
  private readonly projectService = inject(ProjectService);
  private readonly activityStatusService = inject(ActivityStatusService);

  readonly priorityOptions = RISK_SCALE_OPTIONS;
  statuses = signal<ActivityStatus[]>([]);
  submitting = signal(false);
  error = signal<string | null>(null);

  form: FormGroup = this.fb.group({
    name: ['', Validators.required],
    description: [''],
    displayOrder: [1, [Validators.required, Validators.min(1)]],
    startsAt: [null],
    endsAt: [null],
    status: ['', Validators.required],
    priority: ['medium'],
    colorHex: ['#FFFFFF'],
    approvedBudget: [null],
  });

  constructor() {
    this.activityStatusService.findAll({ size: 50 }).subscribe((res) => {
      if (res.success && res.data) this.statuses.set(res.data.content);
    });

    effect(() => {
      if (this.isOpen()) {
        this.error.set(null);
        const a = this.activity();
        if (a) {
          this.form.reset({
            name: a.name,
            description: a.description ?? '',
            displayOrder: a.displayOrder,
            startsAt: a.startsAt ?? null,
            endsAt: a.endsAt ?? null,
            status: a.status ?? '',
            priority: a.priority ?? 'medium',
            colorHex: a.colorHex ?? '#FFFFFF',
            approvedBudget: a.approvedBudget ?? null,
          });
        } else {
          this.form.reset({
            name: '',
            description: '',
            displayOrder: this.activities().length + 1,
            startsAt: null,
            endsAt: null,
            status: 'pending',
            priority: 'medium',
            colorHex: '#FFFFFF',
            approvedBudget: null,
          });
        }
      }
    });
  }

  isFieldInvalid(field: string): boolean {
    const c = this.form.get(field);
    return !!(c?.touched && c?.invalid);
  }

  close(): void {
    this.onClose.emit();
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.error.set(null);

    const v = this.form.value;
    const a = this.activity();

    if (a) {
      const dto: UpdateProjectActivityDto = {
        name: v.name,
        description: v.description || undefined,
        displayOrder: v.displayOrder,
        startsAt: v.startsAt || null,
        endsAt: v.endsAt || null,
        status: v.status || undefined,
        priority: v.priority || null,
        colorHex: v.colorHex || undefined,
        approvedBudget: v.approvedBudget ?? null,
      };
      this.projectService.updateActivity(a.id, dto).subscribe({
        next: (res) => {
          this.submitting.set(false);
          if (res.success && res.data) this.onSaved.emit(res.data);
        },
        error: (err) => {
          this.submitting.set(false);
          this.error.set(err.error?.message ?? 'Error al guardar la actividad');
        },
      });
      return;
    }

    const dto: CreateProjectActivityDto = {
      name: v.name,
      description: v.description || undefined,
      displayOrder: v.displayOrder,
      startsAt: v.startsAt || null,
      endsAt: v.endsAt || null,
      status: v.status,
      priority: v.priority || null,
      colorHex: v.colorHex || undefined,
      approvedBudget: v.approvedBudget ?? null,
    };

    this.projectService.createActivity(this.projectId(), dto).subscribe({
      next: (res) => {
        this.submitting.set(false);
        if (res.success && res.data) this.onSaved.emit(res.data);
      },
      error: (err) => {
        this.submitting.set(false);
        this.error.set(err.error?.message ?? 'Error al guardar la actividad');
      },
    });
  }
}
