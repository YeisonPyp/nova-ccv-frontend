import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  effect,
  input,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  Training,
  TrainingAssessment,
  TrainingSurveyAnswer,
} from '@/app/core/models/training/training.models';
import { toObservable } from '@angular/core/rxjs-interop';

export interface TrainingEffectivenessScores {
  [trainingAssessmentId: number]: TrainingSurveyScore;
}

export interface TrainingSurveyScore {
  [questionId: number]: number;
}

interface TrainingSurvey {
  assessment: TrainingAssessment;
  trainingAssessmentId: number;
  training: Training;
  surveyId: number;
  surveyName: string;
  answers: TrainingSurveyAnswer[];
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
  assessments = input.required<TrainingAssessment[]>();

  surveys = computed(() => {
    const groups = this.assessments().reduce((prev, assessment) => {
      assessment.answers.forEach((answer) => {
        const group = prev.get(answer.surveyId);
        if (group) {
          group.answers.push(answer);
        } else {
          prev.set(answer.surveyId, {
            assessment,
            training: assessment.training,
            trainingAssessmentId: assessment.id,
            surveyId: answer.surveyId,
            surveyName: answer.surveyName,
            answers: [answer],
          });
        }
      });
      return prev;
    }, new Map<number, TrainingSurvey>());
    return Array.from(groups.values());
  });

  onUpdateScores = output<TrainingEffectivenessScores>();
  isDisabled = input<boolean>(false);

  scores = signal<TrainingEffectivenessScores>({});

  hasData = computed(() => this.surveys().length > 0);

  constructor() {
    effect(() => {
      const map: TrainingEffectivenessScores = {};
      for (const s of this.assessments()) {
        map[s.id] = {};
        for (const q of s.answers) {
          if (q.score !== null && q.score !== undefined) {
            map[s.id][q.question.id] = Number(q.score);
          }
        }
      }
      this.scores.set(map);
    });
    toObservable(this.scores).subscribe((scores) => {
      this.onUpdateScores.emit(scores);
    });
  }

  scoreOf(trainingAssessmentId: number, questionId: number): number | null {
    const v = this.scores()[trainingAssessmentId]?.[questionId];
    return v === undefined ? null : v;
  }

  canEdit(a: TrainingAssessment) {
    return a.permissions?.includes('UPDATE') && !this.isDisabled();
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
