import { CommonModule } from "@angular/common";
import {
  Component,
  computed,
  effect,
  EventEmitter,
  input,
  Input,
  OnChanges,
  OnInit,
  Output,
  signal,
  SimpleChanges,
} from "@angular/core";
import { Assessment } from "../../../../../core/models/assessment/assessment.model";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import {
  ChangeCompetencyScore,
  CompetencyScoreCardComponent,
} from "./competency-score-card/competency-score-card.component";

export interface CompetencyAssessmentDto {
  [competencyId: number]: number | null; // competencyId: score
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
export class EditAssessmentModalComponent implements OnChanges {
  @Input() isOpen = false;
  assessment = input.required<Assessment>();

  @Output() closeModal = new EventEmitter<void>();
  @Output() saveAssessment = new EventEmitter<EditAssesmentDto>();

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

  constructor(private fb: FormBuilder) {
    this.assessmentForm = this.fb.group({
      observations: [""],
      agreements: [""],
      aspectsToImprove: [""],
    });

    effect(() => {
      this.competencyWeightedScore.set(
        this.assessment().competencyScores?.reduce<CompetencyAssessmentDto>(
          (acc, score) => {
            acc[score.competency?.id ?? 0] = score.weightedScore;
            return acc;
          },
          {},
        ) ?? {},
      );
    });
  }

  getAssessmentCompetencyScores() {
    return this.assessment().competencyScores ?? [];
  }

  get averageDescription(): string {
    const score = this.matrixTotalScore();
    if (score >= 90) return "Excepcional";
    if (score >= 75) return "Destacado";
    if (score >= 60) return "Aceptable";
    return "Deficiente";
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Reset the form when the modal is closed
    if (changes["isOpen"] && !changes["isOpen"].currentValue) {
      this.assessmentForm.reset();
      this.competencyScores.set({});
    }

    if (changes["assessment"]) {
      const { agreements, observations, aspectsToImprove, competencyScores } =
        this.assessment();
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
  }

  onClose(): void {
    this.closeModal.emit();
  }

  onSubmit(): void {
    if (this.assessmentForm.valid) {
      const formValue = this.assessmentForm.value;

      const payload: EditAssesmentDto = {
        competencyScores: this.competencyScores(),
        observations: formValue.observations,
        agreements: formValue.agreements,
        aspectsToImprove: formValue.aspectsToImprove,
        id: this.assessment().id,
      };

      this.saveAssessment.emit(payload);
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
    const evaluator = this.assessment().evaluator;
    return `${evaluator?.name ?? ""} ${evaluator?.lastName ?? ""}`;
  }

  get evaluateeFullName(): string {
    const evaluatee = this.assessment().evaluatee;
    return `${evaluatee?.name ?? ""} ${evaluatee?.lastName ?? ""}`;
  }

  get evaluationPeriodRange(): string {
    const period = this.assessment().period;
    if (!period) return "";
    const startDate = new Date(period.startDate);
    const endDate = new Date(period.endDate);
    return `${startDate.getDate()} - ${endDate.getDate()}`;
  }

  get evaluationDate(): string {
    return new Date(this.assessment().createdAt).getDate().toLocaleString();
  }

  onCancel(): void {
    this.closeModal.emit();
  }
}
