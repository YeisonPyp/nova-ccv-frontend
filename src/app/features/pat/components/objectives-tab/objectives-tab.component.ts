import { CommonModule } from "@angular/common";
import { Component, inject, input, signal } from "@angular/core";
import { ObjectivesTableComponent } from "./objectives-table/objectives-table.component";
import { UpsertObjectiveComponent } from "./upsert-objective/upsert-objective.component";
import { PatStrategicObjective } from "@/app/core/models/pat/pat-models";
import { Router } from "@angular/router";

@Component({
  selector: "app-objectives-tab",
  standalone: true,
  imports: [CommonModule, ObjectivesTableComponent, UpsertObjectiveComponent],
  templateUrl: "./objectives-tab.component.html",
})
export class ObjectivesTabComponent {
  year = input.required<number>();
  router = inject(Router);
  upsertOpen = signal(false);
  editing = signal<PatStrategicObjective | null>(null);

  openCreate() {
    this.editing.set(null);
    this.upsertOpen.set(true);
  }

  openEdit(o: PatStrategicObjective) {
    this.router.navigate([`/pat/${this.year()}/objectives`, o.id]);
  }

  closeUpsert() {
    this.upsertOpen.set(false);
    this.editing.set(null);
  }

  onSaved() {
    this.closeUpsert();
  }
}
