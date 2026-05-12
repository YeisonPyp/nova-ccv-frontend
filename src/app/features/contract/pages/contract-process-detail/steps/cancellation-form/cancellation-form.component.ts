import { Component, inject, input, output, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule, FormBuilder, Validators } from "@angular/forms";
import { ContractService } from "@/app/core/services/contract/contract.service";

@Component({
  selector: "app-cancellation-form",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: "./cancellation-form.component.html",
})
export class CancellationFormComponent {
  private readonly service = inject(ContractService);
  private readonly fb = inject(FormBuilder);

  contractId = input.required<number>();
  actId = input.required<number>();
  onCompleted = output<void>();

  saving = signal(false);

  form = this.fb.group({
    cancelationTypeName: ["", Validators.required],
    cancellationReason: [""],
    cancellationDate: ["", Validators.required],
    indemnityAmount: [null as number | null],
    penaltyAmount: [null as number | null],
  });

  submit(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    const v = this.form.value;
    this.service
      .createCancellation({
        contractId: this.contractId(),
        actId: this.actId(),
        cancelationTypeName: v.cancelationTypeName!,
        cancellationReason: v.cancellationReason || undefined,
        cancellationDate: v.cancellationDate!,
        indemnityAmount: v.indemnityAmount ?? undefined,
        penaltyAmount: v.penaltyAmount ?? undefined,
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
