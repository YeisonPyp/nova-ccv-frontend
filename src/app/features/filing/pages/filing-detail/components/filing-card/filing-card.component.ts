import { CommonModule } from "@angular/common";
import { Component, inject, input } from "@angular/core";
import { Router } from "@angular/router";
import { Filing } from "@/app/core/models/filing/filing.models";

@Component({
  selector: "app-filing-card",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./filing-card.component.html",
})
export class FilingCardComponent {
  private readonly router = inject(Router);

  filing = input.required<Filing>();

  navigate(): void {
    this.router.navigate(["/filings", this.filing().id]);
  }
}
