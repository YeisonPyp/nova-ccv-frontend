import { CommonModule } from "@angular/common";
import { Component, inject, OnInit, signal } from "@angular/core";
import { Filing } from "@/app/core/models/filing/filing.models";
import { ActivatedRoute, Router } from "@angular/router";
import { FilingUpsertComponent } from "./components/filing-upsert/filing-upsert.component";

@Component({
  selector: "app-filing-modal",
  standalone: true,
  imports: [CommonModule, FilingUpsertComponent],
  templateUrl: "./filing-detail.component.html",
  styleUrl: "./filing-detail.component.scss",
})
export class FilingModalComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  filingId = signal<number | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get("id");
    this.filingId.set(id ? +id : null);
  }

  onSubmit(f: Filing): void {}

  goBack(): void {
    this.router.navigate(["/filings"]);
  }
}
