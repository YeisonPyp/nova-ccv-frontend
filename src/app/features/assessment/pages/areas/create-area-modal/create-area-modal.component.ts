import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CreateAreaDto } from '../../../../../core/services/assessment/area.service';

@Component({
  selector: 'app-create-area-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    @if (isOpen) {
      <div class="modal-overlay" (click)="onClose()">
        <div class="modal-container" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2 class="modal-title">Crear Área</h2>
            <button type="button" class="close-btn" (click)="onClose()" aria-label="Close modal">&times;</button>
          </div>
          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <div class="modal-body">
              <div class="form-group">
                <label for="area-name">Nombre del Área <span class="required">*</span></label>
                <input type="text" id="area-name" formControlName="name" class="form-control" placeholder="Ej. Recursos Humanos" [class.is-invalid]="form.get('name')?.invalid && form.get('name')?.touched" />
                @if (form.get('name')?.invalid && form.get('name')?.touched) {
                  <div class="invalid-feedback">El nombre del área es requerido.</div>
                }
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" (click)="onClose()">Cancelar</button>
              <button type="submit" class="btn btn-primary" [disabled]="form.invalid">Guardar</button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
  styleUrls: ['../../dashboard/create-assessment-modal/create-assessment-modal.component.scss'],
})
export class CreateAreaModalComponent implements OnChanges {
  @Input() isOpen = false;
  @Output() closeModal = new EventEmitter<void>();
  @Output() saveArea = new EventEmitter<CreateAreaDto>();

  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({ name: ['', [Validators.required]] });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && !changes['isOpen'].currentValue) {
      this.form.reset();
    }
  }

  onClose() { this.closeModal.emit(); }

  onSubmit() {
    if (this.form.valid) { this.saveArea.emit(this.form.value); }
    else { this.form.markAllAsTouched(); }
  }
}
