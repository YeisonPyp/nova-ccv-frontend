import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PatApiService } from '../../../../core/services/pat-api.service';
import { ProgramWithMetrics, ProgramStatus } from '../../models/pat.models';

@Component({
  selector: 'app-programs',
  imports: [CommonModule, RouterLink, FormsModule, CurrencyPipe],
  templateUrl: './programs.component.html',
  styleUrl: './programs.component.scss'
})
export class ProgramsComponent implements OnInit {
  programs = signal<ProgramWithMetrics[]>([]);
  loading = signal(true);
  searchTerm = '';
  statusFilter = signal<ProgramStatus | null>(null);

  statusOptions = [
    { value: 'EJECUCION' as ProgramStatus, label: 'En Ejecución' },
    { value: 'APROBADO' as ProgramStatus, label: 'Aprobado' },
    { value: 'BORRADOR' as ProgramStatus, label: 'Borrador' },
    { value: 'CERRADO' as ProgramStatus, label: 'Cerrado' }
  ];

  filteredPrograms = computed(() => {
    let result = this.programs();

    // Filter by status
    const status = this.statusFilter();
    if (status) {
      result = result.filter(p => p.estado === status);
    }

    // Filter by search term
    const term = this.searchTerm.toLowerCase().trim();
    if (term) {
      result = result.filter(p =>
        p.nombre.toLowerCase().includes(term) ||
        p.codigo.toLowerCase().includes(term) ||
        p.area.toLowerCase().includes(term) ||
        p.responsable.toLowerCase().includes(term)
      );
    }

    return result;
  });

  totalBudget = computed(() =>
    this.filteredPrograms().reduce((sum, p) => sum + p.totalPlaneado, 0)
  );

  averageMetaProgress = computed(() => {
    const progs = this.filteredPrograms();
    if (progs.length === 0) return 0;
    const sum = progs.reduce((s, p) => s + p.metaEjecutadaPct, 0);
    return Math.round(sum / progs.length);
  });

  constructor(private patApi: PatApiService) {}

  ngOnInit(): void {
    this.loadPrograms();
  }

  loadPrograms(): void {
    this.loading.set(true);
    this.patApi.getProgramsWithMetrics().subscribe(programs => {
      this.programs.set(programs);
      this.loading.set(false);
    });
  }

  filterByStatus(status: ProgramStatus | null): void {
    this.statusFilter.set(status);
  }

  countByStatus(status: ProgramStatus): number {
    return this.programs().filter(p => p.estado === status).length;
  }

  applyFilters(): void {
    // Triggers computed recalculation
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.statusFilter.set(null);
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'BORRADOR': 'Borrador',
      'APROBADO': 'Aprobado',
      'EJECUCION': 'En Ejecución',
      'CERRADO': 'Cerrado'
    };
    return labels[status] || status;
  }
}