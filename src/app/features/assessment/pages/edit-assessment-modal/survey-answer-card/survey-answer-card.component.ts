import { Component, effect, inject, input, OnInit, output } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from "@angular/forms";
import { AssessmentSurveyAnswer } from "@/app/core/models/assessment/assessment.model";
import { ScoreSliderComponent } from "../score-slider/score-slider.component";
import { AnswerCommentsComponent } from "./answer-comments/answer-comments.component";
import { distinctUntilChanged, filter } from "rxjs";

export interface SurveyAnswerScoreChange {
  answerId: number;
  score: number;
}

@Component({
  selector: "app-survey-answer-card",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ScoreSliderComponent,
    AnswerCommentsComponent,
  ],
  templateUrl: "./survey-answer-card.component.html",
})
export class SurveyAnswerCardComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  answer = input.required<AssessmentSurveyAnswer>();
  isDisabled = input.required<boolean>();
  canComment = input<boolean>(false);
  canReply = input<boolean>(false);

  onChange = output<SurveyAnswerScoreChange>();

  scoreControl = new FormControl(0);
  form = this.fb.group({ score: this.scoreControl });

  constructor() {
    effect(() => {
      const a = this.answer();
      this.scoreControl.setValue(a.score);
      if (this.isDisabled()) {
        this.form.disable();
      }
      if (a.question) {
        this.scoreControl.addValidators([
          Validators.max(a.question.maxValue),
          Validators.min(a.question.minValue),
        ]);
        this.scoreControl.updateValueAndValidity();
      }
    });
  }

  ngOnInit(): void {
    this.form.valueChanges
      .pipe(
        filter(() => this.form.valid),
        distinctUntilChanged(),
      )
      .subscribe((values) => {
        this.onChange.emit({
          answerId: this.answer().id,
          score: values.score || 0,
        });
      });
  }
}
