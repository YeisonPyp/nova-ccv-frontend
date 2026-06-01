import {
  Component,
  computed,
  ContentChild,
  input,
  TemplateRef,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { FilterRow } from "./filter-section/filter-section.component";
import { NestedValuePipe } from "../../pipes/nested-value.pipe";

export type FilterOperator = "eq" | "ne" | "lt" | "lte" | "gt" | "gte" | "lk";

export interface TableColumn {
  key: string;
  label: string;
  valueCallBack?: (item: any) => any;

  filterSet?: {
    /**
     * the value type to build filter
     */
    valueType:
      | "text"
      | "number"
      | "date"
      | "checkbox"
      | "email"
      | "time"
      | "month"
      | "week"
      | "datetime-local"
      | "tel";

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

@Component({
  selector: "app-dynamic-table",
  standalone: true,
  imports: [CommonModule, NestedValuePipe],
  templateUrl: "./dynamic-table.component.html",
  styleUrl: "./dynamic-table.component.scss",
})
export class DynamicTableComponent<T> {
  data = input.required<T[]>();
  columns = input.required<TableColumn[]>();
  emptyMessage = input<string>("No hay datos disponibles.");

  hasFilters = computed(() => this.columns().some((c) => !!c.filterSet));

  @ContentChild("actions") actionsTemplate?: TemplateRef<any>;
  @ContentChild("customCell") customCellTemplate?: TemplateRef<any>;
}
