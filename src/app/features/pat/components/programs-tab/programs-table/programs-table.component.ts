import { PaginationTableComponent } from "@/app/shared/components/pagination-table/pagination-table.component";
import { CommonModule } from "@angular/common";
import { Component, inject, input, output } from "@angular/core";
import {
  PatProgramByYearService,
  PatProgramService,
} from "@/app/core/services/pat/pat-program.service";
import { TableColumn } from "@/app/shared/components/dynamic-table/dynamic-table.component";
import { PatStrategicProgram } from "@/app/core/models/pat/pat-models";

@Component({
  selector: "app-programs-table",
  standalone: true,
  imports: [CommonModule, PaginationTableComponent],
  templateUrl: "./programs-table.component.html",
})
export class ProgramsTableComponent {
  #service = inject(PatProgramService);
  year = input<number | undefined>();
  service = new PatProgramByYearService(this.#service, this.year());

  onEdit = output<PatStrategicProgram>();

  columns: TableColumn[] = [
    { key: "name", label: "Nombre" },
    { key: "description", label: "Descripción" },
    { key: "year", label: "Año" },
    { key: "pillar.name", label: "Pilar" },
  ];
}
