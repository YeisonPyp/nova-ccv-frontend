import { Component, effect, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PatActivityTaskService } from '@/app/core/services/pat/pat-activity-task.service';
import { PatActivityTask } from '@/app/core/models/pat/pat-models';
import { AreaService } from '@/app/core/services/assessment/area.service';
import { CostCenterService } from '@/app/core/services/cost-center/cost-center.service';
import { PillarService } from '@/app/core/services/pat/pillar.service';
import { PatProgramService } from '@/app/core/services/pat/pat-program.service';
import { PolicyService } from '@/app/core/services/pat/policy.service';
import { ContextSearchSelectComponent } from '@/app/shared/components/context-search-select/context-search-select.component';

@Component({
  selector: 'app-task-upsert-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ContextSearchSelectComponent],
  templateUrl: './task-upsert-modal.component.html',
})
export class PatTaskUpsertModalComponent {
  readonly isOpen = input<boolean>(false);
  readonly activityId = input.required<number>();
  readonly task = input<PatActivityTask | null>(null);

  readonly onClose = output<void>();
  readonly onSaved = output<PatActivityTask>();

  private readonly fb = inject(FormBuilder);
  private readonly service = inject(PatActivityTaskService);
  private readonly areaService = inject(AreaService);
  private readonly costCenterService = inject(CostCenterService);
  private readonly pillarService = inject(PillarService);
  private readonly programService = inject(PatProgramService);
  private readonly policyService = inject(PolicyService);

  submitting = signal(false);
  error = signal<string | null>(null);

  areaCtx = this.areaService.newSearchSelectAreaContext(
    (a) => this.form.patchValue({ areaId: a.id }),
    { isRequired: true, label: 'Área' },
    () => this.form.patchValue({ areaId: null }),
  );

  costCenterCtx = this.costCenterService.newSearchSelectContext(
    (cc) => this.form.patchValue({ costCenterId: cc.id }),
    { isRequired: true, label: 'Centro de costo' },
    () => this.form.patchValue({ costCenterId: null }),
  );

  pillarCtx = this.pillarService.newSearchSelectContext(
    (p) => this.form.patchValue({ pillarId: p.id }),
    { isRequired: false, label: 'Pilar' },
    () => this.form.patchValue({ pillarId: null }),
  );

  programCtx = this.programService.newSearchSelectContext(
    (p) => this.form.patchValue({ programId: p.id }),
    { isRequired: false, label: 'Programa estratégico' },
    () => this.form.patchValue({ programId: null }),
  );

  policyCtx = this.policyService.newSearchSelectContext(
    (p) => this.form.patchValue({ policyId: p.id }),
    { isRequired: false, label: 'Política' },
    () => this.form.patchValue({ policyId: null }),
  );

  form: FormGroup = this.fb.group({
    name: ['', Validators.required],
    areaId: [null, Validators.required],
    costCenterId: [null, Validators.required],
    pillarId: [null],
    programId: [null],
    policyId: [null],
    description: [''],
  });

  constructor() {
    effect(() => {
      if (this.isOpen()) {
        this.error.set(null);
        const t = this.task();
        this.form.reset({
          name: t?.name ?? '',
          areaId: t?.area?.id ?? null,
          costCenterId: t?.costCenter?.id ?? null,
          pillarId: t?.pillar?.id ?? null,
          programId: t?.program?.id ?? null,
          policyId: t?.policy?.id ?? null,
          description: t?.description ?? '',
        });
        if (t?.area) this.areaCtx.selectResults([t.area]);
        if (t?.costCenter) this.costCenterCtx.selectResults([t.costCenter]);
        if (t?.pillar) this.pillarCtx.selectResults([t.pillar]);
        if (t?.program) this.programCtx.selectResults([t.program]);
        if (t?.policy) this.policyCtx.selectResults([t.policy]);
      }
    });
  }

  isFieldInvalid(field: string): boolean {
    const c = this.form.get(field);
    return !!(c?.touched && c?.invalid);
  }

  close(): void {
    this.onClose.emit();
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    this.error.set(null);
    const v = this.form.value;
    const t = this.task();

    const req$ = t
      ? this.service.update(t.id, v)
      : this.service.create(this.activityId(), v);

    req$.subscribe({
      next: (res) => {
        this.submitting.set(false);
        if (res.success && res.data) this.onSaved.emit(res.data);
      },
      error: (err) => {
        this.submitting.set(false);
        this.error.set(err.error?.message ?? 'Error al guardar la tarea');
      },
    });
  }
}
