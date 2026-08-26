import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ImprovementActionService } from '@/app/core/services/improvement-plan/improvement-action.service';
import { ImprovementActionDto } from '@/app/core/models/improvement-plan/improvement-action.model';
import {
  actionTypeLabels,
  actionTypeBadgeClasses,
} from '@/app/core/models/improvement-plan/improvement-action.model';
import { improvementActionStatus } from '@/app/core/services/improvement-plan/improvement-action.service';
import { ActionFollowUpComponent } from '../../../edit-improvement-plan-modal/finding-section/finding-item/action-section/action-details/followup/action-followup.component';

@Component({
  selector: 'app-upcoming-actions-widget',
  standalone: true,
  imports: [CommonModule, RouterLink, ActionFollowUpComponent],
  templateUrl: './upcoming-actions-widget.component.html',
})
export class UpcomingActionsWidgetComponent implements OnInit {
  private readonly service = inject(ImprovementActionService);

  actions = signal<ImprovementActionDto[]>([]);
  loading = signal(false);
  expandedId = signal<number | null>(null);

  ngOnInit(): void {
    this.loading.set(true);
    this.service.findUpcoming(8).subscribe({
      next: (res) => {
        if (res.success) this.actions.set(res.data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  toggle(id: number): void {
    this.expandedId.set(this.expandedId() === id ? null : id);
  }

  getActionTypeLabel(t: string): string {
    return actionTypeLabels[t as keyof typeof actionTypeLabels] ?? t;
  }

  actionTypeBadgeClass(t: string): string {
    return (
      actionTypeBadgeClasses[t as keyof typeof actionTypeBadgeClasses] ??
      'bg-gray-100 text-tertiary border-gray-200'
    );
  }

  getStatusLabel(k: string): string {
    return (
      improvementActionStatus[k as keyof typeof improvementActionStatus] ?? k
    );
  }

  isOverdue(closeDate: string): boolean {
    return new Date(closeDate).getTime() < Date.now();
  }
}
