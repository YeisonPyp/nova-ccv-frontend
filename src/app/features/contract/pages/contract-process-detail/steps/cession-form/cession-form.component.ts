import { Component, inject, input, output, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule, FormBuilder, Validators } from "@angular/forms";
import { ContractService } from "@/app/core/services/contract/contract.service";
import { ContractPendingProcess } from "@/app/core/models/contract/contract.models";
import { EmployeeService } from "@/app/core/services/assessment/employee.service";
import { AgencyService } from "@/app/core/services/contract/agency.service";
import { SearchSelectComponent } from "@/app/shared/components/search-select/search-select.component";

@Component({
  selector: "app-cession-form",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SearchSelectComponent],
  templateUrl: "./cession-form.component.html",
})
export class CessionFormComponent {
  private readonly service = inject(ContractService);
  private readonly employeeService = inject(EmployeeService);
  private readonly agencyService = inject(AgencyService);
  private readonly fb = inject(FormBuilder);

  contractId = input.required<number>();
  actId = input.required<number>();
  contractType = input.required<ContractPendingProcess["contractType"]>();
  onCompleted = output<void>();

  saving = signal(false);

  form = this.fb.group({
    newEmployeeId: [null as number | null],
    newAgencyId: [null as number | null],
    executedAmount: [null as number | null],
    description: [""],
  });

  agencyCtx = this.agencyService.newSearchSelectContext(
    (agency) => {
      this.form.patchValue({ newAgencyId: agency.id });
    },
    { isRequired: true, maxItems: 1 },
  );

  employeeCtx = this.employeeService.newSearchSelectEmployeeContext(
    (emp) => {
      this.form.patchValue({ newEmployeeId: emp.id });
    },
    { isRequired: true, maxItems: 1 },
  );

  onFieldRemove(field: "newEmployeeId" | "newAgencyId") {
    this.form.get(field)?.setValue(null);
  }

  submit(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    const v = this.form.value;
    this.service
      .createCession({
        contractId: this.contractId(),
        actId: this.actId(),
        newEmployeeId: v.newEmployeeId ?? undefined,
        newAgencyId: v.newAgencyId ?? undefined,
        executedAmount: v.executedAmount!,
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
