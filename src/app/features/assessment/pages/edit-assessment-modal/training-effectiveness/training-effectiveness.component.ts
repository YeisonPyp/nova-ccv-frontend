import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  effect,
  input,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TrainingEffectiveness } from '@/app/core/models/training/training.models';
import { toObservable } from '@angular/core/rxjs-interop';

export interface TrainingEffectivenessScores {
  [trainingAssessmentId: number]: TrainingSurveyScore;
}

export interface TrainingSurveyScore {
  [questionId: number]: number;
}
/**
 * "Evaluación eficacia de las capacitaciones recibidas": training surveys that
 * resurface in a performance assessment once their feedbackAfter interval has
 * elapsed. Answers are stored as training survey answers, so they never affect
 * the assessment's own average.
 */
@Component({
  selector: 'app-training-effectiveness',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './training-effectiveness.component.html',
})
export class TrainingEffectivenessComponent {
  surveys = input.required<TrainingEffectiveness[]>();

  onUpdateScores = output<TrainingEffectivenessScores>();
  isDisabled = input<boolean>(false);

  scores = signal<TrainingEffectivenessScores>({});

  hasData = computed(() => this.surveys().length > 0);

  constructor() {
    effect(() => {
      const map: TrainingEffectivenessScores = {};
      for (const s of this.surveys()) {
        map[s.trainingAssessmentId] = {};
        for (const q of s.questions) {
          if (q.score !== null && q.score !== undefined) {
            map[s.trainingAssessmentId][q.questionId] = Number(q.score);
          }
        }
      }
      this.scores.set(map);
    });
    toObservable(this.scores).subscribe((scores) => {
      this.onUpdateScores.emit(scores);
    });
  }

  /** Who answers this block, per the survey scope. */
  audienceLabel(s: TrainingEffectiveness): string {
    return s.aimedAt === 'EMPLOYEES'
      ? 'Evaluación del jefe inmediato'
      : 'Evaluación del funcionario';
  }

  scoreOf(trainingAssessmentId: number, questionId: number): number | null {
    const v = this.scores()[trainingAssessmentId]?.[questionId];
    return v === undefined ? null : v;
  }

  setScore(trainingAssessmentId: number, questionId: number, value: number) {
    this.scores.update((m) => ({
      ...m,
      [trainingAssessmentId]: {
        ...m[trainingAssessmentId],
        [questionId]: Number(value),
      },
    }));
  }

  /** Yes/No shortcut: a question with max 1 behaves as a boolean. */
  isYesNo(min?: number, max?: number): boolean {
    return (min ?? 0) === 0 && (max ?? 0) === 1;
  }
}
