import { GoalOption } from '@/app/core/models/goals/goal-option.model';
import { ReportTemplateVariable } from '@/app/core/models/reports/report-template-variable.model';
import { ReportTemplateVariableService } from '@/app/core/services/reports/report-template-variable.service';
import {
  DynamicTableComponent,
  TableColumn,
} from '@/app/shared/components/dynamic-table/dynamic-table.component';
import { LoadingSpinnerComponent } from '@/app/shared/components/loading-spinner/loading-spinner.component';
import { PaginatorComponent } from '@/app/shared/components/paginator/paginator.component';
import { CommonModule } from '@angular/common';
import {
  Component,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';

@Component({
  selector: 'app-report-variable-table',
  templateUrl: './report-variable.component.html',
  standalone: true,
  imports: [
    CommonModule,
    DynamicTableComponent,
    PaginatorComponent,
    LoadingSpinnerComponent,
  ],
})
export class ReportVariableComponent {
  private readonly service = inject(ReportTemplateVariableService);

  variable = input.required<ReportTemplateVariable>();

  onSelectOption = output<GoalOption>();

  size = signal(10);
  page = signal(1);
  pages = signal(0);
  isLoading = signal(false);
  elements = signal<GoalOption[]>([]);

  columns: TableColumn[] = [{ key: 'label', label: 'Opción' }];

  constructor() {
    effect(() => {
      this.isLoading.set(true);
      const v = this.variable();
      this.service
        .findOptionsForVariable(v.id, {
          page: this.page() - 1,
          size: this.size(),
        })
        .subscribe((res) => {
          this.elements.set(res.data.content);
          this.pages.set(res.data.totalPages);
        });
    });
  }
}
