import { Component, inject, input, output, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule, FormBuilder, Validators } from "@angular/forms";
import { ContractService } from "@/app/core/services/contract/contract.service";

@Component({
  selector: "app-othersi-form",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: "./othersi-form.component.html",
})
export class OthersiFormComponent {
  private readonly service = inject(ContractService);
  private readonly fb = inject(FormBuilder);

  contractId = input.required<number>();
  actId = input.required<number>();
  onCompleted = output<void>();

  saving = signal(false);

  form = this.fb.group({
    index: [null as number | null, Validators.required],
    description: ["", Validators.required],
    executionDate: [""],
  });

  submit(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    const v = this.form.value;
    this.service
      .createOthersi({
        contractId: this.contractId(),
        actId: this.actId(),
        index: v.index!,
        description: v.description!,
        executionDate: v.executionDate || undefined,
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
