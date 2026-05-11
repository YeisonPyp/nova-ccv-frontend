import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ProgramService } from '../../services/program.service';
import { ProgramStatus } from '../../models/program.model';

@Component({
  selector: 'app-program-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './program-form.component.html',
  styleUrl: './program-form.component.scss'
})
export class ProgramFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private programService = inject(ProgramService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  programForm!: FormGroup;
  isEditMode = signal(false);
  programId = signal<number | null>(null);
  loading = signal(false);
  submitting = signal(false);

  statuses = Object.values(ProgramStatus);
  currentYear = new Date().getFullYear();

  ngOnInit() {
    this.initForm();
    this.checkEditMode();
  }

  private initForm() {
    this.programForm = this.fb.group({
      codigo: ['', [
        Validators.required, 
        Validators.pattern(/^PRG-\d{4}-\d{3}$/)
      ]],
      nombre: ['', [Validators.required, Validators.maxLength(200)]],
      area: ['', [Validators.required, Validators.maxLength(100)]],
      responsable: ['', [Validators.required, Validators.maxLength(150)]],
      estado: [ProgramStatus.DRAFT, Validators.required],
      objetivoEstrategico: ['', Validators.maxLength(1000)],
      pilar: ['', Validators.maxLength(150)],
      beneficiarios: ['', Validators.maxLength(1000)],
      anio: [this.currentYear, [
        Validators.required, 
        Validators.min(2020), 
        Validators.max(2050)
      ]]
    });
  }

  private checkEditMode() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.programId.set(+id);
      this.loadProgram(+id);
      this.programForm.get('codigo')?.disable();
      this.programForm.get('anio')?.disable();
    }
  }

  private loadProgram(id: number) {
    this.loading.set(true);
    this.programService.getProgramById(id).subscribe({
      next: (response) => {
        this.programForm.patchValue(response.data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error(err);
        alert('Error al cargar el programa');
        this.router.navigate(['/pat/programs']);
      }
    });
  }

  generateCode() {
    const year = this.programForm.get('anio')?.value || this.currentYear;
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.programForm.patchValue({
      codigo: `PRG-${year}-${random}`
    });
  }

  onSubmit() {
    if (this.programForm.invalid) {
      this.programForm.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    const formValue = this.programForm.getRawValue();

    const request$ = this.isEditMode()
      ? this.programService.updateProgram(this.programId()!, formValue)
      : this.programService.createProgram(formValue);

    request$.subscribe({
      next: (response) => {
        alert(response.message);
        this.router.navigate(['/pat/programs']);
      },
      error: (err) => {
        this.submitting.set(false);
        alert('Error: ' + (err.error?.message || 'Error al guardar'));
      }
    });
  }

  cancel() {
    this.router.navigate(['/pat/programs']);
  }

  getStatusLabel(status: ProgramStatus): string {
    const labels = {
      [ProgramStatus.DRAFT]: 'Borrador',
      [ProgramStatus.ACTIVE]: 'Activo',
      [ProgramStatus.COMPLETED]: 'Completado',
      [ProgramStatus.CANCELLED]: 'Cancelado'
    };
    return labels[status];
  }
}
