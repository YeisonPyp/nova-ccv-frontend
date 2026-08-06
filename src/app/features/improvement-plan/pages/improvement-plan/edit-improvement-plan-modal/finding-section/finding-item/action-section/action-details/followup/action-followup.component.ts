import { EvidenceDto } from '@/app/core/models/improvement-plan/evidence.model';
import { ImprovementActionFollowUp } from '@/app/core/models/improvement-plan/improvement-action.model';
import {
  ImprovementActionService,
  improvementActionStatus,
} from '@/app/core/services/improvement-plan/improvement-action.service';
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
  output,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';

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

  constructor() {
    effect(() => {
      const f = this.followup();
      this.evidences.set(f.evidences ?? []);
      this.form.patchValue({ observations: f.observations, status: f.status });
      this.form.disable();
    });

    effect(() => {
      if (this.canEdit()) {
        this.form.enable();
      }
    });
  }

  ngOnInit(): void {
    this.form.valueChanges
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe((f) => {
        this.service.updateFollowUp(this.followup().id, {
          observations: f.observations!,
          scheduledDate: f.scheduledDate!,
          status: f.status!,
        });
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
    return Object.entries(improvementActionStatus).map(([key, value]) => ({
      value: key,
      label: value,
    }));
  }
}
