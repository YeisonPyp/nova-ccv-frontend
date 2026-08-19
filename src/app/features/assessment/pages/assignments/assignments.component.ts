import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { Position } from '@/app/core/models/assessment/position.model';
import { PositionService } from '@/app/core/services/assessment/position.service';
import { LoadingSpinnerComponent } from '@/app/shared/components/loading-spinner/loading-spinner.component';
import { PositionAssessmentComponentsComponent } from '../positions/components/position-assessment-component/position-assessment-components.component';

@Component({
  selector: 'app-assignments',
  standalone: true,
  imports: [
    CommonModule,
    LoadingSpinnerComponent,
    PositionAssessmentComponentsComponent,
  ],
  templateUrl: './assignments.component.html',
})
export class AssignmentsComponent implements OnInit {
  private readonly positionService = inject(PositionService);

  isLoading = signal(false);
  positions = signal<Position[]>([]);

  ngOnInit(): void {
    this.isLoading.set(true);
    this.positionService.findSubordinates().subscribe({
      next: (res) => {
        this.positions.set(res.data ?? []);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }
}
