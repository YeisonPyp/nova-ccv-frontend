import { Component, input, output } from "@angular/core";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-project-section-card",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./project-section-card.component.html",
})
export class ProjectSectionCardComponent {
  readonly title = input.required<string>();
  readonly addLabel = input<string | null>(null);
  readonly isEmpty = input<boolean>(false);
  readonly emptyMessage = input<string>("Sin registros.");

  readonly onAdd = output<void>();
}
