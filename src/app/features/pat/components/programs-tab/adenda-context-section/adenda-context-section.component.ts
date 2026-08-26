import { Component, inject } from "@angular/core";
import { PatAdendaContextService } from "@/app/core/services/pat/pat-adenda-context.service";
import { TableColumn } from "@/app/shared/components/dynamic-table/dynamic-table.component";
import { PatParamSectionComponent } from "@/app/features/conf/pages/parametrization/pat/components/pat-param-section.component";
import { PatUpsertField } from "@/app/features/conf/pages/parametrization/pat/components/pat-upsert-modal.component";

@Component({
  selector: "app-adenda-context-section",
  standalone: true,
  imports: [PatParamSectionComponent],
  template: `
    <app-pat-param-section
      title="Contextos de Adenda"
      entityName="contexto de adenda"
      [service]="service"
      [columns]="columns"
      [fields]="fields"
    />
  `,
})
export class AdendaContextSectionComponent {
  protected readonly service = inject(PatAdendaContextService);

  readonly columns: TableColumn[] = [
    { key: "id", label: "ID" },
    {
      key: "year",
      label: "Año",
      filterSet: { valueType: "number", operators: ["eq"] },
    },
    {
      key: "name",
      label: "Nombre",
      filterSet: { valueType: "text", operators: ["lk", "eq"] },
    },
    { key: "programPrefix", label: "Prefijo de programa" },
  ];

  readonly fields: PatUpsertField[] = [
    { key: "year", label: "Año", type: "number", required: true },
    { key: "name", label: "Nombre", required: true },
    {
      key: "programPrefix",
      label: "Prefijo de programa",
      required: true,
    },
  ];
}
