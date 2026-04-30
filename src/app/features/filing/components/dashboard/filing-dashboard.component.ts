import { Component, OnInit, inject, signal, computed } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  DynamicTableComponent,
  TableColumn,
} from "../../../../shared/components/dynamic-table/dynamic-table.component";
import { PaginationComponent } from "../../../../shared/components/pagination/pagination.component";
import { FilingModalComponent } from "./filing-modal/filing-modal.component";
import { FilingService } from "../../../../core/services/filing/filing.service";
import { Filing } from "../../../../core/models/filing/filing.models";

interface BreadcrumbEntry {
  id: number | null;
  label: string;
}

@Component({
  selector: "app-filing-dashboard",
  standalone: true,
  imports: [
    CommonModule,
    DynamicTableComponent,
    PaginationComponent,
    FilingModalComponent,
  ],
  templateUrl: "./filing-dashboard.component.html",
})
export class FilingDashboardComponent implements OnInit {
  private readonly filingService = inject(FilingService);

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

  isCreateModalOpen = signal(false);
  selectedFiling = signal<Filing | null>(null);

  columns: TableColumn<Filing>[] = [
    { key: "id", label: "ID" },
    { key: "processName", label: "Proceso" },
    { key: "areaName", label: "Área" },
    { key: "origin", label: "Origen" },
    { key: "destination", label: "Destino" },
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

  openCreateModal(): void {
    this.selectedFiling.set(null);
    this.isCreateModalOpen.set(true);
  }

  openEditModal(filing: Filing): void {
    this.selectedFiling.set(filing);
    this.isCreateModalOpen.set(true);
  }

  closeModal(): void {
    this.isCreateModalOpen.set(false);
    this.selectedFiling.set(null);
  }

  onFilingSaved(): void {
    this.closeModal();
    this.load(this.currentPage());
  }

  onFilingUpdated(updated: Filing): void {
    this.items.update((items) =>
      items.map((f) => (f.id === updated.id ? updated : f)),
    );
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
