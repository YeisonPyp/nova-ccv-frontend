import { TrainingProgram } from '@/app/core/models/training/training-program.models';
import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-program-card',
  standalone: true,
  templateUrl: './program-card.component.html',
  imports: [CommonModule, RouterModule],
})
export class ProgramCardComponent {
  program = input.required<TrainingProgram>();
}
