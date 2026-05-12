import { Component, OnInit, inject, signal, computed } from "@angular/core";
import { CommonModule } from "@angular/common";
import { CostCenter } from "@/app/core/models/cost-center/cost-center.models";
import { CostCenterService } from "@/app/core/services/cost-center/cost-center.service";
import {
  DynamicTableComponent,
  TableColumn,
} from "@/app/shared/components/dynamic-table/dynamic-table.component";
import { PaginationComponent } from "@/app/shared/components/pagination/pagination.component";
import { CostCenterModalComponent } from "./cost-center-modal/cost-center-modal.component";
interface BreadcrumbEntry {
  id: number | null;
  label: string;
}

@Component({
  selector: "app-cost-center-dashboard",
  standalone: true,
  imports: [
    CommonModule,
    DynamicTableComponent,
    PaginationComponent,
    CostCenterModalComponent,
  ],
  templateUrl: "./cost-center-dashboard.component.html",
})
export class CostCenterDashboardComponent implements OnInit {
  private readonly service = inject(CostCenterService);

  items = signal<CostCenter[]>([]);
  currentPage = signal(1);
  totalPages = signal(0);
  loading = signal(false);
  pageSize = 10;

  breadcrumb = signal<BreadcrumbEntry[]>([
    { id: null, label: "Centros de Costo" },
  ]);
  currentParentId = computed(() => {
    const crumbs = this.breadcrumb();
    return crumbs[crumbs.length - 1].id;
  });

  isModalOpen = signal(false);
  selectedCostCenter = signal<CostCenter | null>(null);

  columns: TableColumn<CostCenter>[] = [
    { key: "id", label: "ID" },
    { key: "name", label: "Nombre" },
    { key: "managerName", label: "Responsable" },
    { key: "totalBudget", label: "Presupuesto Total" },
    { key: "executedAmount", label: "Ejecutado" },
    { key: "committedAmount", label: "Comprometido" },
  ];

  ngOnInit(): void {
    this.load();
  }

  load(page = 1): void {
    this.loading.set(true);
    const parentId = this.currentParentId();
    const obs$ =
      parentId == null
        ? this.service.findRoots({ page: page - 1, size: this.pageSize })
        : this.service.findAll(
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

  drillDown(cc: CostCenter): void {
    this.breadcrumb.update((crumbs) => [
      ...crumbs,
      { id: cc.id, label: cc.name },
    ]);
    this.load();
  }

  navigateTo(index: number): void {
    this.breadcrumb.update((crumbs) => crumbs.slice(0, index + 1));
    this.load();
  }

  openCreateModal(): void {
    this.selectedCostCenter.set(null);
    this.isModalOpen.set(true);
  }

  openViewModal(cc: CostCenter): void {
    this.selectedCostCenter.set(cc);
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.selectedCostCenter.set(null);
  }

  onSaved(): void {
    this.closeModal();
    this.load(this.currentPage());
  }

  deleteItem(cc: CostCenter): void {
    if (!confirm(`¿Eliminar centro de costo "${cc.name}"?`)) return;
    this.service.delete(cc.id).subscribe({
      next: (res) => {
        if (res.success) this.load(this.currentPage());
      },
    });
  }
}
