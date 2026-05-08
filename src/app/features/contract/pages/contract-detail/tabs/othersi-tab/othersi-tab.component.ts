import { Component, OnInit, inject, input, output, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  DynamicTableComponent,
  TableColumn,
} from "../../../../../../shared/components/dynamic-table/dynamic-table.component";
import { PaginationComponent } from "../../../../../../shared/components/pagination/pagination.component";
import { ContractService } from "../../../../../../core/services/contract/contract.service";
import { ContractOthersi } from "../../../../../../core/models/contract/contract.models";

@Component({
  selector: "app-othersi-tab",
  standalone: true,
  imports: [CommonModule, DynamicTableComponent, PaginationComponent],
  templateUrl: "./othersi-tab.component.html",
})
export class OthersiTabComponent implements OnInit {
  contractId = input.required<number>();
  onCreate = output<void>();

  private readonly service = inject(ContractService);

  items = signal<ContractOthersi[]>([]);
  currentPage = signal(1);
  totalPages = signal(0);
  loading = signal(false);

  columns: TableColumn<ContractOthersi>[] = [
    { key: "id", label: "ID" },
    { key: "index", label: "#" },
    { key: "description", label: "Descripción" },
    { key: "executionDate", label: "Fecha Ejecución" },
    { key: "createdAt", label: "Fecha Registro" },
  ];

  ngOnInit(): void {
    this.load();
  }

  load(page = 1): void {
    this.loading.set(true);
    this.service
      .findOthersi(this.contractId(), { page: page - 1, size: 10 })
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
}
