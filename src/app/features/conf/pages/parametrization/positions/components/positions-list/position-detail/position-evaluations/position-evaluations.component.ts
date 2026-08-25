import { CommonModule } from "@angular/common";
import { Component, effect, inject, input, signal } from "@angular/core";
import { Position } from "@/app/core/models/assessment/position.model";
import {
  EvaluationType,
  PositionEvaluation,
  Survey,
} from "@/app/core/models/assessment/survey.model";
import { PositionEvaluationService } from "@/app/core/services/assessment/position-evaluation.service";
import { SurveyService } from "@/app/core/services/assessment/survey.service";
import { SearchSelectContextFactory } from "@/app/shared/components/search-select/on-search-select.interface";
import { ContextSearchSelectComponent } from "@/app/shared/components/context-search-select/context-search-select.component";
import { TrashIconComponent } from "@/app/shared/components/edit-icon/trash-icon.component";

interface EvaluationTypeSection {
  type: EvaluationType;
  label: string;
  description: string;
  ctx: SearchSelectContextFactory<Survey>;
}

@Component({
  selector: "app-position-evaluations",
  standalone: true,
  imports: [CommonModule, ContextSearchSelectComponent, TrashIconComponent],
  templateUrl: "./position-evaluations.component.html",
})
export class PositionEvaluationsComponent {
  private readonly service = inject(PositionEvaluationService);
  private readonly surveyService = inject(SurveyService);

  position = input.required<Position>();

  evaluationsByType = signal<
    Partial<Record<EvaluationType, PositionEvaluation>>
  >({});

  sections: EvaluationTypeSection[] = [
    {
      type: "SELF",
      label: "Autoevaluación",
      description: "El empleado se evalúa a sí mismo.",
      ctx: this.surveyService.newSearchSelectContext((survey) =>
        this.attachSurvey("SELF", survey),
      ),
    },
    {
      type: "PEER",
      label: "Evaluación de pares",
      description: "Empleados del mismo cargo se evalúan entre sí.",
      ctx: this.surveyService.newSearchSelectContext((survey) =>
        this.attachSurvey("PEER", survey),
      ),
    },
    {
      type: "SUPERIOR",
      label: "Evaluación de jefes",
      description: "Los empleados evalúan a su jefe directo.",
      ctx: this.surveyService.newSearchSelectContext((survey) =>
        this.attachSurvey("SUPERIOR", survey),
      ),
    },
    {
      type: "HIERARCHICAL",
      label: "Evaluación jerárquica",
      description: "El jefe evalúa a sus empleados.",
      ctx: this.surveyService.newSearchSelectContext((survey) =>
        this.attachSurvey("HIERARCHICAL", survey),
      ),
    },
  ];

  constructor() {
    effect(() => {
      const position = this.position();
      if (position) this.load(position.id);
    });
  }

  private load(positionId: number) {
    this.service.findByPosition(positionId).subscribe({
      next: (res) => {
        const map: Partial<Record<EvaluationType, PositionEvaluation>> = {};
        (res.data ?? []).forEach((pe) => {
          map[pe.type] = pe;
        });
        this.evaluationsByType.set(map);
      },
    });
  }

  surveysFor(type: EvaluationType) {
    return this.evaluationsByType()[type]?.surveys ?? [];
  }

  attachSurvey(type: EvaluationType, survey: Survey) {
    const section = this.sections.find((s) => s.type === type)!;
    this.service
      .addSurvey({ positionId: this.position().id, type, surveyId: survey.id })
      .subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.evaluationsByType.update((m) => ({
              ...m,
              [type]: res.data,
            }));
          }
          section.ctx.clear();
        },
      });
  }

  removeSurvey(type: EvaluationType, positionEvaluationSurveyId: number) {
    this.service.removeSurvey(positionEvaluationSurveyId).subscribe({
      next: () => {
        this.evaluationsByType.update((m) => {
          const current = m[type];
          if (!current) return m;
          return {
            ...m,
            [type]: {
              ...current,
              surveys: (current.surveys ?? []).filter(
                (s) => s.id !== positionEvaluationSurveyId,
              ),
            },
          };
        });
      },
    });
  }
}
