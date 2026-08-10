import { CommonModule } from '@angular/common';
import { Component, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PositionService } from '@/app/core/services/assessment/position.service';
import { SelectSearchComponent } from '@/app/shared/components/select-search/select-search.component';
import { ImprovementActionService } from '@/app/core/services/improvement-plan/improvement-action.service';
import { ImprovementActionDto } from '@/app/core/models/improvement-plan/improvement-action.model';
import {
  PdcaPhase,
  pdcaPhaseLabels,
  ExecutionFrequency,
  executionFrequencyLabels,
} from '@/app/core/models/improvement-plan/improvement-action.model';
import {
  Option,
  SelectorComponent,
} from '@/app/shared/components/selector/selector.component';

@Component({
  selector: 'app-new-action',
  standalone: true,
  imports: [
    CommonModule,
    SelectSearchComponent,
    ReactiveFormsModule,
    SelectorComponent,
  ],
  templateUrl: './new-action.component.html',
  styleUrl: './new-action.component.scss',
})
export class NewActionComponent {
  positionService = inject(PositionService);
  service = inject(ImprovementActionService);
  private readonly fb = inject(FormBuilder);

  findingId = input.required<number>();

  onCreated = output<ImprovementActionDto>();

  form = this.fb.group({
    objectiveDescription: ['', Validators.required],
    actionDescription: ['', Validators.required],
    executionFrequency: ['MONTHLY' as ExecutionFrequency, Validators.required],
    indicator: ['', Validators.required],
    startDate: ['', Validators.required],
    closeDate: ['', Validators.required],
  });

  selectedPhases = new Set<PdcaPhase>();

  positionsCtx = this.positionService.newSearchSelectContext(undefined, {
    maxItems: 0,
    placeholder: 'Cargos responsables...',
    label: 'Cargos responsables',
    isRequired: false,
  });

  get pdcaPhases(): PdcaPhase[] {
    return Object.keys(pdcaPhaseLabels) as PdcaPhase[];
  }

  getPdcaPhaseLabel(phase: PdcaPhase): string {
    return pdcaPhaseLabels[phase];
  }

  get executionFrequencies(): Option[] {
    return Object.entries(executionFrequencyLabels).map(([value, label]) => ({
      value,
      label,
    }));
  }

  togglePhase(phase: PdcaPhase): void {
    if (this.selectedPhases.has(phase)) {
      this.selectedPhases.delete(phase);
    } else {
      this.selectedPhases.add(phase);
    }
  }

  isPhaseSelected(phase: PdcaPhase): boolean {
    return this.selectedPhases.has(phase);
  }

  onSubmit(): void {
    if (!this.form.valid || this.selectedPhases.size === 0) return;
    const {
      objectiveDescription,
      actionDescription,
      executionFrequency,
      indicator,
      startDate,
      closeDate,
    } = this.form.value;

    this.service
      .create({
        findingId: this.findingId(),
        objectiveDescription: objectiveDescription!,
        actionDescription: actionDescription!,
        pdcaPhases: Array.from(this.selectedPhases),
        executionFrequency: executionFrequency!,
        indicator: indicator!,
        startDate: startDate!,
        closeDate: closeDate!,
        positionIds: this.positionsCtx
          .selectedOptions()
          .map((o) => o.id as number),
      })
      .subscribe((r) => {
        if (r.success) {
          this.onCreated.emit(r.data);
          this.form.reset({
            objectiveDescription: '',
            actionDescription: '',
            executionFrequency: 'MONTHLY',
            indicator: '',
            startDate: '',
            closeDate: '',
          });
          this.selectedPhases.clear();
          this.positionsCtx.clear();
        }
      });
  }
}
