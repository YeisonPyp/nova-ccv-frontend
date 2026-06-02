import { Component, computed, inject, input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { TableColumn } from "@/app/shared/components/dynamic-table/dynamic-table.component";
import { PaginationTableComponent } from "@/app/shared/components/pagination-table/pagination-table.component";
import { AuditLogsService } from "@/app/core/services/audit-logs.service";
import { AuditCandidate } from "@/app/core/models/audit/audit-candidate.model";
import { NgxJsonViewerModule } from "ngx-json-viewer";
import { NestedValuePipe } from "@/app/shared/pipes/nested-value.pipe";

@Component({
  selector: "app-audit-logs",
  standalone: true,
  imports: [
    CommonModule,
    PaginationTableComponent,
    NgxJsonViewerModule,
    NestedValuePipe,
  ],
  templateUrl: "./audit-logs.component.html",
})
export class AuditLogsComponent {
  service = inject(AuditLogsService);
  candidate = input.required<AuditCandidate>();

  columns = computed<TableColumn[]>(() => {
    const tableNameColumn: TableColumn = { key: "entityName", label: "Tipo" };
    const c = this.candidate();

    if (c) {
      tableNameColumn.filterSet = {
        valueType: "text",
        operators: ["eq", "ne"],
        filters: [
          {
            connector: "and",
            field: "entityName",
            operator: "eq",
            value: c.tableName,
          },
        ],
      };
    }
    return [
      { key: "id", label: "ID" },
      { key: "op", label: "Operación" },
      tableNameColumn,
      { key: "ipAddress", label: "IP" },
      {
        key: "user.email",
        label: "Usuario",
        filterSet: { valueType: "email", operators: ["eq"] },
      },
      {
        key: "createdAt",
        label: "Fecha",
        filterSet: { valueType: "date", operators: ["eq", "lte", "gte"] },
      },
      { key: "oldRegistry", label: "Registro anterior" },
      { key: "newRegistry", label: "Registro nuevo" },
    ];
  });

  parseJson = (json: string) => JSON.parse(json);
}
