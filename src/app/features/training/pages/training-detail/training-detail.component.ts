import {
  Component,
  effect,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TrainingService } from '@/app/core/services/training/training.service';
import {
  TrainingDetail,
  TrainingParticipant,
} from '@/app/core/models/training/training.models';
import { LoadingSpinnerComponent } from '@/app/shared/components/loading-spinner/loading-spinner.component';
import { TrainingParticipantsManagement } from '../../components/training-participants-management/training-participants-management.component';
import { TrainingSessionsComponent } from '../../components/training-sessions/training-sessions.component';
import { TrainingSurveysComponent } from '../../components/training-surveys/training-surveys.component';
import { TrainingEvaluationsComponent } from '../../components/training-evaluations/training-evaluations.component';
import { TrainingMetricsComponent } from '../../components/training-metrics/training-metrics.component';

@Component({
  selector: 'app-training-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    LoadingSpinnerComponent,
    TrainingParticipantsManagement,
    TrainingSessionsComponent,
    TrainingSurveysComponent,
    TrainingEvaluationsComponent,
    TrainingMetricsComponent,
  ],
  templateUrl: './training-detail.component.html',
})
export class TrainingDetailComponent {
  private readonly service = inject(TrainingService);
  private readonly fb = inject(FormBuilder);

  loading = signal(true);
  detail = signal<TrainingDetail | null>(null);
  trainingId = input.required<number>();

  activeTab = signal<'sessions' | 'participants' | 'surveys' | 'answers'>(
    'participants',
  );

  // Eval Modal State
  evalModalOpen = signal(false);
  evalParticipant = signal<TrainingParticipant | null>(null);
  submittingEval = signal(false);

  evalForm = this.fb.group({
    score: [null as number | null, [Validators.min(0)]],
    status: ['INSCRITO', Validators.required],
    approved: [false],
  });

  constructor() {
    effect(() => {
      this.load(this.trainingId());
    });
  }

  load(id: number) {
    this.loading.set(true);
    this.service.getDetail(id).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.detail.set(res.data);
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  // ---- Participants ----
  openEvaluationModal(participant: TrainingParticipant) {
    this.evalParticipant.set(participant);
    this.evalForm.patchValue({
      score: participant.score !== undefined ? participant.score : null,
      status: participant.status || 'INSCRITO',
      approved: participant.approved || false,
    });
    this.evalModalOpen.set(true);
  }

  closeEvalModal() {
    this.evalModalOpen.set(false);
    this.evalParticipant.set(null);
  }

  onEvalSubmit() {
    const p = this.evalParticipant();
    const d = this.detail();
    if (!p || !d || this.evalForm.invalid) return;

    this.submittingEval.set(true);
    this.service
      .updateParticipant(d.id, p.id, {
        score: this.evalForm.value.score ?? undefined,
        status: this.evalForm.value.status!,
        approved: this.evalForm.value.approved!,
      })
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.closeEvalModal();
            this.load(d.id);
          }
          this.submittingEval.set(false);
        },
        error: () => this.submittingEval.set(false),
      });
  }

}
