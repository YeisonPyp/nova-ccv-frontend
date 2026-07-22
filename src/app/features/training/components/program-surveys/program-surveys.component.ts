import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { TrainingProgramService } from '@/app/core/services/training/training-program.service';
import { ProgramSurvey } from '@/app/core/models/training/training-program.models';
import {
  AttachSurveyEvent,
  SurveyScopeItem,
  SurveyScopeListComponent,
} from '../survey-scope-list/survey-scope-list.component';

@Component({
  selector: 'app-program-surveys',
  standalone: true,
  imports: [SurveyScopeListComponent],
  template: `<app-survey-scope-list
    [surveys]="scopeItems()"
    (onAttach)="attach($event)"
    (onDetach)="detach($event)"
  />`,
})
export class ProgramSurveysComponent {
  private readonly service = inject(TrainingProgramService);

  programId = input.required<number>();

  surveys = signal<ProgramSurvey[]>([]);

  scopeItems = computed<SurveyScopeItem[]>(() =>
    this.surveys().map((s) => ({
      id: s.id,
      name: s.surveyName,
      aimedAt: s.aimedAt,
    })),
  );

  constructor() {
    effect(() => {
      this.load(this.programId());
    });
  }

  load(id: number) {
    this.service.getDetail(id).subscribe((res) => {
      this.surveys.set(res.data?.surveys ?? []);
    });
  }

  attach(e: AttachSurveyEvent) {
    this.service
      .attachSurvey(this.programId(), {
        surveyId: e.surveyId,
        aimedAt: e.aimedAt,
      })
      .subscribe((res) => {
        if (res.success) this.load(this.programId());
      });
  }

  detach(programSurveyId: number) {
    if (!confirm('¿Remover encuesta del programa?')) return;
    this.service
      .detachSurvey(this.programId(), programSurveyId)
      .subscribe((res) => {
        if (res.success) this.load(this.programId());
      });
  }
}
