import { Component, OnInit, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { PatApiService } from "../../../../core/services/pat-api.service";
import { AreaConsolidation } from "../../models/pat.models";
import { PatProgressBarComponent } from "../progress-bar/progress-bar.component";

@Component({
  selector: "app-area-consolidation-panel",
  standalone: true,
  imports: [CommonModule, PatProgressBarComponent],
  templateUrl: "./area-consolidation-panel.component.html",
  styleUrl: "./area-consolidation-panel.component.scss",
})
export class AreaConsolidationPanelComponent implements OnInit {
  private readonly patApi = inject(PatApiService);

  consolidations = signal<AreaConsolidation[]>([]);
  loading = signal(true);
  selectedYear = signal(new Date().getFullYear());

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.patApi.getAreaConsolidation(this.selectedYear()).subscribe((data) => {
      this.consolidations.set(data);
      this.loading.set(false);
    });
  }

  getImpactClass(score: number): string {
    if (score >= 80) return "high";
    if (score >= 50) return "medium";
    return "low";
  }
}
