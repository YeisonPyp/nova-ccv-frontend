// pat/components/kpi-card/kpi-card.component.ts
import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface KpiCardConfig {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: string;
  colorClass: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  trend?: { value: number; positive: boolean };
}

@Component({
  selector: 'app-kpi-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="kpi-card kpi-card--{{ config().colorClass }}">
      <div class="kpi-card__icon-wrap">
        <span class="material-icons">{{ config().icon }}</span>
      </div>
      <div class="kpi-card__body">
        <p class="kpi-card__title">{{ config().title }}</p>
        <p class="kpi-card__value">{{ config().value }}</p>
        @if (config().subtitle) {
          <p class="kpi-card__subtitle">{{ config().subtitle }}</p>
        }
        @if (config().trend) {
          <span class="kpi-card__trend"
            [class.kpi-card__trend--up]="config().trend!.positive"
            [class.kpi-card__trend--down]="!config().trend!.positive">
            <span class="material-icons">
              {{ config().trend!.positive ? 'trending_up' : 'trending_down' }}
            </span>
            {{ config().trend!.value }}%
          </span>
        }
      </div>
    </div>
  `,
  styleUrl: './kpi-card.component.scss',
})
export class KpiCardComponent {
  config = input.required<KpiCardConfig>();
}