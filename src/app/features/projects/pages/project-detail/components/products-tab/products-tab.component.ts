import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import {
  ProjectProduct,
  ProjectProductService,
} from '@/app/core/services/projects/project-product.service';
import { ProductFormModalComponent } from './product-form-modal/product-form-modal.component';
import {
  DynamicTableComponent,
  TableColumn,
} from '@/app/shared/components/dynamic-table/dynamic-table.component';
import { LoadingSpinnerComponent } from '@/app/shared/components/loading-spinner/loading-spinner.component';
import { ProjectSectionCardComponent } from '../project-section-card/project-section-card.component';

/**
 * Products of a project. Reused in two contexts:
 *  - project detail: pass [projectId] -> lists (and lets you create) products.
 *  - PAT dashboard: pass [year] -> lists products of every project of the year.
 * Year takes precedence; if year is null, the project is used.
 */
@Component({
  selector: 'app-project-products-tab',
  standalone: true,
  imports: [
    CommonModule,
    ProductFormModalComponent,
    DynamicTableComponent,
    LoadingSpinnerComponent,
    ProjectSectionCardComponent,
  ],
  templateUrl: './products-tab.component.html',
})
export class ProductsTabComponent {
  private readonly service = inject(ProjectProductService);

  projectId = input<number | undefined>(undefined);
  year = input<number | null | undefined>(undefined);

  columns = computed<TableColumn[]>(() => {
    const base: TableColumn[] = [
      { key: 'code', label: 'Código' },
      { key: 'name', label: 'Nombre' },
      { key: 'projectName', label: 'Proyecto' },
      { key: 'unitMeasure', label: 'Unidad' },
      { key: 'targetQuantity', label: 'Meta' },
    ];
    if (this.byYear()) {
      base.push({ key: 'projectName', label: 'Proyecto' });
    }
    return base;
  });

  products = signal<ProjectProduct[]>([]);
  loading = signal(false);

  /** Year mode = read-only list across projects. */
  byYear = computed(() => this.year() != null);
  canManage = computed(() => !this.byYear() && !!this.projectId());

  // create modal
  modalOpen = signal(false);

  constructor() {
    effect(() => {
      const year = this.year();
      const projectId = this.projectId();
      if (year != null) {
        this.loadByYear(year);
      } else if (projectId != null) {
        this.loadByProject(projectId);
      }
    });
  }

  private loadByProject(projectId: number) {
    this.loading.set(true);
    this.service.findByProject(projectId).subscribe({
      next: (res) => {
        this.products.set(res.data ?? []);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  private loadByYear(year: number) {
    this.loading.set(true);
    this.service.findByYear(year).subscribe({
      next: (res) => {
        this.products.set(res.data ?? []);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  private reload() {
    const projectId = this.projectId();
    if (projectId != null) this.loadByProject(projectId);
  }

  openCreate() {
    if (!this.projectId()) return;
    this.modalOpen.set(true);
  }

  closeModal() {
    this.modalOpen.set(false);
  }

  onSaved() {
    this.modalOpen.set(false);
    this.reload();
  }

  remove(p: ProjectProduct) {
    if (!confirm(`¿Eliminar el producto "${p.name}"?`)) return;
    this.service.delete(p.id).subscribe((res) => {
      if (res.success) {
        const year = this.year();
        if (year != null) this.loadByYear(year);
        else this.reload();
      }
    });
  }
}
