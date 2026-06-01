import { Component, inject } from "@angular/core";
import { ProductService } from "@/app/core/services/pat/product.service";
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
  protected readonly service = inject(ProductService);

  readonly columns: TableColumn[] = [
    { key: "id", label: "ID" },
    {
      key: "code",
      label: "Código",
      filterSet: { valueType: "text", operators: ["lk", "eq"] },
    },
    {
      key: "name",
      label: "Nombre",
      filterSet: { valueType: "text", operators: ["lk", "eq"] },
    },
    { key: "description", label: "Descripción" },
  ];

  readonly fields: PatUpsertField[] = [
    { key: "name", label: "Nombre", required: true, maxLength: 300 },
    { key: "code", label: "Código", maxLength: 15 },
    { key: "description", label: "Descripción", type: "textarea" },
  ];
}
