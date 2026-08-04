import { CommonModule } from "@angular/common";
import { Component, inject, input } from "@angular/core";
import { ActivitiesByAreaReportComponent } from "../../pages/activity-report/activity-report.component";
import { Router } from "@angular/router";

@Component({
  selector: "app-activities-tab",
  standalone: true,
  imports: [CommonModule, ActivitiesByAreaReportComponent],
  templateUrl: "./activities-tab.component.html",
})
export class ActivitiesTabComponent {
  private readonly router = inject(Router);
  year = input.required<number>();
  areaIds = input<number[]>([]);

  openCreate() {
    this.router.navigate([`/pat/${this.year()}/activities/create`]);
  }
}
