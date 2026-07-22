import { CommonModule } from '@angular/common';
import { Component, effect, inject, input, signal } from '@angular/core';
import { TrainingService } from '@/app/core/services/training/training.service';
import { SurveyService } from '@/app/core/services/assessment/survey.service';
import {
  SurveyAudience,
  TrainingSurvey,
} from '@/app/core/models/training/training.models';
import { FormsModule } from '@angular/forms';
import { SearchSelectComponent } from '@/app/shared/components/search-select/search-select.component';
import { SearchSelectOption } from '@/app/shared/components/search-select/on-search-select.interface';
import { TrainingSurveyImpactsModalComponent } from '../training-survey-impacts-modal/training-survey-impacts-modal.component';

@Component({
  selector: 'app-training-surveys',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SearchSelectComponent,
    TrainingSurveyImpactsModalComponent,
  ],
  templateUrl: './training-surveys.component.html',
})
export class TrainingSurveysComponent {
  private readonly service = inject(TrainingService);
  private readonly surveyService = inject(SurveyService);

  trainingId = input.required<number>();

  readonly audiences: { value: SurveyAudience; label: string }[] = [
    { value: 'EMPLOYEES', label: 'A los empleados' },
    { value: 'TRAINING', label: 'A la capacitación' },
  ];

  surveys = signal<TrainingSurvey[]>([]);
  loading = signal(false);
  selectedSurveyId = signal<number | null>(null);
  aimedAt = signal<SurveyAudience>('EMPLOYEES');

  // Survey live-search for the attach picker
  surveyContext = this.surveyService.newSearchSelectContext(
    (s) => this.selectedSurveyId.set(s.id),
    { maxItems: 1, label: 'Encuesta', placeholder: 'Buscar encuesta…' },
    () => this.selectedSurveyId.set(null),
  );

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

  searchSurvey(term: string) {
    this.surveyContext.search(term);
  }

  selectSurvey(o: SearchSelectOption) {
    this.surveyContext.select(o);
  }

  removeSelected(o: SearchSelectOption) {
    this.surveyContext.remove(o);
  }

  attachSurvey() {
    const surveyId = this.selectedSurveyId();
    if (!surveyId) return;
    this.service
      .attachSurvey(this.trainingId(), { surveyId, aimedAt: this.aimedAt() })
      .subscribe((res) => {
        if (res.success) {
          this.surveyContext.clear();
          this.selectedSurveyId.set(null);
          this.aimedAt.set('EMPLOYEES');
          this.load(this.trainingId());
        }
      });
  }

  audienceLabel(a?: SurveyAudience): string {
    return this.audiences.find((x) => x.value === a)?.label ?? '';
  }

  detachSurvey(trainingSurveyId: number) {
    if (!confirm('¿Remover encuesta de esta capacitación?')) return;
    this.service
      .detachSurvey(this.trainingId(), trainingSurveyId)
      .subscribe((res) => {
        if (res.success) this.load(this.trainingId());
      });
  }

  // ── Impact factors modal ──────────────────────────────────────────────────

  impactSurvey = signal<TrainingSurvey | null>(null);

  openImpacts(survey: TrainingSurvey) {
    this.impactSurvey.set(survey);
  }

  closeImpacts() {
    this.impactSurvey.set(null);
  }

  onImpactsSaved() {
    this.impactSurvey.set(null);
    this.load(this.trainingId());
  }
}
