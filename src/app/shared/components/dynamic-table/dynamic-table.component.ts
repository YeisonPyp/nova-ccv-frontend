import {
  Component,
  computed,
  ContentChild,
  input,
  output,
  signal,
  TemplateRef,
  WritableSignal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { toObservable } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, map } from 'rxjs';
import type { ExpressionNode } from '@rsql/ast';
import { FilterRow } from './filter-section/filter-section.component';
import { NestedValuePipe } from '../../pipes/nested-value.pipe';
import { DynamicTableExporterComponent } from './dynamic-table-exporter/dynamic-table-exporter.component';
import { FormsModule } from '@angular/forms';
import {
  buildRsqlPredicate,
  coerceFilterValue,
} from '../../utils/rsql-predicate.util';

export type FilterOperator = 'eq' | 'ne' | 'lt' | 'lte' | 'gt' | 'gte' | 'lk';

export interface TableColumn {
  key: string;
  label: string;
  valueCallBack?: (item: any) => any;

  filterSet?: {
    /**
     * the value type to build filter
     */
    valueType:
      | 'text'
      | 'number'
      | 'date'
      | 'checkbox'
      | 'email'
      | 'time'
      | 'month'
      | 'week'
      | 'datetime-local'
      | 'tel';

    onValue?: WritableSignal<String>;

    /**
     * Shows a quick search box for this column without requiring `onValue`.
     * The table tracks its value internally and reports it (debounced,
     * combined with the other columns' values) through `searchChange`.
     */
    search?: boolean;

    /**
     * Operator used to build the RSQL predicate for this column's quick
     * search box. Defaults to `lk` (contains) for text-like value types and
     * `eq` for the rest.
     */
    operator?: FilterOperator;

    /**
     * The available operators
     */
    operators?: FilterOperator[];
    /**
     * filters to be applied
     */
    filters?: FilterRow[];
  };
}

const TEXT_LIKE_VALUE_TYPES = new Set(['text', 'email', 'tel']);

@Component({
  selector: 'app-dynamic-table',
  standalone: true,
  imports: [
    CommonModule,
    NestedValuePipe,
    DynamicTableExporterComponent,
    FormsModule,
  ],
  templateUrl: './dynamic-table.component.html',
  styleUrl: './dynamic-table.component.scss',
})
export class DynamicTableComponent<T> {
  data = input.required<T[]>();
  columns = input.required<TableColumn[]>();
  emptyMessage = input<string>('No hay datos disponibles.');
  exportable = input<boolean>(true);
  searchDebounce = input<number>(400);

  /**
   * Emits the combined RSQL predicates for every column with an active quick
   * search value, debounced. Ready to pass straight into `PageableQuery.nodes`.
   */
  searchChange = output<ExpressionNode[]>();

  hasFilters = computed(() => this.columns().some((c) => !!c.filterSet));

  hasActiveSearch = computed(() =>
    Object.values(this.searchValues()).some((v) => !!v),
  );

  private readonly searchValues = signal<Record<string, string>>({});

  @ContentChild('actions') actionsTemplate?: TemplateRef<any>;
  @ContentChild('customCell') customCellTemplate?: TemplateRef<any>;

  constructor() {
    toObservable(this.searchValues)
      .pipe(
        debounceTime(this.searchDebounce()),
        distinctUntilChanged(
          (prev, curr) => JSON.stringify(prev) === JSON.stringify(curr),
        ),
        map((values) => this.buildSearchNodes(values)),
      )
      .subscribe((nodes) => this.searchChange.emit(nodes));
  }

  showsSearchBox(col: TableColumn): boolean {
    return !!col.filterSet && !!(col.filterSet.onValue || col.filterSet.search);
  }

  columnSearchValue(col: TableColumn): string {
    if (col.filterSet?.onValue)
      return (col.filterSet.onValue() as string) ?? '';
    return this.searchValues()[col.key] ?? '';
  }

  onColumnSearch(col: TableColumn, value: string): void {
    if (!this.isSpecial(value)) {
      this.searchValues.update((values) => ({ ...values, [col.key]: value }));
    }
    col.filterSet?.onValue?.set(value as any);
  }

  clearColumnSearch(col: TableColumn): void {
    this.onColumnSearch(col, '');
  }

  clearAllSearches(): void {
    this.searchValues.set({});
  }

  isSpecial(value: string): boolean {
    return (
      /^[^\p{L}\p{N}]+$/u.test(value) ||
      value === undefined ||
      value === null ||
      value === '' ||
      value.trim() === ''
    );
  }

  private buildSearchNodes(values: Record<string, string>): ExpressionNode[] {
    const nodes: ExpressionNode[] = [];
    for (const col of this.columns()) {
      const raw = values[col.key];
      if (!col.filterSet || this.isSpecial(raw)) {
        continue;
      }
      const operator =
        col.filterSet.operator ??
        (TEXT_LIKE_VALUE_TYPES.has(col.filterSet.valueType) ? 'lk' : 'eq');
      const value = coerceFilterValue(raw, col.filterSet.valueType);
      nodes.push(buildRsqlPredicate(col.key, operator, value));
    }
    return nodes;
  }
}
