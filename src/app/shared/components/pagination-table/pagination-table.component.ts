import {
  Component,
  ContentChild,
  effect,
  input,
  OnDestroy,
  OnInit,
  signal,
  TemplateRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  DynamicTableComponent,
  TableColumn,
} from '../dynamic-table/dynamic-table.component';
import { PageableQuery } from '../../pageable-query';
import { Observable, Subscription } from 'rxjs';
import { ApiResponse } from '@/app/core/models/api-response.model';
import { APIPage } from '@/app/core/models/api-page.model';
import {
  FilterRow,
  FilterSectionComponent,
} from '../dynamic-table/filter-section/filter-section.component';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';
import { PaginatorComponent } from '../paginator/paginator.component';

export interface PageableQueryWithRsql extends PageableQuery {
  rsqlQuery?: string;
}
export interface FilterServiceSpec {
  /**
   * Find all resources using pagination and filters.
   * @param pageable Pagination query parameters
   * @param rsql RSQL query string to apply
   */
  findAll(
    pageable: PageableQueryWithRsql,
  ): Observable<ApiResponse<APIPage<any>>>;
}

@Component({
  selector: 'app-pagination-table',
  standalone: true,
  imports: [
    CommonModule,
    DynamicTableComponent,
    PaginatorComponent,
    FilterSectionComponent,
    LoadingSpinnerComponent,
  ],
  templateUrl: './pagination-table.component.html',
})
export class PaginationTableComponent<T = any> implements OnInit, OnDestroy {
  service = input.required<FilterServiceSpec>();
  tableColumns = input.required<TableColumn[]>();
  pageSize = input(15);

  showFilterSection = input(true);
  /** Fixed RSQL predicate always ANDed with whatever the filter section builds. */
  baseRsqlQuery = input<string>('');
  filterRows = signal<FilterRow[]>([]);
  $pageSize = signal(15);

  @ContentChild('actions') actionsTemplate?: TemplateRef<any>;
  @ContentChild('customCell') customCellTemplate?: TemplateRef<any>;

  items = signal<T[]>([]);
  currentPage = signal(1);
  totalPages = signal(0);
  loading = signal(false);

  onSaveSubscription?: Subscription;

  ngOnDestroy(): void {
    this.onSaveSubscription?.unsubscribe();
  }

  rsqlQuery = signal('');

  constructor() {
    effect(() => {
      this.loading.set(true);

      const base = this.baseRsqlQuery();
      const filter = this.rsqlQuery();
      const rsqlQuery = base && filter ? `${base};${filter}` : base || filter;

      this.service()
        .findAll({
          page: this.currentPage() - 1,
          size: this.$pageSize(),
          rsqlQuery,
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
    });
  }

  ngOnInit(): void {
    const baseFilters = this.tableColumns().reduce((acc, r) => {
      if (r.filterSet?.filters) {
        acc.push(...r.filterSet.filters);
      }
      return acc;
    }, [] as FilterRow[]);
    this.$pageSize.set(this.pageSize());
    this.filterRows.set(baseFilters);
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
  }

  onFilterChange(query: string) {
    if (query) {
      this.rsqlQuery.set(query);
    }
  }

  onAddFilterRow(row: FilterRow) {
    this.filterRows.update((rows) => [...rows, row]);
  }

  onRemoveFilterRow(index: number) {
    this.filterRows.update((rows) => rows.filter((_, i) => i !== index));
  }

  onUpdateFilterRow(index: number, row: FilterRow) {
    this.filterRows.update((rows) =>
      rows.map((r, i) => (i === index ? row : r)),
    );
  }

  onClearFilters() {
    this.filterRows.set([]);
    this.rsqlQuery.set('');
  }
}
