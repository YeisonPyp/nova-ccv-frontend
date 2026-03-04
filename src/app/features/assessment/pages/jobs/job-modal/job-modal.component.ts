import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PositionService, CreatePositionDto, UpdatePositionDto } from '../../../../../core/services/assessment/position.service';
import { AreaService } from '../../../../../core/services/assessment/area.service';
import { CompetencieService, CompetencyEnum } from '../../../../../core/services/assessment/competencie.service';
import { Area } from '../../../../../core/models/assessment/area.model';
import { Competencie } from '../../../../../core/models/assessment/competencie.model';

@Component({
  selector: 'app-job-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    @if (isOpen) {
      <div class="modal-overlay" (click)="onClose()">
        <div class="modal-container" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2 class="modal-title">{{ isEdit ? 'Editar Puesto' : 'Crear Puesto' }}</h2>
            <button type="button" class="close-btn" (click)="onClose()" aria-label="Close modal">&times;</button>
          </div>
          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <div class="modal-body" style="max-height: 60vh; overflow-y: auto;">
              <div class="form-group">
                <label for="job-name">Nombre del Puesto <span class="required">*</span></label>
                <input type="text" id="job-name" formControlName="name" class="form-control" placeholder="Ej. Desarrollador Senior" [class.is-invalid]="form.get('name')?.invalid && form.get('name')?.touched" />
                @if (form.get('name')?.invalid && form.get('name')?.touched) {
                  <div class="invalid-feedback">El nombre es requerido.</div>
                }
              </div>
              <div class="form-group" style="margin-top: 1rem;">
                <label for="job-description">Descripción <span class="required">*</span></label>
                <textarea id="job-description" formControlName="description" class="form-control" rows="3" placeholder="Breve descripción del puesto..." [class.is-invalid]="form.get('description')?.invalid && form.get('description')?.touched"></textarea>
                @if (form.get('description')?.invalid && form.get('description')?.touched) {
                  <div class="invalid-feedback">La descripción es requerida.</div>
                }
              </div>
              <div class="form-group" style="margin-top: 1rem;">
                <label for="job-area">Área <span class="required">*</span></label>
                <select id="job-area" formControlName="areaId" class="form-control" [class.is-invalid]="form.get('areaId')?.invalid && form.get('areaId')?.touched">
                  <option [ngValue]="null" disabled selected>Seleccione un área</option>
                  @for (area of areas(); track area.id) {
                    <option [ngValue]="area.id">{{ area.name }}</option>
                  }
                </select>
                @if (form.get('areaId')?.invalid && form.get('areaId')?.touched) {
                  <div class="invalid-feedback">El área es requerida.</div>
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
export class JobModalComponent implements OnChanges, OnInit {
  @Input() isOpen = false;
  @Input() isEdit = false;
  @Input() jobData: any = null;
  @Output() closeModal = new EventEmitter<void>();
  @Output() saveJob = new EventEmitter<CreatePositionDto | UpdatePositionDto>();

  form: FormGroup;
  areas = signal<Area[]>([]);
  competencies = signal<Competencie[]>([]);

  private areaService = inject(AreaService);
  private competencieService = inject(CompetencieService);

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      name: ['', [Validators.required]],
      description: ['', [Validators.required]],
      areaId: [null, [Validators.required]],
      competencies: [[]]
    });
  }

  ngOnInit() {
    this.areaService.findAreas({ size: 100, page: 1 }).subscribe(res => {
      if (res.data && res.data.content) this.areas.set(res.data.content);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && !changes['isOpen'].currentValue) {
      this.form.reset();
    }
    if (changes['jobData'] && this.jobData && this.isOpen) {
      this.form.patchValue({
        name: this.jobData.name || '',
        description: this.jobData.description || '',
        areaId: this.jobData.area?.id || null,
        competencies: this.jobData.competencies || []
      });
    }
  }

  onClose() { this.closeModal.emit(); }

  onSubmit() {
    if (this.form.valid) {
      const formValue = this.form.value;
      const payload = {
        name: formValue.name,
        description: formValue.description,
        areaId: formValue.areaId,
        competencies: formValue.competencies
      };
      this.saveJob.emit(payload);
    } else {
      this.form.markAllAsTouched();
    }
  }
}
