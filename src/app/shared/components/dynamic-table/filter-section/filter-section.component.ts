import { Component, computed, input, output } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import builder from "@rsql/builder";
import { emit } from "@rsql/emitter";
import type { ExpressionNode } from "@rsql/ast";
import { FilterOperator, TableColumn } from "../dynamic-table.component";
import { toObservable } from "@angular/core/rxjs-interop";
import { debounceTime, distinctUntilChanged, tap } from "rxjs";

export type LogicalConnector = "and" | "or";

export interface FilterRow {
  field: string;
  operator: FilterOperator;
  value: string;
  connector: LogicalConnector;
}

const OPERATOR_LABEL: Record<FilterOperator, string> = {
  eq: "=",
  ne: "≠",
  lt: "<",
  lte: "≤",
  gt: ">",
  gte: "≥",
  lk: "contiene",
};

@Component({
  selector: "app-filter-section",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./filter-section.component.html",
  styleUrl: "./filter-section.component.scss",
})
export class FilterSectionComponent {
  columns = input.required<TableColumn[]>();
  filterChange = output<string>();
  rows = input.required<FilterRow[]>();

  onUpdateRow = output<{ index: number; row: FilterRow }>();
  onRemoveRow = output<number>();
  onAddRow = output<FilterRow>();
  onClearFilter = output<void>();

  readonly operatorLabel = OPERATOR_LABEL;

  filterableColumns = computed(() =>
    this.columns().filter((c) => !!c.filterSet),
  );

  constructor() {
    toObservable(this.rows)
      .pipe(
        distinctUntilChanged(),
        debounceTime(300),
        tap((rows) => {
          rows = this.rows().filter((r) => r.value !== "" && r.value != null);
          if (rows.length === 0) {
            return;
          }

          let acc: ExpressionNode | null = null;
          for (const r of rows) {
            const node = this.buildPredicate(r);
            if (!node) continue;
            if (!acc) {
              acc = node;
            } else {
              acc =
                r.connector === "or"
                  ? builder.or(acc, node)
                  : builder.and(acc, node);
            }
          }

          return this.filterChange.emit(acc ? emit(acc) : "");
        }),
      )
      .subscribe();
  }

  operatorsFor(field: string): FilterOperator[] {
    return (
      this.columns().find((c) => String(c.key) === field)?.filterSet
        ?.operators ?? []
    );
  }

  valueTypeFor(field: string) {
    return this.columns().find((c) => String(c.key) === field)?.filterSet
      ?.valueType;
  }

  addRow() {
    const first = this.filterableColumns()[0];
    if (!first) return;
    this.onAddRow.emit({
      field: String(first.key),
      operator: first.filterSet?.operators?.[0] ?? "eq",
      value: "",
      connector: "and",
    });
  }

  removeRow(i: number) {
    this.onRemoveRow.emit(i);
  }

  updateRow(i: number, patch: Partial<FilterRow>) {
    this.onUpdateRow.emit({ index: i, row: { ...this.rows()[i], ...patch } });
  }

  clear() {
    this.onClearFilter.emit();
  }

  private buildPredicate(row: FilterRow): ExpressionNode | null {
    if (row.value === "" || row.value == null) return null;
    const v = this.coerce(row.value, this.valueTypeFor(row.field));
    switch (row.operator) {
      case "eq":
        return builder.eq(row.field, String(v));
      case "ne":
        return builder.neq(row.field, String(v));
      case "lt":
        return builder.lt(row.field, String(v));
      case "lte":
        return builder.le(row.field, String(v));
      case "gt":
        return builder.gt(row.field, String(v));
      case "gte":
        return builder.ge(row.field, String(v));
      case "lk":
        return builder.eq(row.field, `*${v}*`);
    }
  }

  private coerce(value: string, type?: string): string | number | boolean {
    if (type === "number") return Number(value);
    if (type === "checkbox") return value === "true";
    return value;
  }
}
