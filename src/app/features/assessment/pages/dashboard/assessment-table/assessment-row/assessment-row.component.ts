import { CommonModule } from "@angular/common";
import { Component, input } from "@angular/core";
import { Assessment } from "../../../../../../core/models/assessment/assessment.model";

@Component({
  selector: "app-assessment-row",
  imports: [CommonModule],
  templateUrl: "./assessment-row.component.html",
  styleUrl: "./assessment-row.component.scss",
})
export class AssessmentRowComponent {
  assessment = input.required<Assessment>();

  canEdit() {
    return true;
  }

  canView() {
    return true;
  }

  getStatusClass(status: string) {
    const classes: any = {
      COMPLETED: "status-completed",
      PENDING: "status-pending",
    };
    return classes[status] || "";
  }
}
