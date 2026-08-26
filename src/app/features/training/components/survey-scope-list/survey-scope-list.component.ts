import { CommonModule } from '@angular/common';
import { Component, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SurveyService } from '@/app/core/services/assessment/survey.service';
import { SurveyAudience } from '@/app/core/models/training/training.models';
import { SearchSelectComponent } from '@/app/shared/components/search-select/search-select.component';
import { SearchSelectOption } from '@/app/shared/components/search-select/on-search-select.interface';

/** Common shape a survey row must expose to be listed here. */
export interface SurveyScopeItem {
  id: number;
  name: string;
  aimedAt: SurveyAudience;
}

export interface AttachSurveyEvent {
  surveyId: number;
  aimedAt: SurveyAudience;
  /** Postgres interval; resurfaces the survey in performance assessments. */
  feedbackAfter?: string | null;
}

/**
 * Presentational, reusable survey manager: search + attach a survey with a
 * scope, list attached surveys, detach, and (optionally) configure impacts.
 * Persistence is delegated to the parent via outputs.
 */
@Component({
  selector: 'app-survey-scope-list',
  standalone: true,
  imports: [CommonModule, FormsModule, SearchSelectComponent],
  templateUrl: './survey-scope-list.component.html',
})
export class SurveyScopeListComponent {
  private readonly surveyService = inject(SurveyService);

  surveys = input.required<SurveyScopeItem[]>();
  /** Show a "Configurar Impactos" action per survey (training only). */
  canConfigure = input<boolean>(false);

  onAttach = output<AttachSurveyEvent>();
  onDetach = output<number>();
  onConfigure = output<SurveyScopeItem>();

  readonly audiences: { value: SurveyAudience; label: string }[] = [
    { value: 'EMPLOYEES', label: 'A los empleados' },
    { value: 'TRAINING', label: 'A la capacitación' },
  ];

  selectedSurveyId = signal<number | null>(null);
  aimedAt = signal<SurveyAudience>('EMPLOYEES');
  /** Months after the training to re-ask this survey in assessments (0 = never). */
  feedbackAfterMonths = signal<number>(0);

  surveyContext = this.surveyService.newSearchSelectContext(
    (s) => this.selectedSurveyId.set(s.id),
    { maxItems: 1, label: 'Encuesta', placeholder: 'Buscar encuesta…' },
    () => this.selectedSurveyId.set(null),
  );

  searchSurvey(term: string) {
    this.surveyContext.search(term);
  }
  selectSurvey(o: SearchSelectOption) {
    this.surveyContext.select(o);
  }
  removeSelected(o: SearchSelectOption) {
    this.surveyContext.remove(o);
  }

  audienceLabel(a: SurveyAudience): string {
    return this.audiences.find((x) => x.value === a)?.label ?? '';
  }

  attach() {
    const surveyId = this.selectedSurveyId();
    if (!surveyId) return;
    const months = this.feedbackAfterMonths();
    this.onAttach.emit({
      surveyId,
      aimedAt: this.aimedAt(),
      feedbackAfter: months > 0 ? `${months} months` : null,
    });
    this.surveyContext.clear();
    this.selectedSurveyId.set(null);
    this.aimedAt.set('EMPLOYEES');
    this.feedbackAfterMonths.set(0);
  }
}
