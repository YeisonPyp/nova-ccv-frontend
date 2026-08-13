import { EvidenceDto } from '@/app/core/models/improvement-plan/evidence.model';
import {
  actionFollowUpStatus,
  ImprovementActionFollowUp,
} from '@/app/core/models/improvement-plan/improvement-action.model';
import { ImprovementActionService } from '@/app/core/services/improvement-plan/improvement-action.service';
import { EvidenceItemComponent } from '@/app/features/improvement-plan/pages/improvement-plan/components/evidence-item/evidence-item.component';
import {
  Option,
  SelectorComponent,
} from '@/app/shared/components/selector/selector.component';
import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  effect,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';

const STATUS_BADGE_CLASSES: Record<string, string> = {
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
  COMPLETED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  OVERDUE: 'bg-red-50 text-red-700 border-red-200',
};

@Component({
  selector: 'app-action-followup',
  standalone: true,
  imports: [
    CommonModule,
    EvidenceItemComponent,
    ReactiveFormsModule,
    SelectorComponent,
  ],
  templateUrl: './action-followup.component.html',
})
export class ActionFollowUpComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(ImprovementActionService);

  followup = input.required<ImprovementActionFollowUp>();

  evidences = signal<EvidenceDto[]>([]);

  form = this.fb.group({
    observations: [''],
    status: [''],
    scheduledDate: [''],
  });

  permissionsSet = computed(() => new Set(this.followup()?.permissions ?? []));

  canEdit = computed(() => this.permissionsSet().has('EDIT'));

  canUploadEvidence = computed(() =>
    this.permissionsSet().has('UPLOAD_EVIDENCE'),
  );

  statusLabel = computed(
    () =>
      actionFollowUpStatus[this.followup().status] ?? this.followup().status,
  );

  statusBadgeClass = computed(
    () =>
      STATUS_BADGE_CLASSES[this.followup().status] ??
      'bg-gray-100 text-tertiary border-gray-200',
  );

  constructor() {
    effect(() => {
      const f = this.followup();
      this.evidences.set(f.evidences ?? []);
      this.form.patchValue(
        {
          observations: f.observations,
          status: f.status,
          scheduledDate: f.scheduledAt,
        },
        { emitEvent: false },
      );
    });

    effect(() => {
      if (this.canEdit()) {
        this.form.enable({ emitEvent: false });
      } else {
        this.form.disable({ emitEvent: false });
      }
    });
  }

  ngOnInit(): void {
    this.form.valueChanges
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe((f) => {
        this.service
          .updateFollowUp(this.followup().id, {
            observations: f.observations!,
            scheduledDate: f.scheduledDate!,
            status: f.status!,
          })
          .subscribe();
      });
  }

  onSaveEvidence(e: EvidenceDto) {
    const ev = this.evidences().reduce(
      (prev, curr) => {
        prev[curr.id] = curr;
        return prev;
      },
      {} as Record<number, EvidenceDto>,
    );
    ev[e.id] = e;

    this.evidences.set(Object.values(ev));
  }

  onRemoveEvidence(ev: EvidenceDto) {
    this.evidences.set(this.evidences().filter((e) => e.id !== ev.id));
  }

  get statusOptions(): Option[] {
    return Object.entries(actionFollowUpStatus).map(([key, value]) => ({
      value: key,
      label: value,
    }));
  }
}
