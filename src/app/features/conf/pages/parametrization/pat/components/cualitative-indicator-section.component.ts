import { Component, inject } from "@angular/core";
import { CualitativeIndicatorService } from "@/app/core/services/pat/cualitative-indicator.service";
import { TableColumn } from "@/app/shared/components/dynamic-table/dynamic-table.component";
import { PatParamSectionComponent } from "./pat-param-section.component";
import { PatUpsertField } from "./pat-upsert-modal.component";

@Component({
  selector: "app-cualitative-indicator-section",
  standalone: true,
  imports: [PatParamSectionComponent],
  template: `
    <app-pat-param-section
      title="Indicadores Cualitativos"
      entityName="indicador cualitativo"
      [service]="service"
      [columns]="columns"
      [fields]="fields"
    />
  `,
})
export class CualitativeIndicatorSectionComponent {
  protected readonly service = inject(CualitativeIndicatorService);

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
