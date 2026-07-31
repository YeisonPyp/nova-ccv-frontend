import { CommonModule } from "@angular/common";
import { Component, inject, signal, viewChild } from "@angular/core";
import { PaginationTableComponent } from "@/app/shared/components/pagination-table/pagination-table.component";
import { TableColumn } from "@/app/shared/components/dynamic-table/dynamic-table.component";
import { SeededContractService } from "@/app/core/services/contract/seeded-contract.service";
import { ContractSeedingService } from "@/app/core/services/contract/contract-seeding.service";
import { SeededContract } from "@/app/core/models/contract/seeded-contract.model";
import { ContractSeeding } from "@/app/core/models/contract/contract-seeding.model";

@Component({
  selector: "app-contract-seed-dashboard",
  standalone: true,
  imports: [CommonModule, PaginationTableComponent],
  templateUrl: "./contract-seed-dashboard.component.html",
})
export class ContractSeedDashboardComponent {
  seededContractService = inject(SeededContractService);
  contractSeedingService = inject(ContractSeedingService);

  uploading = signal(false);
  uploadError = signal<string | null>(null);

  seededContractsTable =
    viewChild<PaginationTableComponent<SeededContract>>("seededContractsTable");
  contractSeedingsTable =
    viewChild<PaginationTableComponent<ContractSeeding>>(
      "contractSeedingsTable",
    );

  seededContractsColumns: TableColumn[] = [
    { key: "contractCode", label: "Código" },
    { key: "internalContractCode", label: "Código interno" },
    { key: "contractType", label: "Tipo" },
    { key: "contractorName", label: "Contratista" },
    { key: "interventorName", label: "Interventor" },
    { key: "employee.name", label: "Empleado" },
    { key: "startDate", label: "Inicio" },
    { key: "endDate", label: "Fin" },
  ];

  contractSeedingsColumns: TableColumn[] = [
    { key: "createdAt", label: "Fecha" },
    { key: "addedContracts", label: "Agregados" },
    { key: "updatedContracts", label: "Actualizados" },
    { key: "user.username", label: "Usuario" },
    { key: "pdfObjectName", label: "Archivo PDF" },
  ];

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.uploading.set(true);
    this.uploadError.set(null);
    this.contractSeedingService.seedFromPdf(file).subscribe({
      next: (res) => {
        this.uploading.set(false);
        if (res.success) {
          this.seededContractsTable()?.load();
          this.contractSeedingsTable()?.load();
        }
        input.value = "";
      },
      error: () => {
        this.uploading.set(false);
        this.uploadError.set("No se pudo procesar el archivo PDF.");
        input.value = "";
      },
    });
  }
}
