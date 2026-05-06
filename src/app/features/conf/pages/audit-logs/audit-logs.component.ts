import { Component, inject, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, Router } from "@angular/router";
import { FormBuilder, ReactiveFormsModule } from "@angular/forms";
import { AuditCandidatesService } from "../../../../core/services/audit-candidates.service";
import { AuditLog } from "../../../../core/models/audit/audit-log.model";
import {
  DynamicTableComponent,
  TableColumn,
} from "../../../../shared/components/dynamic-table/dynamic-table.component";
import { PaginatorComponent } from "../../../../shared/components/paginator/paginator.component";

@Component({
  selector: "app-audit-logs",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DynamicTableComponent,
    PaginatorComponent,
  ],
  templateUrl: "./audit-logs.component.html",
})
export class AuditLogsComponent implements OnInit {
  private readonly service = inject(AuditCandidatesService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  logs = signal<AuditLog[]>([]);
  currentPage = signal(1);
  totalPages = signal(0);
  pageSize = signal(20);
  loading = signal(false);
  searched = signal(false);

  entityName = signal<string | undefined>(undefined);

  filterForm = this.fb.group({
    op: ["UPDATE"],
    userId: [null as number | null],
  });

  columns: TableColumn<AuditLog>[] = [
    { key: "id", label: "ID" },
    { key: "op", label: "Operación" },
    { key: "userId", label: "Usuario" },
    { key: "ipAddress", label: "IP" },
    { key: "createdAt", label: "Fecha" },
    { key: "oldRegistry", label: "Valor anterior" },
    { key: "newRegistry", label: "Valor nuevo" },
  ];

  ngOnInit(): void {
    const name = this.route.snapshot.paramMap.get("entityName") ?? undefined;
    this.entityName.set(name);
  }

  search(page = 1): void {
    if (this.filterForm.invalid) {
      this.filterForm.markAllAsTouched();
      return;
    }
    const { op, userId } = this.filterForm.value;
    this.loading.set(true);
    this.service
      .findLogs({
        entityName: this.entityName(),
        op: op ?? undefined,
        userId: userId ?? undefined,
        page: page - 1,
        size: this.pageSize(),
      })
      .subscribe({
        next: (res) => {
          this.logs.set(res.content);
          this.currentPage.set(res.pageable.pageNumber + 1);
          this.totalPages.set(res.totalPages);
          this.loading.set(false);
          this.searched.set(true);
        },
        error: () => this.loading.set(false),
      });
  }

  onPageChange(page: number): void {
    this.search(page);
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.search(1);
  }

  goBack(): void {
    this.router.navigate(["/conf/audit-candidates"]);
  }
}
