import { SurveyQuestion } from "@/app/core/models/assessment/survey.model";
import {
  CreateSurveyQuestionDto,
  SurveyQuestionService,
} from "@/app/core/services/assessment/survey.service";
import { CommonModule } from "@angular/common";
import {
  Component,
  effect,
  inject,
  input,
  output,
  signal,
} from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";

@Component({
  selector: "app-survey-question-modal",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: "./survey-question-modal.component.html",
})
export class SurveyQuestionModalComponent {
  private fb = inject(FormBuilder);
  private service = inject(SurveyQuestionService);

  surveyId = input.required<number>();
  selectedQuestion = input<SurveyQuestion | null>(null);
  isOpen = input(false);
  nextDisplayOrder = input(1);

  onSubmit = output<SurveyQuestion>();
  onClose = output<void>();
  submitting = signal(false);

  questionForm = this.fb.group({
    description: ["", Validators.required],
    minValue: [0, [Validators.required, Validators.min(0)]],
    maxValue: [5, [Validators.required]],
    displayOrder: [1, [Validators.required, Validators.min(1)]],
  });

  constructor() {
    effect(() => {
      const q = this.selectedQuestion();
      if (q) {
        this.questionForm.patchValue({
          description: q.description,
          minValue: q.minValue,
          maxValue: q.maxValue,
          displayOrder: q.displayOrder,
        });
      } else {
        this.questionForm.reset({
          minValue: 0,
          maxValue: 5,
          displayOrder: this.nextDisplayOrder(),
        });
      }
    });
  }

  closeModal() {
    this.onClose.emit();
  }

  submitQuestion() {
    if (this.questionForm.invalid) return;
    this.submitting.set(true);

    const dto: CreateSurveyQuestionDto = {
      surveyId: this.surveyId(),
      description: this.questionForm.value.description!,
      minValue: this.questionForm.value.minValue ?? 0,
      maxValue: this.questionForm.value.maxValue!,
      displayOrder: this.questionForm.value.displayOrder!,
    };

    const req$ = this.selectedQuestion()
      ? this.service.update(this.selectedQuestion()!.id, dto)
      : this.service.create(dto);

    req$.subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.onSubmit.emit(res.data);
          this.closeModal();
        }
        this.submitting.set(false);
      },
      error: () => this.submitting.set(false),
    });
  }
}
