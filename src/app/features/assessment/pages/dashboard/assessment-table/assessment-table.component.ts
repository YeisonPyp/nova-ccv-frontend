import {
  Component,
  EventEmitter,
  inject,
  input,
  Output,
  computed,
} from "@angular/core";
import { AssessmentService } from "../../../../../core/services/assessment/assessment.service";
import { Assessment } from "../../../../../core/models/assessment/assessment.model";
import { CommonModule } from "@angular/common";
import {
  DynamicTableComponent,
  TableColumn,
} from "../../../../../shared/components/dynamic-table/dynamic-table.component";
import { AuthService } from "../../../../../core/services/auth.service";

@Component({
  selector: "app-assessment-table",
  imports: [CommonModule, DynamicTableComponent],
  templateUrl: "./assessment-table.component.html",
  styleUrl: "./assessment-table.component.scss",
})
export class AssessmentTableComponent {
  @Output() onEditAssessment = new EventEmitter<Assessment>();

  assessments = input.required<Assessment[]>();
  size = input.required<number>();
  page = input.required<number>();

  authService = inject(AuthService);

  canEdit = computed(
    () =>
      this.authService.hasRole("ROLE_ADMIN") ||
      this.authService.hasRole("ROLE_HR"),
  );

  columns: TableColumn<Assessment>[] = [
    { key: "evaluatee", label: "Empleado" },
    // { key: "area", label: "Área" }, // Uncomment if area should be displayed
    { key: "evaluator", label: "Evaluador" },
    { key: "status", label: "Estado" },
    { key: "score", label: "Desempeño" },
  ];

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      COMPLETED: "status-completed",
      PENDING: "status-pending",
    };
    return classes[status] || "status-progress";
  }

  onEdit(a: Assessment) {
    this.onEditAssessment.emit(a);
  }
}
