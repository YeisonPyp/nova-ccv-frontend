import { CommonModule } from "@angular/common";
import { Component, ViewChild, input, signal } from "@angular/core";
import { ProgramsTableComponent } from "./programs-table/programs-table.component";
import { CreatePatProgramComponent } from "./create-program/create-program.component";
import { PatStrategicProgram } from "@/app/core/models/pat/pat-models";

@Component({
  selector: "app-programs-tab",
  standalone: true,
  imports: [CommonModule, ProgramsTableComponent, CreatePatProgramComponent],
  templateUrl: "./programs-tab.component.html",
})
export class ProgramsTabComponent {
  adendaId = input.required<number | null>();

  @ViewChild(ProgramsTableComponent) table?: ProgramsTableComponent;

  modalOpen = signal(false);
  editing = signal<PatStrategicProgram | null>(null);

  openCreate() {
    this.editing.set(null);
    this.modalOpen.set(true);
  }

  openEdit(program: PatStrategicProgram) {
    this.editing.set(program);
    this.modalOpen.set(true);
  }

  closeModal() {
    this.modalOpen.set(false);
    this.editing.set(null);
  }

  onSaved() {
    this.closeModal();
    this.table?.reload();
  }
}
