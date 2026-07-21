import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  AssessmentAnswerComment,
  AssessmentSurveyAnswer,
  RejectionLevel,
} from '@/app/core/models/assessment/assessment.model';
import { AssessmentCommentService } from '@/app/core/services/assessment/assessment-comment.service';

@Component({
  selector: 'app-answer-comments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './answer-comments.component.html',
})
export class AnswerCommentsComponent {
  private readonly service = inject(AssessmentCommentService);

  answer = input.required<AssessmentSurveyAnswer>();
  canComment = input<boolean>(false);
  canReply = input<boolean>(false);

  comments = signal<AssessmentAnswerComment[]>([]);

  // New comment form
  showForm = signal(false);
  newComment = signal('');
  newLevel = signal<RejectionLevel>('MEDIUM');
  saving = signal(false);

  // Reply form (per comment)
  replyingId = signal<number | null>(null);
  replyText = signal('');

  readonly levels: { value: RejectionLevel; label: string }[] = [
    { value: 'LOW', label: 'Bajo' },
    { value: 'MEDIUM', label: 'Medio' },
    { value: 'HIGH', label: 'Alto' },
  ];

  hasComments = computed(() => this.comments().length > 0);

  constructor() {
    effect(() => {
      this.comments.set(this.answer().comments ?? []);
    });
  }

  levelLabel(level: RejectionLevel): string {
    return this.levels.find((l) => l.value === level)?.label ?? level;
  }

  levelClass(level: RejectionLevel): string {
    switch (level) {
      case 'HIGH':
        return 'bg-red-50 text-red-700 ring-red-200';
      case 'MEDIUM':
        return 'bg-amber-50 text-amber-700 ring-amber-200';
      default:
        return 'bg-blue-50 text-blue-700 ring-blue-200';
    }
  }

  submitComment(): void {
    const text = this.newComment().trim();
    if (!text || this.saving()) return;
    this.saving.set(true);
    this.service
      .create({
        answerId: this.answer().id,
        comment: text,
        rejectionLevel: this.newLevel(),
      })
      .subscribe({
        next: (res) => {
          this.comments.update((list) => [...list, res.data]);
          this.newComment.set('');
          this.newLevel.set('MEDIUM');
          this.showForm.set(false);
          this.saving.set(false);
        },
        error: () => this.saving.set(false),
      });
  }

  startReply(id: number): void {
    this.replyingId.set(id);
    this.replyText.set('');
  }

  submitReply(comment: AssessmentAnswerComment): void {
    const text = this.replyText().trim();
    if (!text || this.saving()) return;
    this.saving.set(true);
    this.service.reply(comment.id, text).subscribe({
      next: (res) => {
        this.comments.update((list) =>
          list.map((c) => (c.id === res.data.id ? res.data : c)),
        );
        this.replyingId.set(null);
        this.replyText.set('');
        this.saving.set(false);
      },
      error: () => this.saving.set(false),
    });
  }
}
