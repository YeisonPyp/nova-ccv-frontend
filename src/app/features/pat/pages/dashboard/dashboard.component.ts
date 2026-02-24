import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule, CurrencyPipe, PercentPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PatApiService } from '../../../../core/services/pat-api.service';
import { DashboardStats, ProgramWithMetrics } from '../../models/pat.models';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterLink, CurrencyPipe ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  stats = signal<DashboardStats | null>(null);
  programs = signal<ProgramWithMetrics[]>([]);
  loading = signal(true);

  topPrograms = computed(() => 
    this.programs()
      .filter(p => p.estado === 'EJECUCION' || p.estado === 'APROBADO')
      .slice(0, 4)
  );

  statusSummary = computed(() => {
    const progs = this.programs();
    const statuses: Array<{estado: string; label: string; count: number; presupuesto: number}> = [
      { estado: 'EJECUCION', label: 'En Ejecución', count: 0, presupuesto: 0 },
      { estado: 'APROBADO', label: 'Aprobados', count: 0, presupuesto: 0 },
      { estado: 'BORRADOR', label: 'Borrador', count: 0, presupuesto: 0 },
      { estado: 'CERRADO', label: 'Cerrados', count: 0, presupuesto: 0 }
    ];

    progs.forEach(p => {
      const status = statuses.find(s => s.estado === p.estado);
      if (status) {
        status.count++;
        status.presupuesto += p.totalPlaneado;
      }
    });

    return statuses;
  });

  constructor(private patApi: PatApiService) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading.set(true);

    this.patApi.getDashboardStats().subscribe(stats => {
      this.stats.set(stats);
    });

    this.patApi.getProgramsWithMetrics().subscribe(programs => {
      this.programs.set(programs);
      this.loading.set(false);
    });
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
