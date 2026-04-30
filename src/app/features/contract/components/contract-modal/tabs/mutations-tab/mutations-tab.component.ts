import { Component, OnInit, inject, input, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  DynamicTableComponent,
  TableColumn,
} from "../../../../../../shared/components/dynamic-table/dynamic-table.component";
import { PaginationComponent } from "../../../../../../shared/components/pagination/pagination.component";
import { ContractService } from "../../../../../../core/services/contract/contract.service";
import { ContractMutation } from "../../../../../../core/models/contract/contract.models";

@Component({
  selector: "app-mutations-tab",
  standalone: true,
  imports: [CommonModule, DynamicTableComponent, PaginationComponent],
  templateUrl: "./mutations-tab.component.html",
})
export class MutationsTabComponent implements OnInit {
  contractId = input.required<number>();

  private readonly service = inject(ContractService);

  items = signal<ContractMutation[]>([]);
  currentPage = signal(1);
  totalPages = signal(0);
  loading = signal(false);

  columns: TableColumn<ContractMutation>[] = [
    { key: "id", label: "ID" },
    { key: "opName", label: "Operación" },
    { key: "createdAt", label: "Fecha" },
    { key: "createdById", label: "Creado por" },
  ];

  ngOnInit(): void {
    this.load();
  }

  load(page = 1): void {
    this.loading.set(true);
    this.service
      .findMutations(this.contractId(), { page: page - 1, size: 10 })
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
