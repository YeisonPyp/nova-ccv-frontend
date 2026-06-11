import { Component, input, effect, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  PositionAssessmentComponentService,
  PositionAssessmentComponent,
  AssessmentComponentRequirement,
} from "@/app/core/services/assessment/position-assessment-component.service";
import {
  AssessmentComponentRequirementService,
  AssessmentComponentRequirementFileService,
} from "@/app/core/services/assessment/position-assessment-component.service";
import { PositionAssessmentComponentModalComponent } from "../position-assessment-component-modal/position-assessment-component-modal.component";
import { AssessmentComponentComponent } from "../assessment-component/assessment-component.component";
import { ComponentRequirementModalComponent } from "../component-requirement-modal/component-requirement-modal.component";

@Component({
  selector: "app-position-assessment-components",
  standalone: true,
  imports: [
    CommonModule,
    PositionAssessmentComponentModalComponent,
    AssessmentComponentComponent,
    ComponentRequirementModalComponent,
  ],
  templateUrl: "./position-assessment-components.component.html",
})
export class PositionAssessmentComponentsComponent {
  positionId = input.required<number>();

  private service = inject(PositionAssessmentComponentService);
  private reqService = inject(AssessmentComponentRequirementService);
  private fileService = inject(AssessmentComponentRequirementFileService);

  components = signal<PositionAssessmentComponent[]>([]);
  loading = signal(false);

  // Component Modal State
  isComponentModalOpen = signal(false);
  selectedComponent = signal<PositionAssessmentComponent | null>(null);

  // Requirement Modal State
  isRequirementModalOpen = signal(false);
  selectedRequirement = signal<AssessmentComponentRequirement | null>(null);
  currentParentComponentId = signal<number | null>(null);

  constructor() {
    effect(() => {
      if (this.positionId()) {
        this.loadComponents();
      }
    });
  }

  loadComponents() {
    this.loading.set(true);
    // Use an RSQL filter to get components by positionId
    this.service
      .findAll({ rsqlQuery: `positionId==${this.positionId()}` })
      .subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.components.set(res.data.content);
          }
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  openComponentModal(comp: PositionAssessmentComponent | null) {
    this.selectedComponent.set(comp);
    this.isComponentModalOpen.set(true);
  }

  closeComponentModal() {
    this.isComponentModalOpen.set(false);
    this.selectedComponent.set(null);
  }

  deleteComponent(comp: PositionAssessmentComponent) {
    if (!confirm(`¿Eliminar componente "${comp.name}"?`)) return;
    this.service.delete(comp.id).subscribe((res) => {
      if (res.success) this.loadComponents();
    });
  }

  // ---- Requirement Management ----
  openRequirementModal(
    req: AssessmentComponentRequirement | null,
    componentId: number,
  ) {
    this.selectedRequirement.set(req);
    this.currentParentComponentId.set(componentId);
    this.isRequirementModalOpen.set(true);
  }

  closeRequirementModal() {
    this.isRequirementModalOpen.set(false);
    this.selectedRequirement.set(null);
    this.currentParentComponentId.set(null);
  }

  deleteRequirement(req: AssessmentComponentRequirement) {
    if (!confirm(`¿Eliminar requerimiento "${req.name}"?`)) return;
    this.reqService.delete(req.id).subscribe((res) => {
      if (res.success) this.loadComponents();
    });
  }

  uploadFile(file: File, requirementId: number) {
    this.fileService.create(requirementId, file).subscribe({
      next: (res) => {
        if (res.success) {
          this.loadComponents();
        }
      },
    });
  }

  deleteFile(fileId: number) {
    if (!confirm("¿Eliminar este archivo?")) return;
    this.fileService.delete(fileId).subscribe({
      next: (res) => {
        if (res.success) {
          this.loadComponents(); // Refresh the list
        }
      },
    });
  }
}
