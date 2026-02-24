import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stats-card',
  imports: [],
  templateUrl: './stats-card.component.html',
  styleUrl: './stats-card.component.scss'
})
export class StatsCardComponent {
  @Input() label: string = '';
  @Input() value: string = '';
  @Input() icon: string = 'analytics';
  @Input() color: string = '#3b82f6';
  @Input() subtitle?: string;
}