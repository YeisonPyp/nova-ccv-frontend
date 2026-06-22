import { CommonModule } from "@angular/common";
import { Component, inject, output, signal } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { StrategicPlan } from "@/app/core/models/strategic-plan/strategic-plan.models";
import { StrategicPlanService } from "@/app/core/services/strategic-plan/strategic-plan.service";
import { FormFieldErrorDirective } from "@/app/shared/directives/form-field-error.directive";

@Component({
  selector: "app-strategic-plan-modal",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormFieldErrorDirective],
  templateUrl: "./strategic-plan-modal.component.html",
})
export class StrategicPlanModalComponent {
  private readonly service = inject(StrategicPlanService);
  private readonly fb = inject(FormBuilder);

  created = output<StrategicPlan>();
  closed = output<void>();

  submitting = signal(false);

  readonly currentYear = new Date().getFullYear();

  form = this.fb.group({
    startsYear: [
      this.currentYear,
      [Validators.required, Validators.min(2000), Validators.max(2100)],
    ],
    endsYear: [
      this.currentYear + 4,
      [Validators.required, Validators.min(2000), Validators.max(2100)],
    ],
  });

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
    this.service
      .create({ startsYear: v.startsYear!, endsYear: v.endsYear! })
      .subscribe({
        next: (res) => {
          this.submitting.set(false);
          this.created.emit(res.data);
          this.close();
        },
        error: () => this.submitting.set(false),
      });
  }
}
