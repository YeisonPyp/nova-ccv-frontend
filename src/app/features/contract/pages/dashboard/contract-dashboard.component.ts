import { Component, OnInit, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  DynamicTableComponent,
  TableColumn,
} from "@/app/shared/components/dynamic-table/dynamic-table.component";
import { PaginationComponent } from "@/app/shared/components/pagination/pagination.component";
import { ContractService } from "@/app/core/services/contract/contract.service";
import { Contract } from "@/app/core/models/contract/contract.models";
import { Router } from "@angular/router";

@Component({
  selector: "app-contract-dashboard",
  standalone: true,
  imports: [CommonModule, DynamicTableComponent, PaginationComponent],
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
    this.router.navigate(["/contracts", contract.id]);
  }

  createContract(type: "employee" | "agency"): void {
    this.router.navigate(["/contracts/create", type]);
  }
}
