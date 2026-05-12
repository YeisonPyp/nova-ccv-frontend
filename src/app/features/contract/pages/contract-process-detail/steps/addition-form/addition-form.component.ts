import { Component, inject, input, output, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule, FormBuilder, Validators } from "@angular/forms";
import { ContractService } from "@/app/core/services/contract/contract.service";

@Component({
  selector: "app-addition-form",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: "./addition-form.component.html",
})
export class AdditionFormComponent {
  private readonly service = inject(ContractService);
  private readonly fb = inject(FormBuilder);

  contractId = input.required<number>();
  actId = input.required<number>();
  onCompleted = output<void>();

  saving = signal(false);

  form = this.fb.group({
    newBasePeriodAmount: [null as number | null, Validators.required],
    description: [""],
  });

  submit(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    const v = this.form.value;
    this.service
      .createAddition({
        contractId: this.contractId(),
        actId: this.actId(),
        newBasePeriodAmount: v.newBasePeriodAmount!,
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
