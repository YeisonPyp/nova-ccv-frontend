import { PositionAssessmentComponent } from "@/app/core/models/assessment/position.model";
import { PositionAssessmentComponentService } from "@/app/core/services/assessment/position-assessment-component.service";
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
  selector: "app-position-assessment-component-modal",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: "./position-assessment-component-modal.component.html",
})
export class PositionAssessmentComponentModalComponent {
  private service = inject(PositionAssessmentComponentService);
  private fb = inject(FormBuilder);

  positionId = input.required<number>();
  selectedComponent = input<PositionAssessmentComponent | null>(null);
  isOpen = input.required<boolean>();

  onSubmit = output<PositionAssessmentComponent>();
  onClose = output<void>();
  loading = signal(false);
  submitting = signal(false);

  componentForm = this.fb.group({
    name: ["", Validators.required],
    description: [""],
    minValue: [0, [Validators.required, Validators.min(0)]],
    maxValue: [100, [Validators.required]],
    dueDate: ["", Validators.required],
  });

  constructor() {
    effect(() => {
      const comp = this.selectedComponent();
      if (comp) {
        this.componentForm.patchValue({
          name: comp.name,
          description: comp.description,
          minValue: comp.minValue,
          maxValue: comp.maxValue,
          dueDate: comp.dueDate,
        });
      } else {
        this.componentForm.reset({ minValue: 0, maxValue: 100 });
      }
    });
  }

  closeComponentModal() {
    this.onClose.emit();
  }

  onComponentSubmit() {
    if (this.componentForm.invalid) return;
    this.submitting.set(true);

    const dto = {
      ...this.componentForm.value,
      positionId: this.positionId(),
    } as any;

    const req$ = this.selectedComponent()
      ? this.service.update(this.selectedComponent()!.id, dto)
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
