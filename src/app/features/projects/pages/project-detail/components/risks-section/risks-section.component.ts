import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  DynamicTableComponent,
  TableColumn,
} from '@/app/shared/components/dynamic-table/dynamic-table.component';
import { ProjectRisk } from '@/app/core/models/projects/project.model';
import { RiskUpsertModalComponent } from '../risk-upsert-modal/risk-upsert-modal.component';
import { ProjectSectionCardComponent } from '../project-section-card/project-section-card.component';
import { PriorityLabelPipe } from '../pipes/priority';

@Component({
  selector: 'app-risks-section',
  standalone: true,
  imports: [
    CommonModule,
    DynamicTableComponent,
    RiskUpsertModalComponent,
    ProjectSectionCardComponent,
    PriorityLabelPipe,
  ],
  templateUrl: './risks-section.component.html',
})
export class RisksSectionComponent {
  projectId = input.required<number>();
  risks = signal<ProjectRisk[]>([]);
  riskModalOpen = signal(false);
  editingRisk = signal<ProjectRisk | null>(null);

  readonly riskColumns: TableColumn[] = [
    { key: 'displayOrder', label: '#' },
    { key: 'name', label: 'Nombre' },
    { key: 'probability', label: 'Probabilidad' },
    { key: 'priority', label: 'Prioridad' },
    { key: 'estimatedCostAmount', label: 'Costo estimado' },
    { key: 'estimatedHours', label: 'Horas estimadas' },
  ];

  onSaved = output<ProjectRisk>();

  openCreateRisk(): void {
    this.editingRisk.set(null);
    this.riskModalOpen.set(true);
  }

  openEditRisk(risk: ProjectRisk): void {
    this.editingRisk.set(risk);
    this.riskModalOpen.set(true);
  }

  closeRiskModal(): void {
    this.riskModalOpen.set(false);
    this.editingRisk.set(null);
  }

  onRiskSaved(_risk: ProjectRisk): void {
    this.closeRiskModal();
    this.onSaved.emit(_risk);
  }
}
