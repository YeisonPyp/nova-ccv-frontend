import {
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaginatorComponent } from '@/app/shared/components/paginator/paginator.component';
import {
  PAT_INDICATOR_TYPE_CLASSES,
  PAT_INDICATOR_TYPE_LABELS,
  PatDashboardIndicator,
  PatIndicatorType,
} from '@/app/core/models/pat/pat-dashboard.models';
import { PatManagementIndicatorService } from '@/app/core/services/pat/pat-management-indicator.service';
import { LoadingSpinnerComponent } from '@/app/shared/components/loading-spinner/loading-spinner.component';

/**
 * Indicator progress list. Bars are plain HTML (not a canvas) so they stay
 * selectable, accessible and print correctly: a blue track sized to the
 * planned value with a green fill sized to what was executed.
 */
@Component({
  selector: 'app-indicator-progress-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PaginatorComponent,
    LoadingSpinnerComponent,
  ],
  templateUrl: './indicator-progress-list.component.html',
})
export class IndicatorProgressListComponent {
  private readonly service = inject(PatManagementIndicatorService);
  readonly types: PatIndicatorType[] = ['PRODUCT', 'MANAGEMENT', 'IMPACT'];
  readonly typeLabels = PAT_INDICATOR_TYPE_LABELS;
  readonly typeClasses = PAT_INDICATOR_TYPE_CLASSES;

  year = input.required<number>();
  areaId = input<number | null>(null);
  taskIds = input<number[]>([]);

  loading = signal(false);

  page = signal(1);
  size = signal(10);
  totalPages = signal<number>(0);

  indicators = signal<PatDashboardIndicator[]>([]);

  search = signal('');
  activeTypes = signal<Set<PatIndicatorType>>(
    new Set<PatIndicatorType>(['PRODUCT', 'MANAGEMENT', 'IMPACT']),
  );

  constructor() {
    effect(() => {
      this.loading.set(true);
      const search = this.search() || undefined;
      this.service
        .findSummary({
          year: this.year(),
          areaId: this.areaId(),
          taskIds: this.taskIds(),
          name: search,
          types: Array.from(this.activeTypes()) as PatIndicatorType[],
          page: this.page(),
          size: this.size(),
        })
        .subscribe({
          next: (response) => {
            this.indicators.set(response.data.content);
            this.totalPages.set(response.data.totalPages);
            this.loading.set(false);
          },
          error: () => {
            this.loading.set(false);
          },
        });
    });
  }

  isTypeActive(type: PatIndicatorType): boolean {
    return this.activeTypes().has(type);
  }

  toggleType(type: PatIndicatorType): void {
    const next = new Set(this.activeTypes());
    if (next.has(type)) next.delete(type);
    else next.add(type);
    this.activeTypes.set(next);
    this.page.set(1);
  }

  onSearch(value: Event): void {
    this.search.set((value.target as HTMLInputElement).value);
    this.page.set(1);
  }

  onPageChange(page: number): void {
    this.page.set(page);
  }

  onPageSizeChange(size: number): void {
    this.size.set(size);
    this.page.set(1);
  }

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
