import {
  Component,
  ContentChild,
  effect,
  input,
  OnDestroy,
  OnInit,
  signal,
  TemplateRef,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  DynamicTableComponent,
  TableColumn,
} from "../dynamic-table/dynamic-table.component";
import { PaginationComponent } from "../pagination/pagination.component";
import { PageableQuery } from "../../pageable-query";
import { Observable, Subscription } from "rxjs";
import { ApiResponse } from "@/app/core/models/api-response.model";
import { APIPage } from "@/app/core/models/api-page.model";
import {
  FilterRow,
  FilterSectionComponent,
} from "../dynamic-table/filter-section/filter-section.component";
import { FilterServiceSpecImpl } from "../../services/filter-service-spec.service";

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
  selector: "app-pagination-table",
  standalone: true,
  imports: [
    CommonModule,
    DynamicTableComponent,
    PaginationComponent,
    FilterSectionComponent,
  ],
  templateUrl: "./pagination-table.component.html",
})
export class PaginationTableComponent<T = any> implements OnInit, OnDestroy {
  service = input.required<FilterServiceSpec>();
  tableColumns = input.required<TableColumn[]>();
  filterRows = signal<FilterRow[]>([]);
  executeLoad = input<boolean | null>(null);

  @ContentChild("actions") actionsTemplate?: TemplateRef<any>;
  @ContentChild("customCell") customCellTemplate?: TemplateRef<any>;

  items = signal<T[]>([]);
  currentPage = signal(1);
  totalPages = signal(0);
  loading = signal(false);

  onSaveSubscription?: Subscription;

  constructor() {
    effect(() => {
      if (this.executeLoad()) {
        console.log("execute loading from executeLoad signal");
        this.load(this.currentPage());
      }
    });
  }

  ngOnDestroy(): void {
    this.onSaveSubscription?.unsubscribe();
  }

  rsqlQuery = signal("");

  ngOnInit(): void {
    const baseFilters = this.tableColumns().reduce((acc, r) => {
      if (r.filterSet?.filters) {
        acc.push(...r.filterSet.filters);
      }
      return acc;
    }, [] as FilterRow[]);
    this.filterRows.set(baseFilters);
    // no cargar cuando hay filtros iniciales
    // pues en caso de hacerlo, se harían dos peticiones
    // una que sería ésta y la otra en `onFilterChange`
    if (!baseFilters.length && this.executeLoad()) {
      this.load();
    }
  }

  load(page = 1) {
    this.loading.set(true);

    this.service()
      .findAll({ page: page - 1, size: 10, rsqlQuery: this.rsqlQuery() })
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

  onPageChange(page: number) {
    this.load(page);
  }

  onFilterChange(query: string) {
    if (query) {
      this.rsqlQuery.set(query);
      this.load(this.currentPage());
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
    this.rsqlQuery.set("");
    this.load(this.currentPage());
  }
}
