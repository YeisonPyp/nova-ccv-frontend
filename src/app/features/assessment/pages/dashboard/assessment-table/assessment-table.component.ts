import { Component, EventEmitter, input, Output } from '@angular/core';
import { Assessment } from '@/app/core/models/assessment/assessment.model';
import { CommonModule } from '@angular/common';
import {
  DynamicTableComponent,
  TableColumn,
} from '@/app/shared/components/dynamic-table/dynamic-table.component';
import { EditIconComponent } from '@/app/shared/components/edit-icon/edit-icon.component';
import { HasPermissionDirective } from '@/app/shared/directives/has-permission.directive';

@Component({
  selector: 'app-assessment-table',
  imports: [
    CommonModule,
    DynamicTableComponent,
    EditIconComponent,
    HasPermissionDirective,
  ],
  templateUrl: './assessment-table.component.html',
  styleUrl: './assessment-table.component.scss',
})
export class AssessmentTableComponent {
  @Output() onEditAssessment = new EventEmitter<Assessment>();

  assessments = input.required<Assessment[]>();
  size = input.required<number>();
  page = input.required<number>();

  columns: TableColumn[] = [
    { key: 'evaluatee', label: 'Empleado' },
    { key: 'evaluator', label: 'Evaluador' },
    { key: 'status', label: 'Estado' },
    { key: 'matrixTotalScore', label: 'Desempeño' },
  ];

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      COMPLETED: 'status-completed',
      PENDING: 'status-pending',
    };
    return classes[status] || 'status-progress';
  }

  onEdit(a: Assessment) {
    this.onEditAssessment.emit(a);
  }
}
