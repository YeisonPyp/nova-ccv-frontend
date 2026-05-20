import {
  Component,
  computed,
  ContentChild,
  input,
  output,
  TemplateRef,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { FilterSectionComponent } from "./filter-section/filter-section.component";

export type FilterOperator = "eq" | "ne" | "lt" | "lte" | "gt" | "gte" | "lk";

export interface TableColumn {
  key: string;
  label: string;

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
  };
}

@Component({
  selector: "app-dynamic-table",
  standalone: true,
  imports: [CommonModule],
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

  getNestedValue(obj: any, path: string | number | symbol): any {
    if (typeof path !== "string") return obj[path];
    return path.split(".").reduce((acc, part) => acc && acc[part], obj) || "-";
  }
}
