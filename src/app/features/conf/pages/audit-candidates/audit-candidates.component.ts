import { Component, inject, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router";
import { AuditCandidatesService } from "../../../../core/services/audit-candidates.service";
import { AuditCandidate } from "../../../../core/models/audit/audit-candidate.model";
import {
  DynamicTableComponent,
  TableColumn,
} from "../../../../shared/components/dynamic-table/dynamic-table.component";
import { PaginatorComponent } from "../../../../shared/components/paginator/paginator.component";

@Component({
  selector: "app-audit-candidates",
  standalone: true,
  imports: [CommonModule, DynamicTableComponent, PaginatorComponent],
  templateUrl: "./audit-candidates.component.html",
})
export class AuditCandidatesComponent implements OnInit {
  private readonly service = inject(AuditCandidatesService);
  private readonly router = inject(Router);

  candidates = signal<AuditCandidate[]>([]);
  currentPage = signal(1);
  totalPages = signal(0);
  pageSize = signal(20);
  loading = signal(false);

  columns: TableColumn<AuditCandidate>[] = [
    { key: "id", label: "ID" },
    { key: "name", label: "Nombre" },
    { key: "tableName", label: "Tabla" },
    { key: "description", label: "Descripción" },
  ];

  ngOnInit(): void {
    this.load();
  }

  load(page = 1): void {
    this.loading.set(true);
    this.service.getCandidates(page - 1, this.pageSize()).subscribe({
      next: (res) => {
        this.candidates.set(res.content);
        this.currentPage.set(res.pageable.pageNumber + 1);
        this.totalPages.set(res.totalPages);
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

  toggleEnabled(candidate: AuditCandidate): void {
    const next = !candidate.isEnabled;
    this.service.updateCandidate(candidate.id, next).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.candidates.update((list) =>
            list.map((c) =>
              c.id === candidate.id ? { ...c, isEnabled: next } : c,
            ),
          );
        }
      },
    });
  }

  viewLogs(candidate: AuditCandidate): void {
    this.router.navigate(["/conf/audit-logs", candidate.tableName]);
  }
}
