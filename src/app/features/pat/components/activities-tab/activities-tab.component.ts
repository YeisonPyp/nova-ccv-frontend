import { CommonModule } from "@angular/common";
import { Component, computed, inject, input } from "@angular/core";
import { ActivitiesTableComponent } from "./activities-table/activities-table.component";
import { ActivitiesByAreaReportComponent } from "../../pages/activity-report/activity-report.component";
import { Router } from "@angular/router";

@Component({
  selector: "app-activities-tab",
  standalone: true,
  imports: [CommonModule, ActivitiesTableComponent, ActivitiesByAreaReportComponent],
  templateUrl: "./activities-tab.component.html",
})
export class ActivitiesTabComponent {
  private readonly router = inject(Router);
  year = input.required<number>();
  areaIds = input<number[]>([]);

  hasAreaFilter = computed(() => this.areaIds().length > 0);

  openCreate() {
    this.router.navigate([`/pat/${this.year()}/activities/create`]);
  }
}
