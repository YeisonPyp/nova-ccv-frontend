import { Component, inject, input, OnInit, signal } from "@angular/core";
import { AssessmentService } from "../../../../../core/services/assessment/assessment.service";
import { Assessment } from "../../../../../core/models/assessment/assessment.model";
import { CommonModule } from "@angular/common";
import { AssessmentRowComponent } from "./assessment-row/assessment-row.component";

@Component({
  selector: "app-assessment-table",
  imports: [CommonModule, AssessmentRowComponent],
  templateUrl: "./assessment-table.component.html",
  styleUrl: "./assessment-table.component.scss",
})
export class AssessmentTableComponent implements OnInit {
  private service = inject(AssessmentService);

  size = input.required<number>();
  page = input.required<number>();
  periodId = input.required<number>();

  assessments = signal<Array<Assessment>>([]);

  ngOnInit(): void {
    this.service
      .findAssessmentsInPeriod(this.periodId(), {
        page: this.page(),
        size: this.size(),
      })
      .subscribe((r) => {
        this.assessments.set(r.data.content);
      });
  }
}
