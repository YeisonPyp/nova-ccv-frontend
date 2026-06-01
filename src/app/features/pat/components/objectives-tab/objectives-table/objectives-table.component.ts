import { CommonModule } from "@angular/common";
import { Component, inject, input, output } from "@angular/core";
import { PatStrategicObjective } from "@/app/core/models/pat/pat-models";
import { PatStrategicObjectiveService } from "@/app/core/services/pat/strategic-objective.service";
import { TableColumn } from "@/app/shared/components/dynamic-table/dynamic-table.component";
import { PaginationTableComponent } from "@/app/shared/components/pagination-table/pagination-table.component";

@Component({
  selector: "app-objectives-table",
  standalone: true,
  imports: [CommonModule, PaginationTableComponent],
  templateUrl: "./objectives-table.component.html",
})
export class ObjectivesTableComponent {
  #service = inject(PatStrategicObjectiveService);
  year = input<number | undefined>(undefined);
  service = this.#service.getServiceByYear(this.year() ?? 0);

  onEdit = output<PatStrategicObjective>();

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
      key: "year",
      label: "Año",
      filterSet: { valueType: "number", operators: ["eq", "gt", "lt"] },
    },
    {
      key: "description",
      label: "Descripción",
    },
  ];
}
