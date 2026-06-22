import { CommonModule } from "@angular/common";
import {
  Component,
  effect,
  EventEmitter,
  input,
  OnInit,
  Output,
  signal,
} from "@angular/core";
import { CompetencyScore } from "@/app/core/models/assessment/competency-score.model";
import { ScoreSliderComponent } from "../score-slider/score-slider.component";
import { FormControl } from "@angular/forms";

export interface ChangeCompetencyScore {
  id: number;
  weightedScore: number;
  score: number;
}

@Component({
  selector: "app-competency-score-card",
  standalone: true,
  imports: [CommonModule, ScoreSliderComponent],
  templateUrl: "./competency-score-card.component.html",
  styleUrl: "./competency-score-card.component.scss",
})
export class CompetencyScoreCardComponent implements OnInit {
  competencyScore = input.required<CompetencyScore>();

  @Output() scoreChange = new EventEmitter<ChangeCompetencyScore>();
  min = signal(0);
  max = signal(5);
  currentScore = signal(0);
  scoreControl = new FormControl(0);

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
    effect(() => {
      this.currentScore.set(this.competencyScore().score);
    });
  }
  ngOnInit(): void {
    this.scoreControl.valueChanges.subscribe((value) => {
      this.onScoreChange(value || 0);
    });
  }

  onScoreChange(value: number): void {
    this.currentScore.set(value);
    const { minScore, maxScore } = this.competencyScore();
    const weightedScore = ((value - minScore) / (maxScore - minScore)) * 100;
    this.scoreChange.emit({
      id: this.competencyScore().competency?.id ?? 0,
      score: value,
      weightedScore,
    });
  }
}
