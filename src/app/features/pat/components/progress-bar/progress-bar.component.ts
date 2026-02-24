import { Component, Input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatCalculations } from '../../../../shared/utils/calculations.util';


@Component({
  selector: 'app-progress-bar',
  imports: [CommonModule],
  templateUrl: './progress-bar.component.html',
  styleUrl: './progress-bar.component.scss'
})
export class ProgressBarComponent {
  @Input() percentage: number = 0;
  @Input() label?: string;
  @Input() showDetails: boolean = false;
  @Input() executed?: number;
  @Input() planned?: number;

  Math = Math;

  progressColor = computed(() => PatCalculations.getProgressColor(this.percentage));
}
