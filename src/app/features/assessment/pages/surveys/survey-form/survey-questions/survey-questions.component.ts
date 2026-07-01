import { SurveyQuestion } from '@/app/core/models/assessment/survey.model';
import { SurveyQuestionService } from '@/app/core/services/assessment/survey.service';
import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { SurveyQuestionModalComponent } from './survey-question-modal/survey-question-modal.component';
import { EditIconComponent } from '@/app/shared/components/edit-icon/edit-icon.component';
import { TrashIconComponent } from '@/app/shared/components/edit-icon/trash-icon.component';

@Component({
  selector: 'app-survey-questions',
  standalone: true,
  imports: [
    CommonModule,
    SurveyQuestionModalComponent,
    EditIconComponent,
    TrashIconComponent,
  ],
  templateUrl: './survey-questions.component.html',
})
export class SurveyQuestionsComponent {
  private readonly service = inject(SurveyQuestionService);

  surveyId = input.required<number>();
  questions = input.required<SurveyQuestion[]>();

  onSave = output<SurveyQuestion>();
  onDelete = output<SurveyQuestion>();

  isModalOpen = signal(false);
  selectedQuestion = signal<SurveyQuestion | null>(null);

  sortedQuestions = computed(() =>
    [...this.questions()].sort((a, b) => a.displayOrder - b.displayOrder),
  );

  nextDisplayOrder = computed(
    () =>
      this.questions().reduce((max, q) => Math.max(max, q.displayOrder), 0) + 1,
  );

  openModal(q: SurveyQuestion | null) {
    this.selectedQuestion.set(q);
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
    this.selectedQuestion.set(null);
  }

  saveQuestion(q: SurveyQuestion) {
    this.onSave.emit(q);
  }

  deleteQuestion(q: SurveyQuestion) {
    this.service.delete(q.id).subscribe((res) => {
      if (res.success) this.onDelete.emit(q);
    });
  }
}
