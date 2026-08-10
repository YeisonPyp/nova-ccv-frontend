import { CommonModule } from '@angular/common';
import {
  Component,
  inject,
  input,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { EvidenceItemComponent } from '@/app/features/improvement-plan/pages/improvement-plan/components/evidence-item/evidence-item.component';
import {
  ImprovementActionDto,
  ImprovementActionFollowUp,
} from '@/app/core/models/improvement-plan/improvement-action.model';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  ImprovementActionService,
  improvementActionStatus,
  ImprovementActionStatus,
} from '@/app/core/services/improvement-plan/improvement-action.service';
import {
  PdcaPhase,
  pdcaPhaseLabels,
  ExecutionFrequency,
  executionFrequencyLabels,
} from '@/app/core/models/improvement-plan/improvement-action.model';
import { debounceTime, distinctUntilChanged, filter, switchMap } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';
import { AutosizeTextareaDirective } from '@/app/shared/directives/autosize-textarea.directive';
import { AuthService } from '@/app/core/services/auth.service';
import { ApprovalFlowModalComponent } from './approval-flow-modal/approval-flow-modal.component';
import { ActionFollowUpComponent } from './followup/action-followup.component';

@Component({
  selector: 'app-action-details',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AutosizeTextareaDirective,
    ApprovalFlowModalComponent,
    ActionFollowUpComponent,
  ],
  templateUrl: './action-details.component.html',
  styleUrl: './action-details.component.scss',
})
export class ActionDetailsComponent implements OnInit {
  action = input.required<ImprovementActionDto>();

  followup = signal<ImprovementActionFollowUp[]>([]);
  approvalModalOpen = signal(false);

  onDelete = output<ImprovementActionDto>();
  onUpdated = output<ImprovementActionDto>();

  service = inject(ImprovementActionService);
  private readonly authService = inject(AuthService);

  formGroup: FormGroup;

  getActionStatusName(k: string) {
    return improvementActionStatus[k as ImprovementActionStatus] ?? k;
  }

  get isLocked(): boolean {
    return (
      this.action().status === 'COMPLETED' &&
      !this.authService.hasPermission('PLAN_AUDITOR_ROLE')
    );
  }

  get pdcaPhases(): PdcaPhase[] {
    return Object.keys(pdcaPhaseLabels) as PdcaPhase[];
  }

  getPdcaPhaseLabel(phase: PdcaPhase): string {
    return pdcaPhaseLabels[phase];
  }

  get executionFrequencies(): ExecutionFrequency[] {
    return Object.keys(executionFrequencyLabels) as ExecutionFrequency[];
  }

  getExecutionFrequencyLabel(f: ExecutionFrequency): string {
    return executionFrequencyLabels[f];
  }

  constructor(private fb: FormBuilder) {
    this.formGroup = this.fb.group({
      objectiveDescription: ['', Validators.required],
      actionDescription: ['', Validators.required],
      pdcaPhases: [[] as PdcaPhase[]],
      target: [1, Validators.required],
      executionFrequency: ['MONTHLY' as ExecutionFrequency],
      indicator: [''],
      startDate: [''],
      closeDate: [''],
      followUpObservations: [''],
      actualCloseDate: [''],
      wasEffective: [''],
      ineffectivenessJustification: [''],
    });

    toObservable(this.action).subscribe((a) => {
      this.followup.set(a.followUp ?? []);
      this.formGroup.patchValue(
        {
          objectiveDescription: a.objectiveDescription,
          actionDescription: a.actionDescription,
          pdcaPhases: a.pdcaPhases ?? [],
          target: a.target,
          executionFrequency: a.executionFrequency,
          indicator: a.indicator,
          startDate: a.startDate,
          closeDate: a.closeDate,
          followUpObservations: a.followUpObservations,
          actualCloseDate: a.actualCloseDate,
          wasEffective:
            a.wasEffective === true
              ? 'true'
              : a.wasEffective === false
                ? 'false'
                : '',
          ineffectivenessJustification: a.ineffectivenessJustification ?? '',
        },
        { emitEvent: false },
      );

      if (this.isLocked) {
        this.formGroup.disable({ emitEvent: false });
      } else {
        this.formGroup.enable({ emitEvent: false });
      }
    });
  }

  ngOnInit(): void {
    this.formGroup.valueChanges
      .pipe(
        debounceTime(800),
        filter(() => this.formGroup.valid),
        distinctUntilChanged(
          (prev, curr) => JSON.stringify(prev) === JSON.stringify(curr),
        ),
        switchMap((values) =>
          this.service.update(this.action().id, {
            ...values,
            wasEffective:
              values.wasEffective === ''
                ? undefined
                : values.wasEffective === 'true',
          }),
        ),
      )
      .subscribe({
        error: (err) => console.error('Error al guardar la acción:', err),
      });
  }

  openApprovalModal(): void {
    this.approvalModalOpen.set(true);
  }

  closeApprovalModal(): void {
    this.approvalModalOpen.set(false);
  }

  onApprovalUpdated(updated: ImprovementActionDto): void {
    this.onUpdated.emit(updated);
  }

  togglePhase(phase: PdcaPhase): void {
    const current: PdcaPhase[] = this.formGroup.get('pdcaPhases')?.value ?? [];
    const next = current.includes(phase)
      ? current.filter((p) => p !== phase)
      : [...current, phase];
    this.formGroup.get('pdcaPhases')?.setValue(next);
  }

  isPhaseSelected(phase: PdcaPhase): boolean {
    const current: PdcaPhase[] = this.formGroup.get('pdcaPhases')?.value ?? [];
    return current.includes(phase);
  }

  onDeleteAction() {
    this.service.deleteById(this.action().id).subscribe((r) => {
      if (r.success) {
        this.onDelete.emit(r.data);
      }
    });
  }

  get assignedPositionNames(): string[] {
    return this.action().positions?.map((p) => p.name) ?? [];
  }
}
