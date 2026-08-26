import { CommonModule } from "@angular/common";
import { Component, inject, input, output, signal } from "@angular/core";
import {
  PatPlanProcess,
  StrategicPlan,
} from "@/app/core/models/strategic-plan/strategic-plan.models";
import { PlanProcessModalComponent } from "./plan-process-modal/plan-process-modal.component";
import { EditIconComponent } from "@/app/shared/components/edit-icon/edit-icon.component";
import { TrashIconComponent } from "@/app/shared/components/edit-icon/trash-icon.component";
import { PatPlanProcessService } from "@/app/core/services/pat/plan-process.service";

@Component({
  selector: "app-plan-process-list",
  standalone: true,
  imports: [
    CommonModule,
    PlanProcessModalComponent,
    EditIconComponent,
    TrashIconComponent,
  ],
  templateUrl: "./plan-process-list.component.html",
})
export class PlanProcessListComponent {
  private readonly service = inject(PatPlanProcessService);

  plan = input.required<StrategicPlan>();
  processes = input.required<PatPlanProcess[]>();
  processSelected = output<PatPlanProcess>();
  onSave = output<PatPlanProcess>();
  onDelete = output<number>();

  processToUpsert = signal<PatPlanProcess | null>(null);

  selectedId = signal<number | null>(null);
  modalOpen = signal(false);

  select(p: PatPlanProcess) {
    this.selectedId.set(p.id);
    this.processSelected.emit(p);
  }

  openUpsert(p: PatPlanProcess | null) {
    this.modalOpen.set(true);
    this.processToUpsert.set(p);
  }

  onProcessSaved(p: PatPlanProcess) {
    this.modalOpen.set(false);
    this.onSave.emit(p);
  }

  deleteProcess(p: PatPlanProcess, event: Event) {
    event.stopPropagation();
    if (!confirm(`¿Eliminar el proceso "${p.name}"?`)) return;
    this.service.delete(p.id).subscribe({
      next: () => this.onDelete.emit(p.id),
    });
  }
}
