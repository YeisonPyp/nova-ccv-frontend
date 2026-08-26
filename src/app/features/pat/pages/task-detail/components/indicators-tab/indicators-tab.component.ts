import { Component, effect, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  DynamicTableComponent,
  TableColumn,
} from '@/app/shared/components/dynamic-table/dynamic-table.component';
import { PatActivityIndicatorService } from '@/app/core/services/pat/pat-activity-indicator.service';
import { PatActivityIndicator } from '@/app/core/models/pat/pat-models';
import { IndicatorUpsertModalComponent } from './components/indicator-upsert-modal.component';
import { ProjectSectionCardComponent } from '@/app/features/projects/pages/project-detail/components/project-section-card/project-section-card.component';

@Component({
  selector: 'app-pat-indicators-tab',
  standalone: true,
  imports: [
    CommonModule,
    DynamicTableComponent,
    IndicatorUpsertModalComponent,
    ProjectSectionCardComponent,
  ],
  templateUrl: './indicators-tab.component.html',
})
export class PatIndicatorsTabComponent {
  private readonly service = inject(PatActivityIndicatorService);

  taskId = input.required<number>();
  indicators = signal<PatActivityIndicator[]>([]);

  upsertModalOpen = signal(false);
  editingIndicator = signal<PatActivityIndicator | null>(null);

  readonly columns: TableColumn[] = [
    { key: 'managementIndicator.name', label: 'Indicador' },
    { key: 'baseValue', label: 'Línea base' },
    { key: 'goalValue', label: 'Meta' },
  ];

  constructor() {
    effect(() => {
      this.service.findByTask(this.taskId()).subscribe((res) => {
        if (res.success) this.indicators.set(res.data);
      });
    });
  }

  openCreate(): void {
    this.editingIndicator.set(null);
    this.upsertModalOpen.set(true);
  }

  openEdit(indicator: PatActivityIndicator): void {
    this.editingIndicator.set(indicator);
    this.upsertModalOpen.set(true);
  }

  closeUpsertModal(): void {
    this.upsertModalOpen.set(false);
    this.editingIndicator.set(null);
  }

  onSaved(indicator: PatActivityIndicator): void {
    const current = this.indicators();
    const idx = current.findIndex((i) => i.id === indicator.id);
    if (idx >= 0) {
      const updated = [...current];
      updated[idx] = indicator;
      this.indicators.set(updated);
    } else {
      this.indicators.set([...current, indicator]);
    }
    this.closeUpsertModal();
  }

  delete(indicator: PatActivityIndicator): void {
    this.service.delete(indicator.id).subscribe({
      next: () => {
        this.indicators.set(
          this.indicators().filter((i) => i.id !== indicator.id),
        );
      },
    });
  }
}
