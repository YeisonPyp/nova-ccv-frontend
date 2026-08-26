import {
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule, FormBuilder, Validators } from "@angular/forms";
import { ContractService } from "@/app/core/services/contract/contract.service";
import { ContractParamsService } from "@/app/core/services/contract/contract-params.service";
import { tap } from "rxjs";
import { ContractStatus } from "@/app/core/models/contract/contract-params.model";

@Component({
  selector: "app-suspension-form",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: "./suspension-form.component.html",
})
export class SuspensionFormComponent {
  private readonly service = inject(ContractService);
  private readonly contractParamService = inject(ContractParamsService);
  private readonly fb = inject(FormBuilder);

  contractId = input.required<number>();
  actId = input.required<number>();
  onCompleted = output<void>();
  statusOptions = signal<ContractStatus[]>([]);

  saving = signal(false);

  form = this.fb.group({
    suspensionStatusName: ["", Validators.required],
    suspensionReason: ["", Validators.required],
    suspensionDate: ["", Validators.required],
    expectedTerminationDate: [""],
    expectedResumeDate: [""],
    affectsSocialSecurity: [false, Validators.required],
    standbyCostAmount: [null as number | null, Validators.required],
  });

  constructor() {
    this.contractParamService.findContractStatuses().subscribe((res) => {
      if (res.data && res.success) {
        this.statusOptions.set(res.data);
      }
    });
  }

  submit(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    const v = this.form.value;
    this.service
      .createSuspension({
        contractId: this.contractId(),
        actId: this.actId(),
        suspensionStatusName: v.suspensionStatusName!,
        suspensionReason: v.suspensionReason!,
        suspensionDate: v.suspensionDate!,
        expectedTerminationDate: v.expectedTerminationDate || undefined,
        expectedResumeDate: v.expectedResumeDate || undefined,
        affectsSocialSecurity: v.affectsSocialSecurity!,
        standbyCostAmount: v.standbyCostAmount!,
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
