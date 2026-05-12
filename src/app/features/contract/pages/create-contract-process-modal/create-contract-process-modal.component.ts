import { Component, inject, input, output, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule, FormBuilder, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import {
  ContractPendingProcessService,
  CreateContractPendingProcessDto,
} from "@/app/core/services/contract/contract-pending-process.service";
import { ContractPendingProcessType } from "@/app/core/models/contract/contract.models";

@Component({
  selector: "app-create-contract-process-modal",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: "./create-contract-process-modal.component.html",
})
export class CreateContractProcessModalComponent {
  private readonly service = inject(ContractPendingProcessService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  isOpen = input.required<boolean>();
  processType = input.required<ContractPendingProcessType>();
  contractId = input.required<number>();

  onClose = output<void>();

  saving = signal(false);

  form = this.fb.group({
    name: ["", [Validators.required, Validators.maxLength(120)]],
  });

  processTypeLabels: Record<ContractPendingProcessType, string> = {
    addition: "Adición",
    cancellation: "Cancelación",
    cession: "Cesión",
    mutation: "Mutación",
    othersi: "Otro Sí",
    suspension: "Suspensión",
  };

  get label(): string {
    return this.processTypeLabels[this.processType()] ?? this.processType();
  }

  submit(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    const dto: CreateContractPendingProcessDto = {
      contractId: this.contractId(),
      name: this.form.value.name!,
      type: this.processType(),
    };
    this.service.create(dto).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.form.reset();
          this.onClose.emit();
          this.router.navigate([
            "/contracts",
            this.contractId(),
            "process",
            res.data.id,
          ]);
        }
        this.saving.set(false);
      },
      error: () => this.saving.set(false),
    });
  }

  close(): void {
    this.form.reset();
    this.onClose.emit();
  }
}
