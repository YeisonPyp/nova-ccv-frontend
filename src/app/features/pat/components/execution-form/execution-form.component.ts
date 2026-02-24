import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { 
  ExecutionFormData, 
  ActivityWithProgress, 
  Program,
  ValidationResult 
} from '../../models/pat.models';
import { MONTH_NAMES } from '../../../../core/data/mock-data';
import { PatApiService } from '../../../../core/services/pat-api.service';
import { PatCalculations } from '../../../../shared/utils/calculations.util';
import { CurrencyPipe } from '../../../../shared/pipes/percentage.pipe';

@Component({
  selector: 'app-execution-form',
  imports: [CommonModule, ReactiveFormsModule, CurrencyPipe],
  templateUrl: './execution-form.component.html',
  styleUrl: './execution-form.component.scss'
})
export class ExecutionFormComponent {

  @Input({ required: true }) activity!: ActivityWithProgress;
  @Input({ required: true }) program!: Program;
  @Output() submit = new EventEmitter<ExecutionFormData>();
  @Output() cancel = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private patApi = inject(PatApiService);

  form!: FormGroup;
  months = MONTH_NAMES.map((label, index) => ({ value: index + 1, label }));
  validationErrors: string[] = [];
  isSubmitting = false;

  get metaDisponible(): number {
    return this.activity.metaTotal - this.activity.metaEjecutada;
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      mes: ['', Validators.required],
      metaEjecutada: ['', [
        Validators.required, 
        Validators.min(0),
        Validators.max(this.metaDisponible)
      ]],
      valorEjecutado: ['', [Validators.required, Validators.min(0)]],
      observaciones: ['']
    });
  }

  onSubmit(): void {
    if (this.form.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      this.validationErrors = [];

      const formData: ExecutionFormData = {
        mes: Number(this.form.value.mes),
        metaEjecutada: Number(this.form.value.metaEjecutada),
        valorEjecutado: Number(this.form.value.valorEjecutado),
        observaciones: this.form.value.observaciones
      };

      // Validar antes de enviar
      this.patApi.validateExecution(this.activity.id, formData).subscribe({
        next: (result) => {
          if (result.isValid) {
            this.submit.emit(formData);
          } else {
            this.validationErrors = result.errors;
            this.isSubmitting = false;
          }
        },
        error: (err) => {
          this.validationErrors = [err.message || 'Error de validación'];
          this.isSubmitting = false;
        }
      });
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }
}