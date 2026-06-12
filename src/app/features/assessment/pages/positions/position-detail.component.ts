import { Component, inject, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { PositionService } from "@/app/core/services/assessment/position.service";
import {
  Position,
  PositionAssessmentComponent,
} from "@/app/core/models/assessment/position.model";
import { PositionAssessmentComponentsComponent } from "./components/position-assessment-component/position-assessment-components.component";

@Component({
  selector: "app-position-detail",
  standalone: true,
  imports: [CommonModule, RouterLink, PositionAssessmentComponentsComponent],
  templateUrl: "./position-detail.component.html",
})
export class PositionDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private positionService = inject(PositionService);

  loading = signal(true);
  position = signal<Position | null>(null);
  assessmentComponents = signal<Array<PositionAssessmentComponent>>([]);

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const id = params.get("id");
      if (id) {
        this.loadPosition(Number(id));
      } else {
        this.loading.set(false);
      }
    });
  }

  private loadPosition(id: number) {
    this.loading.set(true);
    this.positionService.findById(id).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.position.set(res.data);
          this.assessmentComponents.set(res.data.assessmentComponent || []);
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
