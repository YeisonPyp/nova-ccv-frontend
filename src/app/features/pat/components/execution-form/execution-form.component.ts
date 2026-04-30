import { Component, Input, Output, EventEmitter, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from "@angular/forms";
import {
  ActivityWithMetrics,
  ExecutionFormData,
  Program,
} from "../../models/pat.models";
import { MONTH_NAMES } from "../../../../core/data/mock-data";
import { CurrencyPipe } from "../../../../shared/pipes/percentage.pipe";

@Component({
  selector: "app-execution-form",
  imports: [CommonModule, ReactiveFormsModule, CurrencyPipe],
  templateUrl: "./execution-form.component.html",
  styleUrl: "./execution-form.component.scss",
})
export class ExecutionFormComponent {
  @Input({ required: true }) activity!: ActivityWithMetrics;
  @Input({ required: true }) program!: Program;
  @Output() submit = new EventEmitter<ExecutionFormData>();
  @Output() cancel = new EventEmitter<void>();

  private fb = inject(FormBuilder);

  form!: FormGroup;
  months = MONTH_NAMES.map((label, index) => ({ value: index + 1, label }));
  validationErrors: string[] = [];
  isSubmitting = false;

  get metaDisponible(): number {
    return this.activity.goalTotal - this.activity.executedGoal;
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      mes: ["", Validators.required],
      metaEjecutada: [
        "",
        [
          Validators.required,
          Validators.min(0),
          Validators.max(this.metaDisponible),
        ],
      ],
      valorEjecutado: ["", [Validators.required, Validators.min(0)]],
      observaciones: [""],
    });
  }

  onSubmit(): void {
    if (this.form.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      this.validationErrors = [];

      const formData: ExecutionFormData = {
        month: Number(this.form.value.mes),
        executedGoal: Number(this.form.value.metaEjecutada),
        executedAmount: Number(this.form.value.valorEjecutado),
        notes: this.form.value.observaciones,
        activityId: this.activity.id,
      };

      this.submit.emit(formData);
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
