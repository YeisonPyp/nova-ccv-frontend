import { Component, effect, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  ProjectService,
  UpdateProjectFormulationDto,
} from '@/app/core/services/projects/project.service';
import { ProjectFormulation } from '@/app/core/models/projects/project.model';

export const FORMULATION_STATUS_OPTIONS = [
  { value: 'formulated', label: 'Formulado' },
  { value: 'under_evaluation', label: 'En evaluación' },
  { value: 'viabilized', label: 'Viabilizado' },
] as const;

export const INITIATIVE_TYPE_OPTIONS = [
  { value: 'program', label: 'Programa' },
  { value: 'project', label: 'Proyecto' },
] as const;

export const TECHNICAL_CONCEPT_OPTIONS = [
  { value: 'viable', label: 'Viable' },
  { value: 'viable_with_adjustments', label: 'Viable con ajustes' },
  { value: 'not_viable', label: 'No viable' },
] as const;

@Component({
  selector: 'app-formulation-edit-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './formulation-edit-modal.component.html',
})
export class FormulationEditModalComponent {
  readonly isOpen = input<boolean>(false);
  readonly projectId = input.required<number>();
  readonly formulation = input<ProjectFormulation | null>(null);

  readonly onClose = output<void>();
  readonly onSaved = output<ProjectFormulation>();

  private readonly fb = inject(FormBuilder);
  private readonly projectService = inject(ProjectService);

  readonly statusOptions = FORMULATION_STATUS_OPTIONS;
  readonly initiativeTypeOptions = INITIATIVE_TYPE_OPTIONS;
  readonly technicalConceptOptions = TECHNICAL_CONCEPT_OPTIONS;

  submitting = signal(false);
  error = signal<string | null>(null);

  form: FormGroup = this.fb.group({
    formulationDate: [null],
    formulationStatus: ['formulated'],
    strategicAxis: [''],
    strategicObjectives: [''],
    poaRelation: [''],
    patRelation: [''],
    initiativeType: ['project'],
    background: [''],
    justification: [''],
    problemDescription: [''],
    scopeIncludes: [''],
    scopeExcludes: [''],
    directBeneficiaries: [0],
    indirectBeneficiaries: [0],
    executionMethodology: [''],
    budgetDetail: [''],
    monitoringPlan: [''],
    sustainability: [''],
    conclusions: [''],
    preparedBy: [''],
    reviewedBy: [''],
    approvedBy: [''],
    technicalConcept: [null],
  });

  constructor() {
    effect(() => {
      if (this.isOpen()) {
        this.error.set(null);
        const f = this.formulation();
        this.form.reset({
          formulationDate: f?.formulationDate ?? null,
          formulationStatus: f?.formulationStatus ?? 'formulated',
          strategicAxis: f?.strategicAxis ?? '',
          strategicObjectives: f?.strategicObjectives ?? '',
          poaRelation: f?.poaRelation ?? '',
          patRelation: f?.patRelation ?? '',
          initiativeType: f?.initiativeType ?? 'project',
          background: f?.background ?? '',
          justification: f?.justification ?? '',
          problemDescription: f?.problemDescription ?? '',
          scopeIncludes: f?.scopeIncludes ?? '',
          scopeExcludes: f?.scopeExcludes ?? '',
          directBeneficiaries: f?.directBeneficiaries ?? 0,
          indirectBeneficiaries: f?.indirectBeneficiaries ?? 0,
          executionMethodology: f?.executionMethodology ?? '',
          budgetDetail: f?.budgetDetail ?? '',
          monitoringPlan: f?.monitoringPlan ?? '',
          sustainability: f?.sustainability ?? '',
          conclusions: f?.conclusions ?? '',
          preparedBy: f?.preparedBy ?? '',
          reviewedBy: f?.reviewedBy ?? '',
          approvedBy: f?.approvedBy ?? '',
          technicalConcept: f?.technicalConcept ?? null,
        });
      }
    });
  }

  close(): void {
    this.onClose.emit();
  }

  submit(): void {
    this.submitting.set(true);
    this.error.set(null);

    const v = this.form.value;
    const dto: UpdateProjectFormulationDto = {
      ...v,
      formulationDate: v.formulationDate || undefined,
      technicalConcept: v.technicalConcept || undefined,
    };

    this.projectService.updateFormulation(this.projectId(), dto).subscribe({
      next: (res) => {
        this.submitting.set(false);
        if (res.success && res.data) this.onSaved.emit(res.data);
      },
      error: (err) => {
        this.submitting.set(false);
        this.error.set(
          err.error?.message ?? 'Error al guardar la formulación',
        );
      },
    });
  }
}
