import { Component, inject, input, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router";
import {
  DynamicTableComponent,
  TableColumn,
} from "@/app/shared/components/dynamic-table/dynamic-table.component";
import { PaginatorComponent } from "@/app/shared/components/paginator/paginator.component";
import { ContractAssignmentService } from "@/app/core/services/contract/contract-assignment.service";
import { ContractAssignment } from "@/app/core/models/contract/contract.models";

@Component({
  selector: "app-assignments-tab",
  standalone: true,
  imports: [CommonModule, DynamicTableComponent, PaginatorComponent],
  templateUrl: "./assignments-tab.component.html",
})
export class AssignmentsTabComponent implements OnInit {
  contractId = input.required<number>();

  private readonly service = inject(ContractAssignmentService);
  private readonly router = inject(Router);

  items = signal<ContractAssignment[]>([]);
  currentPage = signal(1);
  totalPages = signal(0);
  pageSize = signal(10);
  loading = signal(false);

  columns: TableColumn[] = [
    { key: "id", label: "ID" },
    { key: "name", label: "Nombre" },
    { key: "status", label: "Estado" },
    { key: "dueAt", label: "Vencimiento" },
  ];

  ngOnInit(): void {
    this.load();
  }

  load(page = 1): void {
    this.loading.set(true);
    this.service
      .findByContractId(this.contractId(), {
        page: page - 1,
        size: this.pageSize(),
      })
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

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.load(1);
  }

  viewAssignment(item: ContractAssignment): void {
    this.router.navigate(["/contracts/assignment", item.id]);
  }
}
