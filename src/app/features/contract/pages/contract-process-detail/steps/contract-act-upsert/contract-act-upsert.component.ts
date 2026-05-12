import { Component, inject, input, output, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule, FormBuilder, Validators } from "@angular/forms";
import {
  ContractActService,
  CreateContractActDto,
} from "@/app/core/services/contract/contract-act.service";
import { ContractAct } from "@/app/core/models/contract/contract.models";

@Component({
  selector: "app-contract-act-upsert",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: "./contract-act-upsert.component.html",
})
export class ContractActUpsertComponent {
  private readonly service = inject(ContractActService);
  private readonly fb = inject(FormBuilder);

  contractId = input.required<number>();
  filingId = input<number | null>(null);

  onSave = output<ContractAct>();
  onCancel = output<void>();

  saving = signal(false);

  form = this.fb.group({
    typeCode: ["", [Validators.required, Validators.maxLength(60)]],
    actDate: ["", Validators.required],
    signatories: ["", [Validators.required, Validators.maxLength(255)]],
    description: [""],
  });

  submit(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    const v = this.form.value;
    const dto: CreateContractActDto = {
      contractId: this.contractId(),
      typeCode: v.typeCode!,
      actDate: v.actDate!,
      signatories: v.signatories!,
    };
    if (this.filingId() != null) dto.filingId = this.filingId()!;
    if (v.description) dto.description = v.description;

    this.service.create(dto).subscribe({
      next: (res) => {
        if (res.success && res.data) this.onSave.emit(res.data);
        this.saving.set(false);
      },
      error: () => this.saving.set(false),
    });
  }
}
