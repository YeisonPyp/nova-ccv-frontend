import { Component, OnInit, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  DynamicTableComponent,
  TableColumn,
} from "@/app/shared/components/dynamic-table/dynamic-table.component";
import { ContractService } from "@/app/core/services/contract/contract.service";
import { Contract } from "@/app/core/models/contract/contract.models";
import { Router } from "@angular/router";
import { PaginationTableComponent } from "@/app/shared/components/pagination-table/pagination-table.component";

@Component({
  selector: "app-contract-dashboard",
  standalone: true,
  imports: [CommonModule, PaginationTableComponent],
  templateUrl: "./contract-dashboard.component.html",
})
export class ContractDashboardComponent {
  service = inject(ContractService);
  private readonly router = inject(Router);

  items = signal<Contract[]>([]);
  currentPage = signal(1);
  totalPages = signal(0);
  loading = signal(false);
  pageSize = 10;

  columns: TableColumn[] = [
    { key: "contractId", label: "ID Contrato" },
    { key: "contractType", label: "Tipo" },
    { key: "identification", label: "Cédula" },
    { key: "employeeName", label: "Empleado" },
    { key: "areaName", label: "Área" },
    {
      key: "status",
      label: "Estado",
      filterSet: { valueType: "text", operators: ["eq", "ne"] },
    },
    { key: "starts", label: "Inicio" },
    { key: "ends", label: "Fin" },
    { key: "basePeriodAmount", label: "Monto Base" },
  ];

  openContract(contract: Contract): void {
    this.router.navigate(["/contracts", contract.id]);
  }

  createContract(type: "employee" | "agency"): void {
    this.router.navigate(["/contracts/create", type]);
  }
}
