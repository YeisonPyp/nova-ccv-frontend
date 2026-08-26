import { Component, inject } from "@angular/core";
import { PatManagementIndicatorService } from "@/app/core/services/pat/pat-management-indicator.service";
import { TableColumn } from "@/app/shared/components/dynamic-table/dynamic-table.component";
import { PatParamSectionComponent } from "./pat-param-section.component";
import { PatUpsertField } from "./pat-upsert-modal.component";

@Component({
  selector: "app-management-indicator-section",
  standalone: true,
  imports: [PatParamSectionComponent],
  template: `
    <app-pat-param-section
      title="Indicadores de Gestión"
      entityName="indicador de gestión"
      [service]="service"
      [columns]="columns"
      [fields]="fields"
    />
  `,
})
export class ManagementIndicatorSectionComponent {
  protected readonly service = inject(PatManagementIndicatorService);

  readonly columns: TableColumn[] = [
    { key: "id", label: "ID" },
    {
      key: "name",
      label: "Nombre",
      filterSet: { valueType: "text", operators: ["lk", "eq"] },
    },
    { key: "description", label: "Descripción" },
  ];

  readonly fields: PatUpsertField[] = [
    { key: "name", label: "Nombre", required: true, maxLength: 300 },
    { key: "description", label: "Descripción", type: "textarea" },
  ];
}
