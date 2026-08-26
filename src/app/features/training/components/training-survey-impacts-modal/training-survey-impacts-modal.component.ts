import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { TrainingService } from '@/app/core/services/training/training.service';
import {
  TrainingSurvey,
  TrainingSurveyImpact,
} from '@/app/core/models/training/training.models';

/**
 * Modal to configure the impact factor (weight) of each survey question for a
 * training. Higher impact => bigger weight on the participant's final score.
 */
@Component({
  selector: 'app-training-survey-impacts-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './training-survey-impacts-modal.component.html',
})
export class TrainingSurveyImpactsModalComponent {
  private readonly service = inject(TrainingService);

  trainingId = input.required<number>();
  survey = input.required<TrainingSurvey>();

  onClose = output<void>();
  onSaved = output<void>();

  editImpacts = signal<TrainingSurveyImpact[]>([]);
  saving = signal(false);

  totalImpact = computed(() =>
    this.editImpacts().reduce((sum, i) => sum + (Number(i.impact) || 0), 0),
  );

  constructor() {
    effect(() => {
      // reset the editable copy whenever the target survey changes
      this.editImpacts.set(
        (this.survey().impacts ?? []).map((i) => ({ ...i })),
      );
    });
  }

  /** Relative weight (%) of a question against the sum of impacts. */
  weightPct(impact: number): number {
    const total = this.totalImpact();
    return total > 0 ? Math.round(((Number(impact) || 0) / total) * 100) : 0;
  }

  setImpactValue(questionId: number, value: number) {
    const v = value == null || value < 0 ? 0 : value;
    this.editImpacts.update((list) =>
      list.map((i) => (i.questionId === questionId ? { ...i, impact: v } : i)),
    );
  }

  close() {
    this.onClose.emit();
  }

  save() {
    const survey = this.survey();
    const impacts = this.editImpacts();
    if (!impacts.length || this.saving()) return;

    this.saving.set(true);
    const calls = impacts.map((i) =>
      this.service.setImpact(this.trainingId(), survey.id, {
        questionId: i.questionId,
        impact: i.impact ?? 1,
      }),
    );
    forkJoin(calls).subscribe({
      next: () => {
        this.saving.set(false);
        this.onSaved.emit();
      },
      error: () => this.saving.set(false),
    });
  }
}
