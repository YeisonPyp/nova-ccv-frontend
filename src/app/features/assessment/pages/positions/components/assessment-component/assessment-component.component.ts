import { Component, input, output } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  PositionAssessmentComponent,
  AssessmentComponentRequirement,
} from "@/app/core/services/assessment/position-assessment-component.service";
import { FileItemComponent } from "@/app/shared/components/file-item/file-item.component";

@Component({
  selector: "app-assessment-component",
  standalone: true,
  imports: [CommonModule, FileItemComponent],
  templateUrl: "./assessment-component.component.html",
})
export class AssessmentComponentComponent {
  comp = input.required<PositionAssessmentComponent>();

  onEditComponent = output<PositionAssessmentComponent>();
  onDeleteComponent = output<PositionAssessmentComponent>();

  onAddRequirement = output<number>(); // Emits componentId
  onEditRequirement = output<{
    req: AssessmentComponentRequirement;
    componentId: number;
  }>();
  onDeleteRequirement = output<AssessmentComponentRequirement>();

  onUploadFile = output<{ file: File; requirementId: number }>();
  onDeleteFile = output<number>();

  openComponentModal(comp: PositionAssessmentComponent) {
    this.onEditComponent.emit(comp);
  }

  deleteComponent(comp: PositionAssessmentComponent) {
    this.onDeleteComponent.emit(comp);
  }

  openRequirementModal(
    req: AssessmentComponentRequirement | null,
    componentId: number,
  ) {
    if (req) {
      this.onEditRequirement.emit({ req, componentId });
    } else {
      this.onAddRequirement.emit(componentId);
    }
  }

  deleteRequirement(req: AssessmentComponentRequirement) {
    this.onDeleteRequirement.emit(req);
  }

  uploadFile(file: File, requirementId: number) {
    this.onUploadFile.emit({ file, requirementId });
  }

  deleteFile(fileId: number | string) {
    this.onDeleteFile.emit(Number(fileId));
  }
}
