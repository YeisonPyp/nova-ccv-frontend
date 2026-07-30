import { CommonModule } from "@angular/common";
import { Component, inject, input, OnInit, output, signal } from "@angular/core";
import { EvidenceItemComponent } from "@/app/features/improvement-plan/pages/improvement-plan/components/evidence-item/evidence-item.component";
import { ImprovementActionDto } from "@/app/core/models/improvement-plan/improvement-action.model";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import {
  ImprovementActionService,
  improvementActionStatus,
  ImprovementActionStatus,
} from "@/app/core/services/improvement-plan/improvement-action.service";
import {
  PdcaPhase,
  pdcaPhaseLabels,
  ExecutionFrequency,
  executionFrequencyLabels,
} from "@/app/core/models/improvement-plan/improvement-action.model";
import { debounceTime, distinctUntilChanged, filter, switchMap } from "rxjs";
import { EvidenceDto } from "@/app/core/models/improvement-plan/evidence.model";
import { toObservable } from "@angular/core/rxjs-interop";
import { AutosizeTextareaDirective } from "@/app/shared/directives/autosize-textarea.directive";

@Component({
  selector: "app-action-details",
  standalone: true,
  imports: [
    CommonModule,
    EvidenceItemComponent,
    ReactiveFormsModule,
    AutosizeTextareaDirective,
  ],
  templateUrl: "./action-details.component.html",
  styleUrl: "./action-details.component.scss",
})
export class ActionDetailsComponent implements OnInit {
  action = input.required<ImprovementActionDto>();

  evidences = signal<EvidenceDto[]>([]);

  onDelete = output<ImprovementActionDto>();

  service = inject(ImprovementActionService);

  formGroup: FormGroup;

  get actionStatuses() {
    return Object.keys(improvementActionStatus) as Array<ImprovementActionStatus>;
  }

  getActionStatusName(k: ImprovementActionStatus) {
    return improvementActionStatus[k];
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
      objectiveDescription: ["", Validators.required],
      actionDescription: ["", Validators.required],
      pdcaPhases: [[] as PdcaPhase[]],
      target: [1, Validators.required],
      executionFrequency: ["MONTHLY" as ExecutionFrequency],
      indicator: [""],
      startDate: [""],
      closeDate: [""],
      status: [""],
      followUpObservations: [""],
      actualCloseDate: [""],
      wasEffective: [""],
    });

    toObservable(this.action).subscribe((a) => {
      this.evidences.set(a.evidences ?? []);
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
          status: a.status,
          followUpObservations: a.followUpObservations,
          actualCloseDate: a.actualCloseDate,
          wasEffective:
            a.wasEffective === true
              ? "true"
              : a.wasEffective === false
                ? "false"
                : "",
        },
        { emitEvent: false },
      );
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
              values.wasEffective === "" ? undefined : values.wasEffective === "true",
          }),
        ),
      )
      .subscribe({
        error: (err) => console.error("Error al guardar la acción:", err),
      });
  }

  togglePhase(phase: PdcaPhase): void {
    const current: PdcaPhase[] = this.formGroup.get("pdcaPhases")?.value ?? [];
    const next = current.includes(phase)
      ? current.filter((p) => p !== phase)
      : [...current, phase];
    this.formGroup.get("pdcaPhases")?.setValue(next);
  }

  isPhaseSelected(phase: PdcaPhase): boolean {
    const current: PdcaPhase[] = this.formGroup.get("pdcaPhases")?.value ?? [];
    return current.includes(phase);
  }

  onDeleteAction() {
    this.service.deleteById(this.action().id).subscribe((r) => {
      if (r.success) {
        this.onDelete.emit(r.data);
      }
    });
  }

  onSaveEvidence(e: EvidenceDto) {
    const ev = this.evidences().reduce(
      (prev, curr) => {
        prev[curr.id] = curr;
        return prev;
      },
      {} as Record<number, EvidenceDto>,
    );
    ev[e.id] = e;

    this.evidences.set(Object.values(ev));
  }

  onRemoveEvidence(ev: EvidenceDto) {
    this.evidences.set(this.evidences().filter((e) => e.id !== ev.id));
  }

  get assignedEmployeeFullName() {
    return [this.action().employee?.name, this.action().employee?.lastName]
      .filter((i) => i)
      .join(" ");
  }
}
