import { Component, OnInit, inject, signal, computed } from "@angular/core";
import { CostCenterDashboardComponent } from "@/app/features/cost-center/pages/cost-center-dashboard.component";
import { CommonModule } from "@angular/common";
import { ParametrizationSectionComponent } from "@/app/features/conf/components/parametrization-section.component";
import { CostCenter } from "@/app/core/models/cost-center/cost-center.models";
import { CostCenterService } from "@/app/core/services/cost-center/cost-center.service";
import {
  DynamicTableComponent,
  TableColumn,
} from "@/app/shared/components/dynamic-table/dynamic-table.component";
import { PaginationComponent } from "@/app/shared/components/pagination/pagination.component";
import { CostCenterModalComponent } from "@/app/features/cost-center/pages/cost-center-modal/cost-center-modal.component";

interface BreadcrumbEntry {
  id: number | null;
  label: string;
}

@Component({
  selector: "app-cost-center-param",
  standalone: true,
  imports: [
    CommonModule,
    ParametrizationSectionComponent,
    DynamicTableComponent,
    PaginationComponent,
    CostCenterModalComponent,
  ],
  template: `
    <app-parametrization-section
      title="Centros de Costo"
      [canCreate]="true"
      createLabel="+ Nuevo centro de costo"
      (onCreate)="openCreateModal()"
      (onOpen)="onOpen($event)"
    >
      @if (isOpen()) {
        <div class="w-full mt-4">
          <!-- Breadcrumb -->
          <nav class="flex items-center gap-2 mb-4 text-sm">
            @for (
              crumb of breadcrumb();
              track crumb.id;
              let i = $index;
              let last = $last
            ) {
              @if (!last) {
                <button
                  class="text-indigo-600 hover:text-indigo-900 underline"
                  (click)="navigateTo(i)"
                >
                  {{ crumb.label }}
                </button>
                <span class="text-gray-400">/</span>
              } @else {
                <span class="font-semibold text-gray-700">{{
                  crumb.label
                }}</span>
              }
            }
          </nav>

          <!-- Table -->
          @if (loading()) {
            <div class="text-center py-4">
              <div
                class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent text-indigo-600 motion-reduce:animate-[spin_1.5s_linear_infinite]"
                role="status"
              >
                <span class="sr-only">Cargando...</span>
              </div>
            </div>
          } @else {
            <app-dynamic-table
              [data]="items()"
              [columns]="columns"
              emptyMessage="No hay centros de costo en este nivel."
            >
              <ng-template #actions let-item>
                <button
                  class="icon-btn text-indigo-600 hover:text-indigo-900 mr-2"
                  title="Ver detalle"
                  (click)="openViewModal(item)"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                </button>
                <button
                  class="icon-btn text-gray-600 hover:text-gray-900 mr-2"
                  title="Ver sub-centros"
                  (click)="drillDown(item)"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
                <button
                  class="icon-btn text-red-600 hover:text-red-900"
                  title="Eliminar"
                  (click)="deleteItem(item)"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </ng-template>
            </app-dynamic-table>

            <app-pagination
              [currentPage]="currentPage()"
              [pages]="totalPages()"
              (pageChange)="onPageChange($event)"
            />
          }
        </div>
      }
    </app-parametrization-section>

    <app-cost-center-modal
      [isOpen]="isModalOpen()"
      [costCenter]="selectedCostCenter()"
      [parentId]="currentParentId()"
      (onClose)="closeModal()"
      (onSaved)="onSaved()"
    />
  `,
})
export class CostCenterParamComponent {
  private readonly service = inject(CostCenterService);

  isOpen = signal(false);

  items = signal<CostCenter[]>([]);
  currentPage = signal(1);
  totalPages = signal(0);
  loading = signal(false);
  pageSize = 10;

  breadcrumb = signal<BreadcrumbEntry[]>([{ id: null, label: "Raíz" }]);

  currentParentId = computed(() => {
    const crumbs = this.breadcrumb();
    return crumbs[crumbs.length - 1].id;
  });

  isModalOpen = signal(false);
  selectedCostCenter = signal<CostCenter | null>(null);

  columns: TableColumn[] = [
    { key: "id", label: "ID" },
    { key: "name", label: "Nombre" },
    { key: "managerName", label: "Responsable" },
    { key: "totalBudget", label: "Presupuesto Total" },
    { key: "executedAmount", label: "Ejecutado" },
    { key: "committedAmount", label: "Comprometido" },
  ];

  onOpen(open: boolean) {
    this.isOpen.set(open);
    if (open && this.items().length === 0) {
      this.load();
    }
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
