import {
  AssessmentComponentRequirement,
  AssessmentComponentRequirementService,
  CreateAssessmentComponentRequirementDto,
} from "@/app/core/services/assessment/position-assessment-component.service";
import { CommonModule } from "@angular/common";
import {
  Component,
  effect,
  inject,
  input,
  output,
  signal,
} from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";

@Component({
  selector: "app-component-requirement-modal",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: "./component-requirement-modal.component.html",
})
export class ComponentRequirementModalComponent {
  private fb = inject(FormBuilder);
  private service = inject(AssessmentComponentRequirementService);

  currentParentComponentId = input.required<number>();
  selectedRequirement = input.required<AssessmentComponentRequirement | null>();
  isOpen = input(false);

  onSubmit = output<AssessmentComponentRequirement>();
  onClose = output<void>();
  loading = signal(false);
  submitting = signal(false);

  requirementForm = this.fb.group({
    name: ["", Validators.required],
    description: [""],
    maxFiles: [0, [Validators.required, Validators.min(0)]],
  });

  constructor() {
    effect(() => {
      const req = this.selectedRequirement();
      if (req) {
        this.requirementForm.patchValue({
          name: req.name,
          description: req.description,
          maxFiles: req.maxFiles,
        });
      } else {
        this.requirementForm.reset({ maxFiles: 0 });
      }
    });
  }

  closeComponentModal() {
    this.onClose.emit();
  }

  onComponentSubmit() {
    if (this.requirementForm.invalid) return;
    this.submitting.set(true);

    const dto: CreateAssessmentComponentRequirementDto = {
      name: this.requirementForm.value.name!,
      description: this.requirementForm.value.description || undefined,
      maxFiles: this.requirementForm.value.maxFiles!,
      componentId: this.currentParentComponentId(),
    };

    const req$ = this.selectedRequirement()
      ? this.service.update(this.selectedRequirement()!.id, dto)
      : this.service.create(dto);

    req$.subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.onSubmit.emit(res.data);
          this.closeComponentModal();
        }
        this.submitting.set(false);
      },
      error: () => this.submitting.set(false),
    });
  }
}
