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
import { ContractStatus } from "@/app/core/models/contract/contract-params.model";

@Component({
  selector: "app-resume-form",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: "./resume-form.component.html",
})
export class ResumeFormComponent {
  private readonly service = inject(ContractService);
  private readonly contractParamService = inject(ContractParamsService);
  private readonly fb = inject(FormBuilder);

  contractId = input.required<number>();
  actId = input.required<number>();
  onCompleted = output<void>();
  statusOptions = signal<ContractStatus[]>([]);

  saving = signal(false);

  form = this.fb.group({
    runningStatusName: ["", Validators.required],
    resumeDate: ["", Validators.required],
    observations: [""],
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
      .createContractResume({
        contractId: this.contractId(),
        actId: this.actId(),
        runningStatusName: v.runningStatusName!,
        observations: v.observations!,
        resumeDate: v.resumeDate!,
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
