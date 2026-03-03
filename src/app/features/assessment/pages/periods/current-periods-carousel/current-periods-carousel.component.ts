import { CommonModule } from "@angular/common";
import { Component, inject, OnInit, output, signal } from "@angular/core";
import { PeriodService } from "../../../../../core/services/assessment/period.service";
import { PeriodCardComponent } from "../card/card.component";
import { Period } from "../../../../../core/models/assessment/period.model";

@Component({
  selector: "app-current-periods-carousel",
  imports: [CommonModule, PeriodCardComponent],
  templateUrl: "./current-periods-carousel.component.html",
  styleUrl: "./current-periods-carousel.component.scss",
})
export class CurrentPeriodsCarouselComponent implements OnInit {
  private service = inject(PeriodService);

  currentPeriods = signal<Array<Period>>([]);
  onSelectPeriod = output<Period>();

  ngOnInit(): void {
    this.service.findCurrentPeriods({ size: 3 }).subscribe((p) => {
      if (p.data.content) {
        this.currentPeriods.set(p.data.content);
        if (p.data.content.length > 0) {
          this.selectPeriod(p.data.content[0]);
        }
      }
    });
  }

  selectPeriod(period: Period) {
    this.onSelectPeriod.emit(period);
  }
}
