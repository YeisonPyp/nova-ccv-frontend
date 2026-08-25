import {
  AssessmentComponentRequirement,
  AssessmentComponentRequirementFile,
} from "@/app/core/models/assessment/position.model";
import {
  AssessmentComponentRequirementFileService,
  AssessmentComponentRequirementService,
} from "@/app/core/services/assessment/position-assessment-component.service";
import { FileItemComponent } from "@/app/shared/components/file-item/file-item.component";
import { CommonModule } from "@angular/common";
import { Component, inject, input, output, signal } from "@angular/core";
import { ComponentRequirementModalComponent } from "./component-requirement-modal/component-requirement-modal.component";
import { EditIconComponent } from "@/app/shared/components/edit-icon/edit-icon.component";
import { TrashIconComponent } from "@/app/shared/components/edit-icon/trash-icon.component";

@Component({
  selector: "app-component-requirements",
  imports: [
    CommonModule,
    FileItemComponent,
    ComponentRequirementModalComponent,
    EditIconComponent,
    TrashIconComponent,
  ],
  templateUrl: "./component-requirements.component.html",
})
export class ComponentRequirementsComponent {
  private readonly service = inject(AssessmentComponentRequirementService);
  private readonly requirementFileService = inject(
    AssessmentComponentRequirementFileService,
  );
  componentId = input.required<number>();
  requirements = input.required<AssessmentComponentRequirement[]>();
  onSaveRequirement = output<AssessmentComponentRequirement>();
  onDeleteRequirement = output<AssessmentComponentRequirement>();

  isModalOpen = signal<boolean>(false);
  selectedRequirement = signal<AssessmentComponentRequirement | null>(null);

  openModal(req: AssessmentComponentRequirement | null) {
    this.selectedRequirement.set(req);
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
    this.selectedRequirement.set(null);
  }

  deleteFile(
    req: AssessmentComponentRequirement,
    f: AssessmentComponentRequirementFile,
  ) {
    this.requirementFileService.delete(f.id).subscribe(() => {
      req.files = req.files?.filter((file) => file.id !== f.id);
      this.onSaveRequirement.emit(req);
    });
  }

  uploadFile(file: File, requirement: AssessmentComponentRequirement) {
    this.requirementFileService
      .create(requirement.id, file)
      .subscribe((res) => {
        const filesMap = new Map(requirement.files?.map((f) => [f.id, f]));
        filesMap.set(res.id, res);
        requirement.files = [...filesMap.values()];
        this.onSaveRequirement.emit(requirement);
      });
  }

  deleteRequirement(req: AssessmentComponentRequirement) {
    this.service.delete(req.id).subscribe((res) => {
      if (res.success) {
        this.onDeleteRequirement.emit(req);
      }
    });
  }
}
