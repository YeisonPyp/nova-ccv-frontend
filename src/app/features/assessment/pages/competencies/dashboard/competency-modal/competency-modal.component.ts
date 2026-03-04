import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CompetencieService, CreateCompetencyDto, CompetencyEnum } from '../../../../../../core/services/assessment/competencie.service';
import { PositionService } from '../../../../../../core/services/assessment/position.service';
import { Position } from '../../../../../../core/models/assessment/position.model';

@Component({
  selector: 'app-competency-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    @if (isOpen) {
      <div class="modal-overlay" (click)="onClose()">
        <div class="modal-container" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2 class="modal-title">Crear Competencia</h2>
            <button type="button" class="close-btn" (click)="onClose()" aria-label="Close modal">&times;</button>
          </div>
          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <div class="modal-body" style="max-height: 60vh; overflow-y: auto;">
              <div class="form-group">
                <label for="comp-name">Nombre de la Competencia <span class="required">*</span></label>
                <input type="text" id="comp-name" formControlName="name" class="form-control" placeholder="Ej. Liderazgo" [class.is-invalid]="form.get('name')?.invalid && form.get('name')?.touched" />
                @if (form.get('name')?.invalid && form.get('name')?.touched) {
                  <div class="invalid-feedback">El nombre es requerido.</div>
                }
              </div>
              <div class="form-group" style="margin-top: 1rem;">
                <label for="comp-type">Tipo de Competencia <span class="required">*</span></label>
                <select id="comp-type" formControlName="type" class="form-control" [class.is-invalid]="form.get('type')?.invalid && form.get('type')?.touched">
                  <option [ngValue]="null" disabled selected>Seleccione un tipo</option>
                  @for (type of competencyTypes; track type.value) {
                    <option [value]="type.value">{{ type.label }}</option>
                  }
                </select>
                @if (form.get('type')?.invalid && form.get('type')?.touched) {
                  <div class="invalid-feedback">El tipo de competencia es requerido.</div>
                }
              </div>
              <div class="form-group" style="margin-top: 1rem;">
                <label for="comp-desc">Descripción <span class="required">*</span></label>
                <textarea id="comp-desc" formControlName="description" class="form-control" rows="3" placeholder="Breve descripción de la competencia..." [class.is-invalid]="form.get('description')?.invalid && form.get('description')?.touched"></textarea>
                @if (form.get('description')?.invalid && form.get('description')?.touched) {
                  <div class="invalid-feedback">La descripción es requerida.</div>
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
  styleUrls: ['../../../dashboard/create-assessment-modal/create-assessment-modal.component.scss'],
})
export class CompetencyModalComponent implements OnChanges, OnInit {
  @Input() isOpen = false;
  @Output() closeModal = new EventEmitter<void>();
  @Output() saveCompetency = new EventEmitter<CreateCompetencyDto>();

  form: FormGroup;
  positions = signal<Position[]>([]);
  private positionService = inject(PositionService);

  competencyTypes = [
    { value: CompetencyEnum.BEHAVIORAL, label: 'Conductual' },
    { value: CompetencyEnum.TECHNICAL, label: 'Técnica' },
    { value: CompetencyEnum.CORE, label: 'Core / Transversal' }
  ];

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      name: ['', [Validators.required]],
      type: [null, [Validators.required]],
      description: ['', [Validators.required]],
      positions: [[]]
    });
  }

  ngOnInit() {
    this.positionService.findPositions({ size: 100, page: 1 }).subscribe(res => {
      if (res.data && res.data.content) this.positions.set(res.data.content);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && !changes['isOpen'].currentValue) {
      this.form.reset();
    }
  }

  onClose() { this.closeModal.emit(); }

  onSubmit() {
    if (this.form.valid) {
      this.saveCompetency.emit(this.form.value);
    } else {
      this.form.markAllAsTouched();
    }
  }
}
