import { Component, input, output, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  AssessmentComponentRequirement,
  PositionAssessmentComponent,
} from "@/app/core/models/assessment/position.model";
import { ComponentRequirementsComponent } from "./component-requirements/component-requirements.component";
import { EditIconComponent } from "@/app/shared/components/edit-icon/edit-icon.component";
import { TrashIconComponent } from "@/app/shared/components/edit-icon/trash-icon.component";

@Component({
  selector: "app-assessment-component",
  standalone: true,
  imports: [
    CommonModule,
    ComponentRequirementsComponent,
    EditIconComponent,
    TrashIconComponent,
  ],
  templateUrl: "./assessment-component.component.html",
})
export class AssessmentComponentComponent {
  comp = input.required<PositionAssessmentComponent>();

  onSave = output<PositionAssessmentComponent>();
  onEdit = output<PositionAssessmentComponent>();
  onDelete = output<PositionAssessmentComponent>();

  onSaveRequirement(r: AssessmentComponentRequirement) {
    const requirementsMap = new Map<number, AssessmentComponentRequirement>(
      this.comp().requirements?.map((r) => [r.id, r]) ?? [],
    );
    requirementsMap.set(r.id, r);
    this.onSave.emit({
      ...this.comp(),
      requirements: [...requirementsMap.values()],
    });
  }

  onDeleteRequirement(req: AssessmentComponentRequirement) {
    const requirements = this.comp().requirements?.filter(
      (r) => r.id !== req.id,
    );
    this.onSave.emit({
      ...this.comp(),
      requirements: requirements ?? [],
    });
  }
}
