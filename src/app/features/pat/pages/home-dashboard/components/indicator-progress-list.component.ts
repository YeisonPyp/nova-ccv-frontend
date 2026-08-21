import { Component, computed, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  PAT_INDICATOR_TYPE_CLASSES,
  PAT_INDICATOR_TYPE_LABELS,
  PatDashboardIndicator,
  PatIndicatorType,
} from '@/app/core/models/pat/pat-dashboard.models';

/**
 * Indicator progress list. Bars are plain HTML (not a canvas) so they stay
 * selectable, accessible and print correctly: a blue track sized to the
 * planned value with a green fill sized to what was executed.
 */
@Component({
  selector: 'app-indicator-progress-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './indicator-progress-list.component.html',
})
export class IndicatorProgressListComponent {
  indicators = input.required<PatDashboardIndicator[]>();
  loading = input<boolean>(false);

  readonly types: PatIndicatorType[] = ['PRODUCT', 'MANAGEMENT', 'IMPACT'];
  readonly typeLabels = PAT_INDICATOR_TYPE_LABELS;
  readonly typeClasses = PAT_INDICATOR_TYPE_CLASSES;

  search = signal('');
  activeTypes = signal<Set<PatIndicatorType>>(
    new Set<PatIndicatorType>(['PRODUCT', 'MANAGEMENT', 'IMPACT']),
  );

  visible = computed(() => {
    const term = this.search().trim().toLowerCase();
    const types = this.activeTypes();
    return this.indicators().filter(
      (i) =>
        types.has(i.type) &&
        (term === '' ||
          i.name.toLowerCase().includes(term) ||
          i.taskName.toLowerCase().includes(term)),
    );
  });

  isTypeActive(type: PatIndicatorType): boolean {
    return this.activeTypes().has(type);
  }

  toggleType(type: PatIndicatorType): void {
    const next = new Set(this.activeTypes());
    if (next.has(type)) next.delete(type);
    else next.add(type);
    this.activeTypes.set(next);
  }

  onSearch(value: string): void {
    this.search.set(value);
  }

  /** Bar fill width, capped at 100% so overexecution doesn't overflow. */
  fillWidth(indicator: PatDashboardIndicator): number {
    const pct = indicator.progressPct;
    if (pct == null) return 0;
    return Math.max(0, Math.min(100, pct));
  }

  barClass(indicator: PatDashboardIndicator): string {
    const pct = indicator.progressPct;
    if (pct == null) return 'bg-gray-300';
    if (pct >= 90) return 'bg-green-600';
    if (pct >= 60) return 'bg-lime-500';
    if (pct >= 30) return 'bg-amber-500';
    return 'bg-red-500';
  }
}
