import { CommonModule } from "@angular/common";
import {
  Component,
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
import { CompetencyScore } from "../../../../../../core/models/assessment/competency-score.model";

export interface ChangeCompetencyScore {
  id: number;
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

  form: FormGroup;

  get competencyName() {
    return this.competencyScore().competency?.name ?? "Competencia Técnica";
  }

  get competencyDescription() {
    return (
      this.competencyScore().competency?.description ??
      "Dominio de conocimientos y habilidades"
    );
  }

  constructor() {

    this.form = new FormGroup({
      score: new FormControl(0, {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.min(0),
          Validators.max(100),
        ],
      }),
    });
  }
  ngOnInit(): void {
    this.form.patchValue({ score: this.competencyScore().score });
    this.form.get('score')?.valueChanges.subscribe(value => {
      this.scoreChange.emit({
        id: this.competencyScore().competency?.id ?? 0,
        score: Number(value)
      });
    });
  }
}
