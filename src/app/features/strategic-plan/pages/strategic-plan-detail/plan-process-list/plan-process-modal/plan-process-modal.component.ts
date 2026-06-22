import { CommonModule } from "@angular/common";
import { Component, inject, input, output, signal } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { PatPlanProcess } from "@/app/core/models/strategic-plan/strategic-plan.models";
import { PatPlanProcessService } from "@/app/core/services/pat/plan-process.service";
import { FormFieldErrorDirective } from "@/app/shared/directives/form-field-error.directive";

@Component({
  selector: "app-plan-process-modal",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormFieldErrorDirective],
  templateUrl: "./plan-process-modal.component.html",
})
export class PlanProcessModalComponent {
  private readonly service = inject(PatPlanProcessService);
  private readonly fb = inject(FormBuilder);

  planName = input.required<string>();
  process = input<PatPlanProcess | null>(null);

  onSave = output<PatPlanProcess>();
  closed = output<void>();

  submitting = signal(false);

  form = this.fb.group({
    name: ["", [Validators.required]],
  });

  ngOnInit(): void {
    if (this.process()) {
      this.form.patchValue({ name: this.process()?.name });
    }
  }

  close(): void {
    this.closed.emit();
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.value;
    this.submitting.set(true);
    const dto = { name: v.name!, planName: this.planName() };
    const $req = this.process()
      ? this.service.update(this.process()!.id, dto)
      : this.service.create(dto);
    $req.subscribe({
      next: (res) => {
        this.submitting.set(false);
        this.onSave.emit(res.data);
        this.close();
      },
      error: () => this.submitting.set(false),
    });
  }
}
