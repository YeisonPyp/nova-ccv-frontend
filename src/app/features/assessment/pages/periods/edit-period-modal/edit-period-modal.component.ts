import { CommonModule } from "@angular/common";
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { Period } from "../../../../../core/models/assessment/period.model";

export interface EditPeriodDto {
  name?: string;
  startDate: string;
  endDate: string;
}

@Component({
  selector: "app-edit-period-modal",
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: "./edit-period-modal.component.html",
  styleUrl: "./edit-period-modal.component.scss",
})
export class EditPeriodModalComponent implements OnChanges {
  @Input() isOpen: boolean = false;
  @Input() period: Period | null = null;

  @Output() closeModal = new EventEmitter<void>();
  @Output() savePeriod = new EventEmitter<EditPeriodDto>();

  periodForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.periodForm = this.fb.group({
      name: [""],
      startDate: ["", [Validators.required]],
      endDate: ["", [Validators.required]],
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["period"] && this.period) {
      this.periodForm.patchValue({
        name: this.period.name || "",
        startDate: this.period.startDate || "",
        endDate: this.period.endDate || "",
      });
    }

    // Reset the form when the modal is closed
    if (changes["isOpen"] && !changes["isOpen"].currentValue) {
      this.periodForm.reset();
    }
  }

  onClose(): void {
    this.closeModal.emit();
  }

  onSubmit(): void {
    if (this.periodForm.valid) {
      const formValue = this.periodForm.value;

      const payload: EditPeriodDto = {
        startDate: formValue.startDate,
        endDate: formValue.endDate,
      };

      if (formValue.name && formValue.name.trim() !== "") {
        payload.name = formValue.name.trim();
      }

      this.savePeriod.emit(payload);
    } else {
      this.periodForm.markAllAsTouched();
    }
  }
}
