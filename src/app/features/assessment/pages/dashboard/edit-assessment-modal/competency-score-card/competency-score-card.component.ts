import { CommonModule } from "@angular/common";
import {
  Component,
  effect,
  EventEmitter,
  input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from "@angular/core";
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { CompetencyScore } from "@/app/core/models/assessment/competency-score.model";

export interface ChangeCompetencyScore {
  id: number;
  weightedScore: number;
  score: number;
}

@Component({
  selector: "app-competency-score-card",
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: "./competency-score-card.component.html",
  styleUrl: "./competency-score-card.component.scss",
})
export class CompetencyScoreCardComponent implements OnInit {
  competencyScore = input.required<CompetencyScore>();

  @Output() scoreChange = new EventEmitter<ChangeCompetencyScore>();

  get competencyName() {
    return this.competencyScore().competency?.name ?? "Competencia Técnica";
  }

  get competencyDescription() {
    return (
      this.competencyScore().competency?.description ??
      "Dominio de conocimientos y habilidades"
    );
  }

  form = new FormGroup({
    score: new FormControl(0, {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  constructor() {
    effect(() => {
      const { minScore, maxScore } = this.competencyScore();

      const scoreControl = this.form.controls.score;

      scoreControl.setValidators([
        Validators.required,
        Validators.min(minScore ?? 0),
        Validators.max(maxScore ?? 5),
      ]);

      scoreControl.updateValueAndValidity();
    });
  }
  ngOnInit(): void {
    this.form.patchValue({ score: this.competencyScore().score });

    this.form.get("score")?.valueChanges.subscribe((value) => {
      const weightedScore =
        ((Number(value) - this.competencyScore().minScore) /
          (this.competencyScore().maxScore - this.competencyScore().minScore)) *
        100;
      this.scoreChange.emit({
        id: this.competencyScore().competency?.id ?? 0,
        score: Number(value),
        weightedScore,
      });
    });
  }
}
