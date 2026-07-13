import {
  Component,
  effect,
  EventEmitter,
  inject,
  input,
  output,
  Output,
  signal,
} from '@angular/core';
import { Assessment } from '@/app/core/models/assessment/assessment.model';
import { CommonModule } from '@angular/common';
import {
  DynamicTableComponent,
  TableColumn,
} from '@/app/shared/components/dynamic-table/dynamic-table.component';
import { EditIconComponent } from '@/app/shared/components/edit-icon/edit-icon.component';
import { HasPermissionDirective } from '@/app/shared/directives/has-permission.directive';
import { AssessmentService } from '@/app/core/services/assessment/assessment.service';
import { PaginatorComponent } from '@/app/shared/components/paginator/paginator.component';
import { Router } from '@angular/router';
import { LoadingSpinnerComponent } from '@/app/shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-assessment-table',
  imports: [
    CommonModule,
    DynamicTableComponent,
    EditIconComponent,
    HasPermissionDirective,
    PaginatorComponent,
    LoadingSpinnerComponent,
  ],
  templateUrl: './assessment-table.component.html',
  styleUrl: './assessment-table.component.scss',
})
export class AssessmentTableComponent {
  private readonly service = inject(AssessmentService);
  private readonly router = inject(Router);

  periodId = input.required<number>();
  assessments = signal<Assessment[]>([]);
  size = signal<number>(10);
  page = signal<number>(1);
  pages = signal<number>(0);
  isLoading = signal(false);

  columns: TableColumn[] = [
    { key: 'evaluatee', label: 'Empleado' },
    { key: 'evaluator', label: 'Evaluador' },
    { key: 'status', label: 'Estado' },
    { key: 'matrixTotalScore', label: 'Desempeño' },
  ];

  constructor() {
    effect(() => {
      const periodId = this.periodId();
      const page = this.page();
      const size = this.size();
      this.isLoading.set(true);
      this.service
        .findAssessments({ periodId, page: page - 1, size })
        .subscribe((res) => {
          this.assessments.set(res.data.content);
          this.pages.set(res.data.totalPages);
          this.isLoading.set(false);
        });
    });
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      COMPLETED: 'status-completed',
      PENDING: 'status-pending',
    };
    return classes[status] || 'status-progress';
  }

  onEdit(a: Assessment) {
    this.router.navigate(['/assessment/edit', a.id]);
  }
}
