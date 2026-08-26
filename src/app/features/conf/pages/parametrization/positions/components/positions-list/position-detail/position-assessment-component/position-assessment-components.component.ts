import { Component, input, effect, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { PositionAssessmentComponentService } from "@/app/core/services/assessment/position-assessment-component.service";
import { PositionAssessmentComponentModalComponent } from "./position-assessment-component-modal/position-assessment-component-modal.component";
import { AssessmentComponentComponent } from "./assessment-component/assessment-component.component";
import {
  Position,
  PositionAssessmentComponent,
} from "@/app/core/models/assessment/position.model";

@Component({
  selector: "app-position-assessment-components",
  standalone: true,
  imports: [
    CommonModule,
    PositionAssessmentComponentModalComponent,
    AssessmentComponentComponent,
  ],
  templateUrl: "./position-assessment-components.component.html",
})
export class PositionAssessmentComponentsComponent {
  private service = inject(PositionAssessmentComponentService);

  position = input.required<Position>();
  components = signal<PositionAssessmentComponent[]>([]);

  modalIsOpen = signal(false);
  selectedComponent = signal<PositionAssessmentComponent | null>(null);

  constructor() {
    effect(() => {
      this.components.set(this.position().assessmentComponent ?? []);
    });
  }

  openComponentModal(comp: PositionAssessmentComponent | null) {
    this.selectedComponent.set(comp);
    this.modalIsOpen.set(true);
  }

  closeComponentModal() {
    this.modalIsOpen.set(false);
    this.selectedComponent.set(null);
  }

  deleteComponent(comp: PositionAssessmentComponent) {
    this.service.delete(comp.id).subscribe((res) => {
      if (res.success) {
        this.components.update((comps) =>
          comps.filter((c) => c.id !== comp.id),
        );
      }
    });
  }

  onSaveComponent(comp: PositionAssessmentComponent) {
    this.components.update((curr) => {
      const compMap = new Map(curr.map((c) => [c.id, c]));
      compMap.set(comp.id, comp);
      return Array.from(compMap.values());
    });
  }
}
