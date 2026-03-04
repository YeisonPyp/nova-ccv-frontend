import { Component, input, TemplateRef, ContentChild } from "@angular/core";
import { CommonModule } from "@angular/common";

export interface TableColumn<T> {
  key: keyof T | string;
  label: string;
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
  columns = input.required<TableColumn<T>[]>();
  emptyMessage = input<string>("No hay datos disponibles.");

  @ContentChild("actions") actionsTemplate?: TemplateRef<any>;
  @ContentChild("customCell") customCellTemplate?: TemplateRef<any>;

  getNestedValue(obj: any, path: string | number | symbol): any {
    if (typeof path !== "string") return obj[path];
    return path.split(".").reduce((acc, part) => acc && acc[part], obj) || "-";
  }
}
