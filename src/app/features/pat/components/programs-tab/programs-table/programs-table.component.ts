import { PaginationTableComponent } from "@/app/shared/components/pagination-table/pagination-table.component";
import { CommonModule } from "@angular/common";
import { Component, inject, output, ViewChild } from "@angular/core";
import { PatProgramService } from "@/app/core/services/pat/pat-program.service";
import { TableColumn } from "@/app/shared/components/dynamic-table/dynamic-table.component";
import { PatStrategicProgram } from "@/app/core/models/pat/pat-models";

@Component({
  selector: "app-programs-table",
  standalone: true,
  imports: [CommonModule, PaginationTableComponent],
  templateUrl: "./programs-table.component.html",
})
export class ProgramsTableComponent {
  service = inject(PatProgramService);

  @ViewChild(PaginationTableComponent) table?: PaginationTableComponent<PatStrategicProgram>;

  onEdit = output<PatStrategicProgram>();

  columns: TableColumn[] = [
    { key: "year", label: "Año" },
    { key: "startsAt", label: "Inicio" },
    { key: "endsAt", label: "Fin" },
    { key: "description", label: "Descripción" },
  ];

  reload(): void {
    this.table?.load(this.table.currentPage());
  }
}
