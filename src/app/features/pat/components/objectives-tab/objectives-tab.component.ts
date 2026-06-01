import { CommonModule } from "@angular/common";
import { Component, input } from "@angular/core";
import { ObjectivesTableComponent } from "./objectives-table/objectives-table.component";

@Component({
  selector: "app-objectives-tab",
  standalone: true,
  imports: [CommonModule, ObjectivesTableComponent],
  templateUrl: "./objectives-tab.component.html",
})
export class ObjectivesTabComponent {
  year = input.required<number>();
}
