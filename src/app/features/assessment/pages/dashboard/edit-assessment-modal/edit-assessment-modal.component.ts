import { CommonModule } from "@angular/common";
import {
  Component,
  computed,
  effect,
  inject,
  OnInit,
  signal,
} from "@angular/core";
import { Assessment } from "@/app/core/models/assessment/assessment.model";
import { FormBuilder, FormGroup, ReactiveFormsModule } from "@angular/forms";
import {
  ChangeCompetencyScore,
  CompetencyScoreCardComponent,
} from "./competency-score-card/competency-score-card.component";
import { Router } from "@angular/router";
import { AssessmentService } from "@/app/core/services/assessment/assessment.service";

export interface CompetencyAssessmentDto {
  [competencyId: number]: number | null;
}

export interface EditAssesmentDto {
  id: number;
  competencyScores: CompetencyAssessmentDto;
  observations?: string;
  agreements?: string;
  aspectsToImprove?: string;
}

@Component({
  selector: "app-edit-assessment-modal",
  imports: [CommonModule, ReactiveFormsModule, CompetencyScoreCardComponent],
  templateUrl: "./edit-assessment-modal.component.html",
  styleUrl: "./edit-assessment-modal.component.scss",
})
export class EditAssessmentModalComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly assessmentService = inject(AssessmentService);
  private readonly fb = inject(FormBuilder);

  assessment = signal<Assessment | null>(null);
  assessmentForm: FormGroup;
  competencyScores = signal<CompetencyAssessmentDto>({});
  competencyWeightedScore = signal<CompetencyAssessmentDto>({});

  matrixTotalScore = computed(() => {
    const scores = this.competencyWeightedScore();
    return (
      Object.values(scores).reduce((a, b) => a + (b ?? 0), 0) /
      (Object.keys(scores).length || 1)
    );
  });

  constructor() {
    this.assessmentForm = this.fb.group({
      observations: [""],
      agreements: [""],
      aspectsToImprove: [""],
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
    });
  }

  ngOnInit(): void {
    const a = history.state?.assessment as Assessment | undefined;
    if (!a) {
      this.router.navigate(["/assessment/dashboard"]);
      return;
    }
    this.assessment.set(a);
    const { agreements, observations, aspectsToImprove, competencyScores } = a;
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
  }

  getAssessmentCompetencyScores() {
    return this.assessment()?.competencyScores ?? [];
  }

  get averageDescription(): string {
    const score = this.matrixTotalScore();
    if (score >= 90) return "Excepcional";
    if (score >= 75) return "Destacado";
    if (score >= 60) return "Aceptable";
    return "Deficiente";
  }

  get averageBadgeClass(): string {
    const score = this.matrixTotalScore();
    if (score >= 90) return "bg-green-600";
    if (score >= 75) return "bg-primary";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-600";
  }

  onSubmit(): void {
    if (this.assessmentForm.valid) {
      const formValue = this.assessmentForm.value;
      const payload: EditAssesmentDto = {
        competencyScores: this.competencyScores(),
        observations: formValue.observations,
        agreements: formValue.agreements,
        aspectsToImprove: formValue.aspectsToImprove,
        id: this.assessment()!.id,
      };
      this.assessmentService.updateAssessment(payload).subscribe({
        next: () => this.router.navigate(["/assessment/dashboard"]),
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

  get evaluatorFullName(): string {
    const evaluator = this.assessment()?.evaluator;
    return `${evaluator?.name ?? ""} ${evaluator?.lastName ?? ""}`;
  }

  get evaluateeFullName(): string {
    const evaluatee = this.assessment()?.evaluatee;
    return `${evaluatee?.name ?? ""} ${evaluatee?.lastName ?? ""}`;
  }

  get evaluationPeriodRange(): string {
    const period = this.assessment()?.period;
    if (!period) return "";
    const startDate = new Date(period.startDate);
    const endDate = new Date(period.endDate);
    return `${startDate.getDate()} - ${endDate.getDate()}`;
  }

  get evaluationDate(): string {
    const createdAt = this.assessment()?.createdAt;
    if (!createdAt) return "";
    return new Date(createdAt).toLocaleDateString();
  }

  goBack(): void {
    this.router.navigate(["/assessment/dashboard"]);
  }
}
