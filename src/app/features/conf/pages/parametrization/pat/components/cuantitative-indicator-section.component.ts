import { Component, inject } from "@angular/core";
import { CuantitativeIndicatorService } from "@/app/core/services/pat/cuantitative-indicator.service";
import { TableColumn } from "@/app/shared/components/dynamic-table/dynamic-table.component";
import { PatParamSectionComponent } from "./pat-param-section.component";
import { PatUpsertField } from "./pat-upsert-modal.component";

@Component({
  selector: "app-cuantitative-indicator-section",
  standalone: true,
  imports: [PatParamSectionComponent],
  template: `
    <app-pat-param-section
      title="Indicadores Cuantitativos"
      entityName="indicador cuantitativo"
      [service]="service"
      [columns]="columns"
      [fields]="fields"
    />
  `,
})
export class CuantitativeIndicatorSectionComponent {
  protected readonly service = inject(CuantitativeIndicatorService);

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
