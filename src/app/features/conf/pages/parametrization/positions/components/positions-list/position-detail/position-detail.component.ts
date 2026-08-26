import {
  Component,
  effect,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PositionService } from '@/app/core/services/assessment/position.service';
import {
  Position,
  PositionAssessmentComponent,
} from '@/app/core/models/assessment/position.model';
import { PositionEvaluationsComponent } from './position-evaluations/position-evaluations.component';

@Component({
  selector: 'app-position-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, PositionEvaluationsComponent],
  templateUrl: './position-detail.component.html',
})
export class PositionDetailComponent {
  private positionService = inject(PositionService);

  positionId = input.required<number>();

  loading = signal(true);
  position = signal<Position | null>(null);
  assessmentComponents = signal<Array<PositionAssessmentComponent>>([]);

  constructor() {
    effect(() => {
      this.loadPosition(this.positionId());
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
