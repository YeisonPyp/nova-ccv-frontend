import { Component, inject } from "@angular/core";
import { PolicyService } from "@/app/core/services/pat/policy.service";
import { TableColumn } from "@/app/shared/components/dynamic-table/dynamic-table.component";
import { PatParamSectionComponent } from "./pat-param-section.component";
import { PatUpsertField } from "./pat-upsert-modal.component";

@Component({
  selector: "app-policy-section",
  standalone: true,
  imports: [PatParamSectionComponent],
  template: `
    <app-pat-param-section
      title="Políticas"
      entityName="política"
      [service]="service"
      [columns]="columns"
      [fields]="fields"
    />
  `,
})
export class PolicySectionComponent {
  protected readonly service = inject(PolicyService);

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
