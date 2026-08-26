import { Component, effect, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  DynamicTableComponent,
  TableColumn,
} from '@/app/shared/components/dynamic-table/dynamic-table.component';
import { PatActivityIndicatorService } from '@/app/core/services/pat/pat-activity-indicator.service';
import { PatActivityIndicatorSummary } from '@/app/core/models/pat/pat-models';

/**
 * Read-only rollup of the indicators tracked by this activity's tasks.
 * Indicators are created/edited on the task detail page.
 */
@Component({
  selector: 'app-pat-indicators-summary-tab',
  standalone: true,
  imports: [CommonModule, DynamicTableComponent],
  templateUrl: './indicators-summary-tab.component.html',
})
export class PatIndicatorsSummaryTabComponent {
  private readonly service = inject(PatActivityIndicatorService);

  activityId = input.required<number>();
  indicators = signal<PatActivityIndicatorSummary[]>([]);

  readonly columns: TableColumn[] = [
    { key: 'taskName', label: 'Tarea' },
    { key: 'managementIndicatorName', label: 'Indicador' },
    { key: 'baseValue', label: 'Línea base' },
    { key: 'goalValue', label: 'Meta' },
  ];

  constructor() {
    effect(() => {
      this.service.findByActivity(this.activityId()).subscribe((res) => {
        if (res.success) this.indicators.set(res.data);
      });
    });
  }
}
