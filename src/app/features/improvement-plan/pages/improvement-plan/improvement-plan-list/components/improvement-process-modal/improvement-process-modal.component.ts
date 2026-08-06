import { Component, EventEmitter, inject, Input, Output } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { ImprovementProcessService } from "@/app/core/services/improvement-plan/improvement-process.service";
import { ImprovementProcess } from "@/app/core/models/improvement-plan/improvement-process.model";

@Component({
  selector: "app-improvement-process-modal",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: "./improvement-process-modal.component.html",
})
export class ImprovementProcessModalComponent {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(ImprovementProcessService);

  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<ImprovementProcess>();

  form: FormGroup = this.fb.group({
    name: ["", Validators.required],
    code: ["", Validators.required],
  });

  loading = false;

  onSubmit() {
    if (this.form.invalid) return;

    this.loading = true;
    this.service.create(this.form.value).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success && res.data) {
          this.saved.emit(res.data);
        }
        this.form.reset();
        this.close.emit();
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  onClose() {
    this.form.reset();
    this.close.emit();
  }
}
