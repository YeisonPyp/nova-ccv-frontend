import {
  PatActivityService,
  PatActivityServiceByYear,
} from "@/app/core/services/pat/pat-activity.service";
import { TableColumn } from "@/app/shared/components/dynamic-table/dynamic-table.component";
import { PaginationTableComponent } from "@/app/shared/components/pagination-table/pagination-table.component";
import { CommonModule } from "@angular/common";
import { Component, inject, input } from "@angular/core";
import { NestedValuePipe } from "@/app/shared/pipes/nested-value.pipe";
import { PatProgressBarComponent } from "../../progress-bar/progress-bar.component";

@Component({
  selector: "app-activities-table",
  standalone: true,
  imports: [
    CommonModule,
    PaginationTableComponent,
    PatProgressBarComponent,
    NestedValuePipe,
  ],
  templateUrl: "./activities-table.component.html",
})
export class ActivitiesTableComponent {
  #service = inject(PatActivityService);
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
      key: "program.pillar.name",
      label: "Pilar",
      filterSet: { valueType: "text", operators: ["eq", "lk", "ne"] },
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
    {
      key: "budget",
      label: "Presupuesto",
    },
    {
      key: "measurement",
      label: "Unidad de Medida",
    },
    {
      key: "indicator",
      label: "Indicador de Gestión",
    },
    {
      key: "benefit",
      label: "Beneficiarios",
    },
  ];

  pctValue(planned: number, executed: number): number {
    if (planned === 0) return 0;
    return (executed / planned) * 100;
  }
}
