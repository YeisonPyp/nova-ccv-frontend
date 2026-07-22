import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { TrainingService } from '@/app/core/services/training/training.service';
import { TrainingParticipantService } from '@/app/core/services/training/training-participant.service';
import {
  SurveyAudience,
  TrainingParticipant,
  TrainingSurvey,
} from '@/app/core/models/training/training.models';
import { PaginatorComponent } from '@/app/shared/components/paginator/paginator.component';

/**
 * Evaluations tab: paginated list of respondents (participants). Each row opens
 * the full-screen form to answer the surveys attached to the training.
 */
@Component({
  selector: 'app-training-evaluations',
  standalone: true,
  imports: [CommonModule, PaginatorComponent],
  templateUrl: './training-evaluations.component.html',
})
export class TrainingEvaluationsComponent {
  private readonly service = inject(TrainingService);
  private readonly participantService = inject(TrainingParticipantService);
  private readonly router = inject(Router);

  trainingId = input.required<number>();

  participants = signal<TrainingParticipant[]>([]);
  surveys = signal<TrainingSurvey[]>([]);
  loading = signal(false);

  /** Which evaluation flow is active. */
  mode = signal<SurveyAudience>('EMPLOYEES');

  hasEmployeeSurveys = computed(() =>
    this.surveys().some((s) => s.aimedAt === 'EMPLOYEES'),
  );
  hasTrainingSurveys = computed(() =>
    this.surveys().some((s) => s.aimedAt === 'TRAINING'),
  );

  // client-side pagination
  page = signal(1);
  size = signal(10);
  totalPages = computed(() =>
    Math.max(1, Math.ceil(this.participants().length / this.size())),
  );
  pagedParticipants = computed(() => {
    const start = (this.page() - 1) * this.size();
    return this.participants().slice(start, start + this.size());
  });

  constructor() {
    effect(() => {
      this.load(this.trainingId());
    });
  }

  load(id: number) {
    this.loading.set(true);
    this.participantService.getTrainingParticipants(id).subscribe({
      next: (res) => {
        this.participants.set(res.data ?? []);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
    this.service.getDetail(id).subscribe((res) => {
      const surveys = res.data?.surveys ?? [];
      this.surveys.set(surveys);
      // default to whichever flow has surveys
      if (!this.hasEmployeeSurveys() && this.hasTrainingSurveys()) {
        this.mode.set('TRAINING');
      }
    });
  }

  goToPage(p: number) {
    this.page.set(p);
  }

  openAnswers(p: TrainingParticipant) {
    this.router.navigate(
      ['/training', this.trainingId(), 'answer', p.employeeId],
      { queryParams: { audience: this.mode() } },
    );
  }
}
