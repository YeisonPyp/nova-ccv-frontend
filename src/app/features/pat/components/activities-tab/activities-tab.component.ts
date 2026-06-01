import { CommonModule } from "@angular/common";
import { Component, inject, input } from "@angular/core";
import { ActivitiesTableComponent } from "./activities-table/activities-table.component";
import { Router } from "@angular/router";

@Component({
  selector: "app-activities-tab",
  standalone: true,
  imports: [CommonModule, ActivitiesTableComponent],
  templateUrl: "./activities-tab.component.html",
})
export class ActivitiesTabComponent {
  private readonly router = inject(Router);
  year = input.required<number>();

  openCreate() {
    console.log("year in avitities tab: ", this.year());
    this.router.navigate([`/pat/${this.year()}/activities/create`]);
  }
}
