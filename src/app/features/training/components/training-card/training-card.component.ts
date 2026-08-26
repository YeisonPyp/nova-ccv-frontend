import { Training } from '@/app/core/models/training/training.models';
import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-training-card',
  standalone: true,
  templateUrl: './training-card.component.html',
  imports: [CommonModule, RouterModule],
})
export class TrainingCardComponent {
  training = input.required<Training>();
}
