import {
  Component,
  OnInit,
  inject,
  input,
  output,
  signal,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  DynamicTableComponent,
  TableColumn,
} from "@/app/shared/components/dynamic-table/dynamic-table.component";
import { PaginationComponent } from "@/app/shared/components/pagination/pagination.component";
import { ContractService } from "@/app/core/services/contract/contract.service";
import { ContractAdditions } from "@/app/core/models/contract/contract.models";

@Component({
  selector: "app-additions-tab",
  standalone: true,
  imports: [CommonModule, DynamicTableComponent, PaginationComponent],
  templateUrl: "./additions-tab.component.html",
})
export class AdditionsTabComponent implements OnInit {
  contractId = input.required<number>();
  onCreate = output<void>();

  private readonly service = inject(ContractService);

  items = signal<ContractAdditions[]>([]);
  currentPage = signal(1);
  totalPages = signal(0);
  loading = signal(false);

  columns: TableColumn[] = [
    { key: "id", label: "ID" },
    { key: "newBasePeriodAmount", label: "Nuevo Monto Base" },
    { key: "description", label: "Descripción" },
    { key: "createdAt", label: "Fecha" },
  ];

  ngOnInit(): void {
    this.load();
  }

  load(page = 1): void {
    this.loading.set(true);
    this.service
      .findAdditions(this.contractId(), { page: page - 1, size: 10 })
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
