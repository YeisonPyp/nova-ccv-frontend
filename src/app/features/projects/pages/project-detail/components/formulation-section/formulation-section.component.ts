import { Component, effect, inject, input, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ProjectFormulation } from '@/app/core/models/projects/project.model';
import { ProjectService } from '@/app/core/services/projects/project.service';
import { ProjectSectionCardComponent } from '../project-section-card/project-section-card.component';
import {
  FormulationEditModalComponent,
  FORMULATION_STATUS_OPTIONS,
  INITIATIVE_TYPE_OPTIONS,
  TECHNICAL_CONCEPT_OPTIONS,
} from './formulation-edit-modal.component';

@Component({
  selector: 'app-formulation-section',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    ProjectSectionCardComponent,
    FormulationEditModalComponent,
  ],
  templateUrl: './formulation-section.component.html',
})
export class FormulationSectionComponent {
  private readonly service = inject(ProjectService);

  projectId = input.required<number>();
  formulation = signal<ProjectFormulation | null>(null);
  modalOpen = signal(false);

  constructor() {
    effect(() => {
      this.service.findFormulation(this.projectId()).subscribe((res) => {
        if (res.success) this.formulation.set(res.data);
      });
    });
  }

  label(
    options: readonly { value: string; label: string }[],
    value: string | undefined | null,
  ): string {
    if (!value) return '—';
    return options.find((o) => o.value === value)?.label ?? value;
  }

  statusLabel(value: string | undefined | null): string {
    return this.label(FORMULATION_STATUS_OPTIONS, value);
  }

  initiativeTypeLabel(value: string | undefined | null): string {
    return this.label(INITIATIVE_TYPE_OPTIONS, value);
  }

  technicalConceptLabel(value: string | undefined | null): string {
    return this.label(TECHNICAL_CONCEPT_OPTIONS, value);
  }

  openEdit(): void {
    this.modalOpen.set(true);
  }

  closeModal(): void {
    this.modalOpen.set(false);
  }

  onSaved(formulation: ProjectFormulation): void {
    this.formulation.set(formulation);
    this.closeModal();
  }
}
