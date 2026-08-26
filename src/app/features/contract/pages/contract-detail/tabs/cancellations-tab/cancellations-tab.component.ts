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
import { ContractCancellation } from "@/app/core/models/contract/contract.models";

@Component({
  selector: "app-cancellations-tab",
  standalone: true,
  imports: [CommonModule, DynamicTableComponent, PaginationComponent],
  templateUrl: "./cancellations-tab.component.html",
})
export class CancellationsTabComponent implements OnInit {
  contractId = input.required<number>();
  onCreate = output<void>();

  private readonly service = inject(ContractService);

  items = signal<ContractCancellation[]>([]);
  currentPage = signal(1);
  totalPages = signal(0);
  loading = signal(false);

  columns: TableColumn[] = [
    { key: "id", label: "ID" },
    { key: "cancelationTypeName", label: "Tipo" },
    { key: "cancellationDate", label: "Fecha Cancelación" },
    { key: "indemnityAmount", label: "Indemnización" },
    { key: "penaltyAmount", label: "Penalización" },
    { key: "createdAt", label: "Fecha Registro" },
  ];

  ngOnInit(): void {
    this.load();
  }

  load(page = 1): void {
    this.loading.set(true);
    this.service
      .findCancellations(this.contractId(), { page: page - 1, size: 10 })
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
