import { Component, OnInit, inject, signal, computed } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  DynamicTableComponent,
  TableColumn,
} from "@/app/shared/components/dynamic-table/dynamic-table.component";
import { PaginationComponent } from "@/app/shared/components/pagination/pagination.component";
import { FilingService } from "@/app/core/services/filing/filing.service";
import { Filing } from "@/app/core/models/filing/filing.models";
import { Router } from "@angular/router";

interface BreadcrumbEntry {
  id: number | null;
  label: string;
}

@Component({
  selector: "app-filing-dashboard",
  standalone: true,
  imports: [CommonModule, DynamicTableComponent, PaginationComponent],
  templateUrl: "./filing-dashboard.component.html",
})
export class FilingDashboardComponent implements OnInit {
  private readonly filingService = inject(FilingService);
  private readonly router = inject(Router);

  items = signal<Filing[]>([]);
  currentPage = signal(1);
  totalPages = signal(0);
  loading = signal(false);
  pageSize = 10;

  breadcrumb = signal<BreadcrumbEntry[]>([{ id: null, label: "Radicados" }]);
  currentParentId = computed(() => {
    const crumbs = this.breadcrumb();
    return crumbs[crumbs.length - 1].id;
  });

  columns: TableColumn[] = [
    { key: "id", label: "ID" },
    { key: "processName", label: "Proceso" },
    { key: "areaName", label: "Área" },
    { key: "createdAt", label: "Fecha" },
  ];

  ngOnInit(): void {
    this.load();
  }

  load(page = 1): void {
    this.loading.set(true);
    const parentId = this.currentParentId();
    const obs$ =
      parentId == null
        ? this.filingService.findRoots({ page: page - 1, size: this.pageSize })
        : this.filingService.findAll(
            { page: page - 1, size: this.pageSize },
            parentId,
          );

    obs$.subscribe({
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

  drillDown(filing: Filing): void {
    this.breadcrumb.update((crumbs) => [
      ...crumbs,
      { id: filing.id, label: `#${filing.id}` },
    ]);
    this.load();
  }

  navigateTo(index: number): void {
    this.breadcrumb.update((crumbs) => crumbs.slice(0, index + 1));
    this.load();
  }

  openCreate(): void {
    const parentId = this.currentParentId();
    const extras = parentId != null ? { queryParams: { parentId } } : {};
    this.router.navigate(["/filings/create"], extras);
  }

  openEdit(filing: Filing): void {
    this.router.navigate(["/filings", filing.id]);
  }

  deleteItem(filing: Filing): void {
    if (!confirm(`¿Eliminar radicado #${filing.id}?`)) return;
    this.filingService.delete(filing.id).subscribe({
      next: (res) => {
        if (res.success) this.load(this.currentPage());
      },
    });
  }
}
