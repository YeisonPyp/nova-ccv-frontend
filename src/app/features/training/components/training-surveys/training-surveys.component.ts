import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { TrainingService } from '@/app/core/services/training/training.service';
import { TrainingSurvey } from '@/app/core/models/training/training.models';
import {
  AttachSurveyEvent,
  SurveyScopeItem,
  SurveyScopeListComponent,
} from '../survey-scope-list/survey-scope-list.component';
import { TrainingSurveyImpactsModalComponent } from '../training-survey-impacts-modal/training-survey-impacts-modal.component';

@Component({
  selector: 'app-training-surveys',
  standalone: true,
  imports: [
    CommonModule,
    SurveyScopeListComponent,
    TrainingSurveyImpactsModalComponent,
  ],
  templateUrl: './training-surveys.component.html',
})
export class TrainingSurveysComponent {
  private readonly service = inject(TrainingService);

  trainingId = input.required<number>();

  surveys = signal<TrainingSurvey[]>([]);
  loading = signal(false);

  scopeItems = computed<SurveyScopeItem[]>(() =>
    this.surveys().map((s) => ({
      id: s.id,
      name: s.surveyTitle,
      aimedAt: s.aimedAt ?? 'EMPLOYEES',
    })),
  );

  impactSurvey = signal<TrainingSurvey | null>(null);

  constructor() {
    effect(() => {
      this.load(this.trainingId());
    });
  }

  load(id: number) {
    this.loading.set(true);
    this.service.getDetail(id).subscribe({
      next: (res) => {
        this.surveys.set(res.data?.surveys ?? []);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  attach(e: AttachSurveyEvent) {
    this.service
      .attachSurvey(this.trainingId(), {
        surveyId: e.surveyId,
        aimedAt: e.aimedAt,
      })
      .subscribe((res) => {
        if (res.success) this.load(this.trainingId());
      });
  }

  detach(trainingSurveyId: number) {
    if (!confirm('¿Remover encuesta de esta capacitación?')) return;
    this.service
      .detachSurvey(this.trainingId(), trainingSurveyId)
      .subscribe((res) => {
        if (res.success) this.load(this.trainingId());
      });
  }

  openImpacts(item: SurveyScopeItem) {
    const full = this.surveys().find((s) => s.id === item.id) ?? null;
    this.impactSurvey.set(full);
  }

  closeImpacts() {
    this.impactSurvey.set(null);
  }

  onImpactsSaved() {
    this.impactSurvey.set(null);
    this.load(this.trainingId());
  }
}
