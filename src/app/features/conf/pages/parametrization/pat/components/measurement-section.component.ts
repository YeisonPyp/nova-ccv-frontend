import { Component, inject } from "@angular/core";
import { MeasurementService } from "@/app/core/services/pat/measurement.service";
import { TableColumn } from "@/app/shared/components/dynamic-table/dynamic-table.component";
import { PatParamSectionComponent } from "./pat-param-section.component";
import { PatUpsertField } from "./pat-upsert-modal.component";

@Component({
  selector: "app-measurement-section",
  standalone: true,
  imports: [PatParamSectionComponent],
  template: `
    <app-pat-param-section
      title="Unidades de medida"
      entityName="medida"
      [service]="service"
      [columns]="columns"
      [fields]="fields"
    />
  `,
})
export class MeasurementSectionComponent {
  protected readonly service = inject(MeasurementService);

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
    { key: "name", label: "Nombre", required: true, maxLength: 150 },
    { key: "description", label: "Descripción", type: "textarea" },
  ];
}
