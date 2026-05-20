import { Component, inject, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router";
import { BillingService } from "@/app/core/services/billing/billing.service";
import { BillingAccount } from "@/app/core/models/billing/billing-account.model";
import {
  DynamicTableComponent,
  TableColumn,
} from "@/app/shared/components/dynamic-table/dynamic-table.component";
import { PaginationComponent } from "@/app/shared/components/pagination/pagination.component";

@Component({
  selector: "app-billing-dashboard",
  standalone: true,
  imports: [CommonModule, DynamicTableComponent, PaginationComponent],
  templateUrl: "./billing-dashboard.component.html",
})
export class BillingDashboardComponent implements OnInit {
  private readonly service = inject(BillingService);
  private readonly router = inject(Router);

  accounts = signal<BillingAccount[]>([]);
  currentPage = signal(1);
  totalPages = signal(0);
  pageSize = 20;
  loading = signal(false);

  columns: TableColumn[] = [
    { key: "id", label: "ID" },
    { key: "contractId", label: "Contrato" },
    { key: "employeeName", label: "Empleado" },
    { key: "costCenterName", label: "Centro de Costo" },
    { key: "amount", label: "Monto" },
    { key: "status", label: "Estado" },
    { key: "receivedAt", label: "Recibida" },
  ];

  ngOnInit(): void {
    this.load();
  }

  load(page = 1): void {
    this.loading.set(true);
    this.service.findAll(page - 1, this.pageSize).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.accounts.set(res.data.content);
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

  openDetail(account: BillingAccount): void {
    this.router.navigate(["/billing/detail", account.id]);
  }

  openCreate(): void {
    this.router.navigate(["/billing/create"]);
  }
}
