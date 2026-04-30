import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PatApiService } from '../../../../core/services/pat-api.service';
import { DashboardStats, ProgramWithMetrics, ProgramStatus } from '../../models/pat.models';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterLink, CurrencyPipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  stats = signal<DashboardStats | null>(null);
  programs = signal<ProgramWithMetrics[]>([]);
  loading = signal(true);

  topPrograms = computed(() =>
    this.programs()
      .filter(p => p.status === 'IN_PROGRESS' || p.status === 'APPROVED')
      .slice(0, 4)
  );

  statusSummary = computed(() => {
    const progs = this.programs();
    const statuses: Array<{ status: ProgramStatus; label: string; count: number; budget: number }> = [
      { status: 'IN_PROGRESS', label: 'En Ejecución', count: 0, budget: 0 },
      { status: 'APPROVED', label: 'Aprobados', count: 0, budget: 0 },
      { status: 'DRAFT', label: 'Borrador', count: 0, budget: 0 },
      { status: 'CLOSED', label: 'Cerrados', count: 0, budget: 0 }
    ];

    progs.forEach(p => {
      const s = statuses.find(s => s.status === p.status);
      if (s) {
        s.count++;
        s.budget += p.plannedBudget;
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
      'DRAFT': 'Borrador',
      'APPROVED': 'Aprobado',
      'IN_PROGRESS': 'En Ejecución',
      'CLOSED': 'Cerrado'
    };
    return labels[status] || status;
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      'DRAFT': 'borrador',
      'APPROVED': 'aprobado',
      'IN_PROGRESS': 'ejecucion',
      'CLOSED': 'cerrado'
    };
    return map[status] ?? status.toLowerCase();
  }
}
