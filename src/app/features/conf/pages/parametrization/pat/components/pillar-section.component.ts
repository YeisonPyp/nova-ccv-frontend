import { Component, inject } from "@angular/core";
import { PillarService } from "@/app/core/services/pat/pillar.service";
import { TableColumn } from "@/app/shared/components/dynamic-table/dynamic-table.component";
import { PatParamSectionComponent } from "./pat-param-section.component";
import { PatUpsertField } from "./pat-upsert-modal.component";

@Component({
  selector: "app-pillar-section",
  standalone: true,
  imports: [PatParamSectionComponent],
  template: `
    <app-pat-param-section
      title="Pilares"
      entityName="pilar"
      [service]="service"
      [columns]="columns"
      [fields]="fields"
    />
  `,
})
export class PillarSectionComponent {
  protected readonly service = inject(PillarService);

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
    { key: "name", label: "Nombre", required: true, maxLength: 200 },
    { key: "description", label: "Descripción", type: "textarea" },
  ];
}
