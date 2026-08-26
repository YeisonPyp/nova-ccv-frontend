import { Component, effect, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  DynamicTableComponent,
  TableColumn,
} from '@/app/shared/components/dynamic-table/dynamic-table.component';
import { PatActivityBenefitService } from '@/app/core/services/pat/pat-activity-benefit.service';
import { PatActivityBenefitSummary } from '@/app/core/models/pat/pat-models';

/**
 * Read-only rollup of the beneficiaries/impacts of this activity's tasks.
 * Impacts are created/edited on the task detail page.
 */
@Component({
  selector: 'app-pat-benefits-summary-tab',
  standalone: true,
  imports: [CommonModule, DynamicTableComponent],
  templateUrl: './benefits-summary-tab.component.html',
})
export class PatBenefitsSummaryTabComponent {
  private readonly service = inject(PatActivityBenefitService);

  activityId = input.required<number>();
  benefits = signal<PatActivityBenefitSummary[]>([]);

  readonly columns: TableColumn[] = [
    { key: 'taskName', label: 'Tarea' },
    { key: 'benefitTypeName', label: 'Tipo de impacto' },
    { key: 'targetValue', label: 'Meta' },
  ];

  constructor() {
    effect(() => {
      this.service.findByActivity(this.activityId()).subscribe((res) => {
        if (res.success) this.benefits.set(res.data);
      });
    });
  }
}
