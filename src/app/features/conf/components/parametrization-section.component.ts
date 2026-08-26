import { CommonModule } from "@angular/common";
import { Component, input, output } from "@angular/core";

@Component({
  selector: "app-parametrization-section",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./parametrization-section.component.html",
})
export class ParametrizationSectionComponent {
  title = input.required<string>();
  canCreate = input<boolean>(true);
  createLabel = input<string>("+ Nuevo");

  onOpen = output<boolean>();
  onCreate = output<void>();

  onToggle(evt: Event) {
    const details = evt.target as HTMLDetailsElement;
    this.onOpen.emit(details.open);
  }

  openCreate(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.onCreate.emit();
  }
}
