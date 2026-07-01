import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  effect,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { Assessment } from '@/app/core/models/assessment/assessment.model';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  ChangeCompetencyScore,
  CompetencyScoreCardComponent,
} from './competency-score-card/competency-score-card.component';
import { Router } from '@angular/router';
import { AssessmentService } from '@/app/core/services/assessment/assessment.service';
import { ReportScoreChange } from './assessment-component-report/assessment-component-report.component';
import {
  SurveyAnswerCardComponent,
  SurveyAnswerScoreChange,
} from './survey-answer-card/survey-answer-card.component';
import { LoadingSpinnerComponent } from '@/app/shared/components/loading-spinner/loading-spinner.component';

export interface CompetencyAssessmentDto {
  [competencyId: number]: number | null;
}

export interface ComponentAssessmentDto {
  [reportId: number]: {
    score: number;
    observations?: string;
  };
}

export interface SurveyAssessmentDto {
  [answerId: number]: number;
}

export interface EditAssesmentDto {
  id: number;
  competencyScores: CompetencyAssessmentDto;
  componentScores: ComponentAssessmentDto;
  surveyScores: SurveyAssessmentDto;
  observations?: string;
  agreements?: string;
  aspectsToImprove?: string;
}

@Component({
  selector: 'app-edit-assessment-modal',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CompetencyScoreCardComponent,
    SurveyAnswerCardComponent,
    LoadingSpinnerComponent,
  ],
  templateUrl: './edit-assessment-modal.component.html',
  styleUrl: './edit-assessment-modal.component.scss',
})
export class EditAssessmentModalComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly assessmentService = inject(AssessmentService);
  private readonly fb = inject(FormBuilder);
  id = input.required<number>();
  assessment = signal<Assessment | null>(null);
  isLoading = signal(true);
  assessmentForm: FormGroup;
  competencyScores = signal<CompetencyAssessmentDto>({});
  competencyWeightedScore = signal<CompetencyAssessmentDto>({});
  componentWeightedScore = signal<ComponentAssessmentDto>({});
  surveyScores = signal<SurveyAssessmentDto>({});

  surveyGroups = computed(() => {
    const answers = this.assessment()?.surveyAnswers ?? [];
    const groups = new Map<
      number,
      { surveyId: number; surveyName: string; answers: typeof answers }
    >();
    for (const answer of answers) {
      const group = groups.get(answer.surveyId);
      if (group) {
        group.answers.push(answer);
      } else {
        groups.set(answer.surveyId, {
          surveyId: answer.surveyId,
          surveyName: answer.surveyName,
          answers: [answer],
        });
      }
    }
    return Array.from(groups.values());
  });

  private calculateMatrixScore(scores: CompetencyAssessmentDto) {
    return (
      Object.values(scores).reduce((a, b) => a + (b ?? 0), 0) /
      (Object.keys(scores).length || 1)
    );
  }

  private calculateComponentScore(scores: ComponentAssessmentDto) {
    return (
      Object.values(scores).reduce((a, b) => a + (b?.score ?? 0), 0) /
      (Object.keys(scores).length || 1)
    );
  }

  private calculateSurveyScore(): number {
    const answers = this.assessment()?.surveyAnswers ?? [];
    if (!answers.length) return 0;
    const scores = this.surveyScores();
    const total = answers.reduce((sum, answer) => {
      const score = scores[answer.id] ?? answer.score;
      const min = answer.question?.minValue ?? 0;
      const max = answer.question?.maxValue ?? 0;
      const range = max - min || 1;
      const pct = ((score - min) / range) * 100;
      return sum + pct;
    }, 0);
    return total / answers.length;
  }

  matrixTotalScore = computed(() => {
    const scores = this.competencyWeightedScore();
    const componentScore = this.componentWeightedScore();
    // ensure recomputation when survey scores change
    this.surveyScores();

    const parts: number[] = [];
    if (Object.keys(scores).length)
      parts.push(this.calculateMatrixScore(scores));
    if (Object.keys(componentScore).length)
      parts.push(this.calculateComponentScore(componentScore));
    if (this.assessment()?.surveyAnswers?.length)
      parts.push(this.calculateSurveyScore());

    if (!parts.length) return 0;
    return parts.reduce((a, b) => a + b, 0) / parts.length;
  });

  constructor() {
    this.assessmentForm = this.fb.group({
      observations: [''],
      agreements: [''],
      aspectsToImprove: [''],
    });

    effect(() => {
      const a = this.assessment();
      if (!a) return;
      this.competencyWeightedScore.set(
        a.competencyScores?.reduce<CompetencyAssessmentDto>((acc, score) => {
          acc[score.competency?.id ?? 0] = score.weightedScore;
          return acc;
        }, {}) ?? {},
      );
      this.componentWeightedScore.set(
        a.components?.reduce<ComponentAssessmentDto>((acc, reports) => {
          acc[reports.id] = {
            score: reports.score,
            observations: reports.observations,
          };
          return acc;
        }, {}) ?? {},
      );
    });
  }

  ngOnInit(): void {
    this.isLoading.set(true);
    this.assessmentService.findById(this.id()).subscribe((res) => {
      this.isLoading.set(false);
      const a = res.data;
      this.assessment.set(a);
      const { agreements, observations, aspectsToImprove, competencyScores } =
        a;
      this.assessmentForm.patchValue({
        agreements,
        observations,
        aspectsToImprove,
      });
      this.competencyScores.set(
        (competencyScores ?? []).reduce((prev, curr) => {
          prev[curr.competency?.id ?? 0] = curr.score;
          return prev;
        }, {} as CompetencyAssessmentDto),
      );
      this.surveyScores.set(
        (a.surveyAnswers ?? []).reduce((prev, curr) => {
          prev[curr.id] = curr.score;
          return prev;
        }, {} as SurveyAssessmentDto),
      );
    });
  }

  getAssessmentCompetencyScores() {
    return this.assessment()?.competencyScores ?? [];
  }

  get averageDescription(): string {
    const score = this.matrixTotalScore();
    if (score >= 90) return 'Excepcional';
    if (score >= 75) return 'Destacado';
    if (score >= 60) return 'Aceptable';
    return 'Deficiente';
  }

  get averageBadgeClass(): string {
    const score = this.matrixTotalScore();
    if (score >= 90) return 'bg-green-600';
    if (score >= 75) return 'bg-primary';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-600';
  }

  onSubmit(): void {
    if (this.assessmentForm.valid) {
      const formValue = this.assessmentForm.value;
      const payload: EditAssesmentDto = {
        competencyScores: this.competencyScores(),
        componentScores: this.componentWeightedScore(),
        surveyScores: this.surveyScores(),
        observations: formValue.observations,
        agreements: formValue.agreements,
        aspectsToImprove: formValue.aspectsToImprove,
        id: this.assessment()!.id,
      };
      this.assessmentService.updateAssessment(payload).subscribe({
        // next: () => this.router.navigate(["/assessment/dashboard"]),
        error: (err) => console.error(err),
      });
    } else {
      this.assessmentForm.markAllAsTouched();
    }
  }

  onChangeCompetencyScore(change: ChangeCompetencyScore) {
    this.competencyScores.set({
      ...this.competencyScores(),
      [change.id]: change.score,
    });
    this.competencyWeightedScore.set({
      ...this.competencyWeightedScore(),
      [change.id]: change.weightedScore,
    });
  }

  onChangeComponentScore(change: ReportScoreChange) {
    const { observations, reportId, score } = change;
    this.componentWeightedScore.set({
      ...this.componentWeightedScore(),
      [reportId]: {
        score: score,
        observations: observations,
      },
    });
  }

  onChangeSurveyScore(change: SurveyAnswerScoreChange) {
    this.surveyScores.set({
      ...this.surveyScores(),
      [change.answerId]: change.score,
    });
  }

  get evaluatorFullName(): string {
    const evaluator = this.assessment()?.evaluator;
    return `${evaluator?.name ?? ''} ${evaluator?.lastName ?? ''}`;
  }

  get evaluateeFullName(): string {
    const evaluatee = this.assessment()?.evaluatee;
    return `${evaluatee?.name ?? ''} ${evaluatee?.lastName ?? ''}`;
  }

  get evaluationPeriodRange(): string {
    const period = this.assessment()?.period;
    if (!period) return '';
    const startDate = new Date(period.startDate);
    const endDate = new Date(period.endDate);
    return `${startDate.getDate()} - ${endDate.getDate()}`;
  }

  get evaluationDate(): string {
    const createdAt = this.assessment()?.createdAt;
    if (!createdAt) return '';
    return new Date(createdAt).toLocaleDateString();
  }

  goBack(): void {
    this.router.navigate(['/assessment/dashboard']);
  }
}
