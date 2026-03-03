import { Component, inject, OnInit, signal } from "@angular/core";
import { AssessmentService } from "../../../../core/services/assessment/assessment.service";
import { CommonModule } from "@angular/common";
import { CurrentPeriodsCarouselComponent } from "../periods/current-periods-carousel/current-periods-carousel.component";
import { Period } from "../../../../core/models/assessment/period.model";
import { AssessmentTableComponent } from "./assessment-table/assessment-table.component";

@Component({
  selector: "app-assessment-dashboard",
  imports: [
    CommonModule,
    CurrentPeriodsCarouselComponent,
    AssessmentTableComponent,
  ],
  templateUrl: "./assessment-dashboard.component.html",
  styleUrl: "./assessment-dashboard.component.scss",
})
export class AssessmentDashboardComponent {
  assesmentService = inject(AssessmentService);
  selectedPeriod = signal<Period | undefined>(undefined);
  size = signal(20);
  page = signal(1);

  selectPeriod(period: Period) {}
}
