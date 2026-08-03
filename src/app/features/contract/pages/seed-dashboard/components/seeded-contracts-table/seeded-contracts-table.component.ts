import { CommonModule } from "@angular/common";
import { Component, computed, inject, input, signal, viewChild } from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { PaginationTableComponent } from "@/app/shared/components/pagination-table/pagination-table.component";
import { TableColumn } from "@/app/shared/components/dynamic-table/dynamic-table.component";
import { SelectSearchComponent } from "@/app/shared/components/select-search/select-search.component";
import { SeededContractService } from "@/app/core/services/contract/seeded-contract.service";
import { EmployeeService } from "@/app/core/services/assessment/employee.service";
import { SeededContract } from "@/app/core/models/contract/seeded-contract.model";

@Component({
  selector: "app-seeded-contracts-table",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PaginationTableComponent,
    SelectSearchComponent,
  ],
  templateUrl: "./seeded-contracts-table.component.html",
})
export class SeededContractsTableComponent {
  service = inject(SeededContractService);
  private readonly employeeService = inject(EmployeeService);

  /** When set, only shows contracts belonging to this contract seeding batch. */
  contractSeedingId = input<string | undefined>();

  baseRsqlQuery = computed(() => {
    const id = this.contractSeedingId();
    return id ? `contractSeeding.id=='${id}'` : "";
  });

  table = viewChild<PaginationTableComponent<SeededContract>>("table");

  columns: TableColumn[] = [
    { key: "contractCode", label: "Código" },
    { key: "internalContractCode", label: "Código interno" },
    { key: "contractType", label: "Tipo" },
    { key: "contractorName", label: "Contratista" },
    { key: "interventorName", label: "Interventor" },
    { key: "employee.name", label: "Empleado" },
    { key: "startDate", label: "Inicio" },
    { key: "endDate", label: "Fin" },
  ];

  editingItem = signal<SeededContract | null>(null);

  form = new FormGroup({
    contractCode: new FormControl("", [Validators.required]),
    contractType: new FormControl("", [Validators.required]),
    contractorName: new FormControl("", [Validators.required]),
  });

  employeeContext = this.employeeService.newSearchSelectEmployeeContext(
    undefined,
    { maxItems: 1, placeholder: "Responsable...", isRequired: true },
  );

  openEdit(item: SeededContract) {
    this.editingItem.set(item);
    this.form.reset({
      contractCode: item.contractCode,
      contractType: item.contractType,
      contractorName: item.contractorName,
    });
    this.employeeContext.clear();
    if (item.employee) {
      this.employeeContext.selectResults([item.employee as any]);
    }
  }

  closeModal() {
    this.editingItem.set(null);
  }

  get canSubmit(): boolean {
    return this.form.valid && this.employeeContext.selectedOptions().length > 0;
  }

  submit() {
    const item = this.editingItem();
    if (!item || !this.canSubmit) return;

    const { contractCode, contractType, contractorName } = this.form.value;
    const employeeId = this.employeeContext.selectedOptions()[0].id as number;

    this.service
      .update(item.id, {
        contractCode: contractCode!,
        contractType: contractType!,
        contractorName: contractorName!,
        employeeId,
      })
      .subscribe({
        next: () => {
          this.closeModal();
          this.table()?.load();
        },
      });
  }
}
