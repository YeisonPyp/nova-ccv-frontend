import { Component, input } from "@angular/core";

@Component({
  selector: "div[app-loading-spinner]",
  templateUrl: "./loading-spinner.component.html",
  standalone: true,
})
export class LoadingSpinnerComponent {
  isLoading = input.required<boolean>();
  width = input<string>("6px");
  height = input<string>("6px");
}
