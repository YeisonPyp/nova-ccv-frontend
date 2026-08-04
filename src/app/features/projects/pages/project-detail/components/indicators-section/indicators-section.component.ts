import { Component, effect, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  DynamicTableComponent,
  TableColumn,
} from '@/app/shared/components/dynamic-table/dynamic-table.component';
import { ProjectIndicator } from '@/app/core/models/projects/project.model';
import { ProjectService } from '@/app/core/services/projects/project.service';
import { IndicatorUpsertModalComponent } from '../indicator-upsert-modal/indicator-upsert-modal.component';
import { ProjectSectionCardComponent } from '../project-section-card/project-section-card.component';
import { IndicatorTypeLabelPipe } from '../pipes/indicator-type';

@Component({
  selector: 'app-indicators-section',
  standalone: true,
  imports: [
    CommonModule,
    DynamicTableComponent,
    IndicatorUpsertModalComponent,
    ProjectSectionCardComponent,
    IndicatorTypeLabelPipe,
  ],
  templateUrl: './indicators-section.component.html',
})
export class IndicatorsSectionComponent {
  private readonly service = inject(ProjectService);

  projectId = input.required<number>();
  indicators = signal<ProjectIndicator[]>([]);
  modalOpen = signal(false);
  editingIndicator = signal<ProjectIndicator | null>(null);

  readonly columns: TableColumn[] = [
    { key: 'name', label: 'Nombre' },
    { key: 'type', label: 'Tipo' },
    { key: 'targetValue', label: 'Meta' },
    { key: 'currentValue', label: 'Valor actual' },
  ];

  constructor() {
    effect(() => {
      this.service.findIndicators(this.projectId()).subscribe((res) => {
        if (res.success) this.indicators.set(res.data);
      });
    });
  }

  openCreate(): void {
    this.editingIndicator.set(null);
    this.modalOpen.set(true);
  }

  openEdit(indicator: ProjectIndicator): void {
    this.editingIndicator.set(indicator);
    this.modalOpen.set(true);
  }

  closeModal(): void {
    this.modalOpen.set(false);
    this.editingIndicator.set(null);
  }

  onSaved(indicator: ProjectIndicator): void {
    const current = this.indicators();
    const idx = current.findIndex((i) => i.id === indicator.id);
    if (idx >= 0) {
      const updated = [...current];
      updated[idx] = indicator;
      this.indicators.set(updated);
    } else {
      this.indicators.set([...current, indicator]);
    }
    this.closeModal();
  }

  delete(indicator: ProjectIndicator): void {
    this.service.deleteIndicator(indicator.id).subscribe({
      next: () => {
        this.indicators.set(
          this.indicators().filter((i) => i.id !== indicator.id),
        );
      },
    });
  }
}
