import {
  PatActivityService,
  PatActivityServiceByYear,
} from "@/app/core/services/pat/pat-activity.service";
import { TableColumn } from "@/app/shared/components/dynamic-table/dynamic-table.component";
import { PaginationTableComponent } from "@/app/shared/components/pagination-table/pagination-table.component";
import { CommonModule } from "@angular/common";
import { Component, inject, input } from "@angular/core";
import { NestedValuePipe } from "@/app/shared/pipes/nested-value.pipe";
import { PatActivity } from "@/app/core/models/pat/pat-models";
import { Router } from "@angular/router";

@Component({
  selector: "app-activities-table",
  standalone: true,
  imports: [CommonModule, PaginationTableComponent, NestedValuePipe],
  templateUrl: "./activities-table.component.html",
})
export class ActivitiesTableComponent {
  #service = inject(PatActivityService);
  router = inject(Router);
  year = input<number | undefined>(undefined);
  service = new PatActivityServiceByYear(this.#service, this.year());

  columns: TableColumn[] = [
    {
      key: "code",
      label: "Código",
      filterSet: { valueType: "text", operators: ["eq", "lk", "ne"] },
    },
    {
      key: "name",
      label: "Nombre",
      filterSet: { valueType: "text", operators: ["eq", "lk", "ne"] },
    },
    {
      key: "program.name",
      label: "Programa",
      filterSet: { valueType: "text", operators: ["eq", "lk", "ne"] },
    },
    {
      key: "costCenter.name",
      label: "Centro de costo",
    },
    {
      key: "measurement",
      label: "Unidad de Medida",
    },
    {
      key: "startsAt",
      label: "Inicio",
      filterSet: { valueType: "date", operators: ["eq", "gt", "lt"] },
    },
    {
      key: "endsAt",
      label: "Fin",
      filterSet: { valueType: "date", operators: ["eq", "gt", "lt"] },
    },
  ];

  openDetail(item: PatActivity) {
    this.router.navigate([`/pat/${this.year()}/activities`, item.id]);
  }
}
