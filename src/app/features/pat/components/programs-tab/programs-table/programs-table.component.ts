import { PaginationTableComponent } from "@/app/shared/components/pagination-table/pagination-table.component";
import { CommonModule } from "@angular/common";
import {
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  ViewChild,
} from "@angular/core";
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
  #service = inject(PatProgramService);
  adendaId = input<number | null>(null);
  service = computed(() => this.#service.getServiceByAdenda(this.adendaId()));

  @ViewChild(PaginationTableComponent) table?: PaginationTableComponent<PatStrategicProgram>;

  onEdit = output<PatStrategicProgram>();

  columns: TableColumn[] = [
    { key: "name", label: "Nombre" },
    { key: "code", label: "Código" },
    { key: "startsAt", label: "Inicio" },
    { key: "endsAt", label: "Fin" },
    { key: "unitMeasure.name", label: "Unidad de medida" },
    { key: "goalValue", label: "Meta" },
  ];

  constructor() {
    effect(() => {
      this.service();
      this.table?.load(1);
    });
  }

  reload(): void {
    this.table?.load(this.table.currentPage());
  }
}
