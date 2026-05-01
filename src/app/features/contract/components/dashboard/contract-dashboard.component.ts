import { Component, OnInit, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  DynamicTableComponent,
  TableColumn,
} from "../../../../shared/components/dynamic-table/dynamic-table.component";
import { PaginationComponent } from "../../../../shared/components/pagination/pagination.component";
import { ContractModalComponent } from "../contract-modal/contract-modal.component";
import { ContractService } from "../../../../core/services/contract/contract.service";
import { Contract } from "../../../../core/models/contract/contract.models";
import { Router } from "@angular/router";

@Component({
  selector: "app-contract-dashboard",
  standalone: true,
  imports: [
    CommonModule,
    DynamicTableComponent,
    PaginationComponent,
    ContractModalComponent,
  ],
  templateUrl: "./contract-dashboard.component.html",
})
export class ContractDashboardComponent implements OnInit {
  private readonly service = inject(ContractService);
  private readonly router = inject(Router);

  items = signal<Contract[]>([]);
  currentPage = signal(1);
  totalPages = signal(0);
  loading = signal(false);
  pageSize = 10;

  selectedContract = signal<Contract | null>(null);
  isModalOpen = signal(false);

  columns: TableColumn<Contract>[] = [
    { key: "contractId", label: "ID Contrato" },
    { key: "contractType", label: "Tipo" },
    { key: "identification", label: "Cédula" },
    { key: "employeeName", label: "Empleado" },
    { key: "areaName", label: "Área" },
    { key: "status", label: "Estado" },
    { key: "starts", label: "Inicio" },
    { key: "ends", label: "Fin" },
    { key: "basePeriodAmount", label: "Monto Base" },
  ];

  ngOnInit(): void {
    this.load();
  }

  load(page = 1): void {
    this.loading.set(true);
    this.service.findAll({ page: page - 1, size: this.pageSize }).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.items.set(res.data.content);
          this.currentPage.set(res.data.pageable.pageNumber + 1);
          this.totalPages.set(res.data.totalPages);
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onPageChange(page: number): void {
    this.load(page);
  }

  openContract(contract: Contract): void {
    this.selectedContract.set(contract);
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.selectedContract.set(null);
  }

  createContract(type: "employee" | "agency"): void {
    this.router.navigate(["/contracts/create", type]);
  }
}
