// pat/components/progress-bar/progress-bar.component.ts
import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { getProgressColor } from '../../utils/pat-status.utils';

@Component({
  selector: 'app-pat-progress-bar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="pat-progress">
      @if (label()) {
        <div class="pat-progress__header">
          <span class="pat-progress__label">{{ label() }}</span>
          <span class="pat-progress__pct pat-progress__pct--{{ colorClass() }}">
            {{ value() }}%
          </span>
        </div>
      }
      <div class="pat-progress__track" [style.height.px]="height()">
        <div
          class="pat-progress__fill pat-progress__fill--{{ colorClass() }}"
          [style.width.%]="clampedValue()"
          [attr.aria-valuenow]="value()"
          role="progressbar"
          aria-valuemin="0"
          aria-valuemax="100">
        </div>
      </div>
      @if (showLegend()) {
        <div class="pat-progress__legend">
          <span>{{ executed() | currency:'COP':'symbol-narrow':'1.0-0' }}</span>
          <span>de {{ planned() | currency:'COP':'symbol-narrow':'1.0-0' }}</span>
        </div>
      }
    </div>
  `,
  styleUrl: './progress-bar.component.scss',
})
export class PatProgressBarComponent {
  value    = input.required<number>();
  label    = input<string>('');
  height   = input<number>(8);
  planned  = input<number>(0);
  executed = input<number>(0);
  showLegend = input<boolean>(false);

  protected clampedValue = computed(() => Math.min(100, Math.max(0, this.value())));
  protected colorClass   = computed(() => getProgressColor(this.value()));
}