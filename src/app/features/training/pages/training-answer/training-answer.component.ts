import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { TrainingService } from '@/app/core/services/training/training.service';
import { TrainingParticipantService } from '@/app/core/services/training/training-participant.service';
import {
  SurveyAudience,
  TrainingDetail,
  TrainingParticipant,
  TrainingSurvey,
} from '@/app/core/models/training/training.models';
import { LoadingSpinnerComponent } from '@/app/shared/components/loading-spinner/loading-spinner.component';
import { ScoreSliderComponent } from '@/app/features/assessment/pages/edit-assessment-modal/score-slider/score-slider.component';

/**
 * Full-screen form to answer the surveys of a training for one participant.
 * Mirrors the assessment evaluation screen.
 */
@Component({
  selector: 'app-training-answer',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LoadingSpinnerComponent,
    ScoreSliderComponent,
  ],
  templateUrl: './training-answer.component.html',
})
export class TrainingAnswerComponent {
  private readonly service = inject(TrainingService);
  private readonly participantService = inject(TrainingParticipantService);
  private readonly router = inject(Router);

  trainingId = input.required<number>();
  employeeId = input.required<number>();
  /** Query param: EMPLOYEES (grade employee) | TRAINING (course feedback). */
  audience = input<SurveyAudience | ''>('');

  detail = signal<TrainingDetail | null>(null);
  surveys = signal<TrainingSurvey[]>([]);
  participant = signal<TrainingParticipant | null>(null);

  /** Only the surveys of the requested audience (all when unspecified). */
  visibleSurveys = computed(() => {
    const aud = this.audience();
    const all = this.surveys();
    return aud ? all.filter((s) => s.aimedAt === aud) : all;
  });

  get title(): string {
    switch (this.audience()) {
      case 'EMPLOYEES':
        return 'Evaluar al participante';
      case 'TRAINING':
        return 'Feedback de la capacitación';
      default:
        return 'Responder evaluación';
    }
  }
  /** questionId -> score */
  scores = signal<Record<number, number>>({});

  isLoading = signal(true);
  saving = signal(false);

  constructor() {
    effect(() => {
      this.load(this.trainingId(), this.employeeId());
    });
  }

  load(trainingId: number, employeeId: number) {
    this.isLoading.set(true);
    forkJoin({
      detail: this.service.getDetail(trainingId),
      participants: this.participantService.getTrainingParticipants(trainingId),
      answers: this.service.getAnswers(trainingId, employeeId),
    }).subscribe({
      next: ({ detail, participants, answers }) => {
        this.detail.set(detail.data ?? null);
        this.surveys.set(detail.data?.surveys ?? []);
        this.participant.set(
          (participants.data ?? []).find(
            (p) => Number(p.employeeId) === Number(employeeId),
          ) ?? null,
        );
        const map: Record<number, number> = {};
        for (const a of answers.data ?? []) map[a.questionId] = Number(a.score);
        this.scores.set(map);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  scoreOf(questionId: number): number {
    return this.scores()[questionId] ?? 0;
  }

  setScore(questionId: number, value: number) {
    this.scores.update((m) => ({ ...m, [questionId]: value }));
  }

  get participantFullName(): string {
    const p = this.participant();
    return p ? `${p.employeeName} ${p.employeeLastname}` : '';
  }

  goBack() {
    this.router.navigate(['/training', this.trainingId()]);
  }

  onSubmit() {
    // if (this.saving()) return;
    // // only submit questions belonging to the visible (audience) surveys
    // const visibleQuestionIds = new Set<number>();
    // for (const s of this.visibleSurveys()) {
    //   for (const q of s.impacts ?? []) visibleQuestionIds.add(q.questionId);
    // }
    // const items = Object.entries(this.scores())
    //   .filter(([questionId]) => visibleQuestionIds.has(Number(questionId)))
    //   .map(([questionId, score]) => ({
    //     questionId: Number(questionId),
    //     score: Number(score),
    //   }));
    // if (!items.length) return;
    // this.saving.set(true);
    // this.service
    //   .submitAnswers(this.trainingId(), {
    //     employeeId: this.employeeId(),
    //     answers: items,
    //   })
    //   .subscribe({
    //     next: () => {
    //       this.saving.set(false);
    //       this.goBack();
    //     },
    //     error: () => this.saving.set(false),
    //   });
  }
}
