import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  Survey,
  SurveyQuestion,
} from '@/app/core/models/assessment/survey.model';
import { SurveyService } from '@/app/core/services/assessment/survey.service';
import { SurveyQuestionsComponent } from './survey-questions/survey-questions.component';

@Component({
  selector: 'app-survey-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SurveyQuestionsComponent],
  templateUrl: './survey-form.component.html',
})
export class SurveyFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly surveyService = inject(SurveyService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  survey = signal<Survey | null>(null);
  saving = signal(false);

  questions = signal<SurveyQuestion[]>([]);
  selectedQuestion = signal<SurveyQuestion | null>(null);

  isQuestionModalOpen = signal(false);

  get isEdit(): boolean {
    return !!this.survey();
  }

  surveyForm = this.fb.group({
    name: ['', Validators.required],
    description: [''],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    this.surveyService.findById(Number(id)).subscribe((res) => {
      if (res.success && res.data) {
        this.survey.set(res.data);
        this.questions.set(res.data.questions ?? []);
        this.surveyForm.patchValue({
          name: res.data.name,
          description: res.data.description,
        });
      }
    });
  }

  onSubmit(): void {
    if (this.surveyForm.invalid) {
      this.surveyForm.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    const dto = {
      name: this.surveyForm.value.name!,
      description: this.surveyForm.value.description || undefined,
    };

    const current = this.survey();
    const req$ = current
      ? this.surveyService.update(current.id, dto)
      : this.surveyService.create(dto);

    req$.subscribe({
      next: (res) => {
        this.saving.set(false);
        if (res.success && res.data) {
          if (!current) {
            this.router.navigate(['/assessment/surveys', res.data.id]);
          } else {
            this.survey.set({
              ...current,
              ...res.data,
              questions: current.questions,
            });
          }
        }
      },
      error: () => this.saving.set(false),
    });
  }

  openEditQuestion(q: SurveyQuestion | null) {
    this.selectedQuestion.set(q);
    this.isQuestionModalOpen.set(true);
  }

  onSaveQuestion(q: SurveyQuestion) {
    const map = new Map(this.questions().map((x) => [x.id, x]));
    map.set(q.id, q);
    this.questions.set(Array.from(map.values()));
  }

  onDeleteQuestion(q: SurveyQuestion) {
    this.questions.set(this.questions().filter((x) => x.id !== q.id) ?? []);
  }

  goBack(): void {
    this.router.navigate(['/assessment/surveys']);
  }
}
