import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProgramService } from '../../services/program.service';
import { ProgramWithMetrics, ProgramStatus } from '../../models/program.model';


@Component({
  selector: 'app-programs-list',
  imports: [CommonModule, FormsModule],
  templateUrl: './programs-list.component.html',
  styleUrl: './programs-list.component.scss'
})
export class ProgramsListComponent implements OnInit {
  private programService = inject(ProgramService);
  private router = inject(Router);

  programs = signal<ProgramWithMetrics[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  selectedYear = signal<number>(new Date().getFullYear());
  
  availableYears = signal<number[]>([]);

  ngOnInit() {
    this.generateYears();
    this.loadPrograms();
  }

  private generateYears() {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 2; i <= currentYear + 2; i++) {
      years.push(i);
    }
    this.availableYears.set(years);
  }

  loadPrograms() {
    this.loading.set(true);
    this.error.set(null);
    
    this.programService.getProgramsWithMetrics(this.selectedYear())
      .subscribe({
        next: (response) => {
          this.programs.set(response.data);
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set('Error al cargar los programas');
          this.loading.set(false);
          console.error(err);
        }
      });
  }

  onYearChange() {
    this.loadPrograms();
  }

  createProgram() {
    this.router.navigate(['/pat/programs/new']);
  }

  viewProgram(id: number) {
    this.router.navigate(['/pat/programs', id]);
  }

  editProgram(id: number) {
    this.router.navigate(['/pat/programs', id, 'edit']);
  }

  deleteProgram(program: ProgramWithMetrics) {
    if (confirm(`¿Está seguro de eliminar el programa "${program.nombre}"?`)) {
      this.programService.deleteProgram(program.id).subscribe({
        next: () => {
          this.loadPrograms();
        },
        error: (err) => {
          alert('Error al eliminar el programa: ' + (err.error?.message || 'Error desconocido'));
        }
      });
    }
  }

  getStatusLabel(status: ProgramStatus): string {
    const labels = {
      [ProgramStatus.DRAFT]: 'Borrador',
      [ProgramStatus.ACTIVE]: 'Activo',
      [ProgramStatus.COMPLETED]: 'Completado',
      [ProgramStatus.CANCELLED]: 'Cancelado'
    };
    return labels[status] || status;
  }

  getStatusClass(status: ProgramStatus): string {
    const classes = {
      [ProgramStatus.DRAFT]: 'badge-secondary',
      [ProgramStatus.ACTIVE]: 'badge-success',
      [ProgramStatus.COMPLETED]: 'badge-info',
      [ProgramStatus.CANCELLED]: 'badge-danger'
    };
    return classes[status] || 'badge-secondary';
  }
}