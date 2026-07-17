import { StatusCount } from '@/app/core/models/assessment/period.model';
import { StatusBadgeDirective } from '@/app/shared/directives/status-badge.directive';
import { CommonModule } from '@angular/common';
import { Component, input, output, signal } from '@angular/core';

@Component({
  selector: 'app-assessment-statuses',
  standalone: true,
  imports: [CommonModule, StatusBadgeDirective],
  templateUrl: './assessment-statuses.component.html',
})
export class AssessmentStatusesComponent {
  onClickStatus = output<string>();
  isLoading = signal(false);
  elements = input.required<StatusCount[]>();
}
