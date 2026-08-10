import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExecutionOrPlaning } from '@/app/core/models/pat/pat-models';
import { MonthlyOverviewCardComponent } from '../monthly-overview-card/monthly-overview-card.component';

@Component({
  selector: 'app-monthly-overview-grid',
  standalone: true,
  imports: [CommonModule, MonthlyOverviewCardComponent],
  templateUrl: './monthly-overview-grid.component.html',
})
export class MonthlyOverviewGridComponent {
  overview = input.required<ExecutionOrPlaning[]>();
  mode = input.required<'plan' | 'execution'>();
  year = input.required<number>();
  taskId = input.required<number>();
}
