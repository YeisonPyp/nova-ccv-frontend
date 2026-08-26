import { Component, OnInit, inject, input, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  DynamicTableComponent,
  TableColumn,
} from "@/app/shared/components/dynamic-table/dynamic-table.component";
import { PaginationComponent } from "@/app/shared/components/pagination/pagination.component";
import { ContractPendingProcess } from "@/app/core/models/contract/contract.models";
import { ContractPendingProcessService } from "@/app/core/services/contract/contract-pending-process.service";
import { Router } from "@angular/router";

@Component({
  selector: "app-pending-process-tab",
  standalone: true,
  imports: [CommonModule, DynamicTableComponent, PaginationComponent],
  templateUrl: "./pending-process-tab.component.html",
})
export class PendingProcessTabComponent implements OnInit {
  contractId = input.required<number>();
  private readonly router = inject(Router);

  private readonly service = inject(ContractPendingProcessService);

  items = signal<ContractPendingProcess[]>([]);
  currentPage = signal(1);
  totalPages = signal(0);
  loading = signal(false);

  columns: TableColumn[] = [
    { key: "name", label: "Nombre" },
    { key: "processType", label: "Tipo de proceso" },
    { key: "createdAt", label: "Fecha Creación" },
  ];

  ngOnInit(): void {
    this.load();
  }

  load(page = 1): void {
    this.loading.set(true);
    this.service
      .findByContractId(this.contractId(), { page: page - 1, size: 10 })
      .subscribe({
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

  openContract(item: ContractPendingProcess): void {
    this.router.navigate(["/contracts", this.contractId(), "process", item.id]);
  }
}
