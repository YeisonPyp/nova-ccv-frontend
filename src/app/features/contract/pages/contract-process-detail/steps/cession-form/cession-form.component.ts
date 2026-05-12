import { Component, inject, input, output, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule, FormBuilder, Validators } from "@angular/forms";
import { ContractService } from "@/app/core/services/contract/contract.service";

@Component({
  selector: "app-cession-form",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: "./cession-form.component.html",
})
export class CessionFormComponent {
  private readonly service = inject(ContractService);
  private readonly fb = inject(FormBuilder);

  contractId = input.required<number>();
  actId = input.required<number>();
  onCompleted = output<void>();

  saving = signal(false);

  form = this.fb.group({
    previousEmployeeId: [null as number | null],
    newEmployeeId: [null as number | null],
    previousAgencyId: [null as number | null],
    newAgencyId: [null as number | null],
    executedAmount: [null as number | null, Validators.required],
    pendingAmount: [null as number | null, Validators.required],
    description: [""],
  });

  submit(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    const v = this.form.value;
    this.service
      .createCession({
        contractId: this.contractId(),
        actId: this.actId(),
        previousEmployeeId: v.previousEmployeeId ?? undefined,
        newEmployeeId: v.newEmployeeId ?? undefined,
        previousAgencyId: v.previousAgencyId ?? undefined,
        newAgencyId: v.newAgencyId ?? undefined,
        executedAmount: v.executedAmount!,
        pendingAmount: v.pendingAmount!,
        description: v.description || undefined,
      })
      .subscribe({
        next: (res) => {
          if (res.success) this.onCompleted.emit();
          this.saving.set(false);
        },
        error: () => this.saving.set(false),
      });
  }
}
