import { Component, inject } from "@angular/core";
import { PatProductService } from "@/app/core/services/pat/pat-product.service";
import { TableColumn } from "@/app/shared/components/dynamic-table/dynamic-table.component";
import { PatParamSectionComponent } from "./pat-param-section.component";
import { PatUpsertField } from "./pat-upsert-modal.component";

@Component({
  selector: "app-product-section",
  standalone: true,
  imports: [PatParamSectionComponent],
  template: `
    <app-pat-param-section
      title="Productos"
      entityName="producto"
      [service]="service"
      [columns]="columns"
      [fields]="fields"
    />
  `,
})
export class ProductSectionComponent {
  protected readonly service = inject(PatProductService);

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
    { key: "name", label: "Nombre", required: true, maxLength: 255 },
    { key: "description", label: "Descripción", type: "textarea" },
  ];
}
