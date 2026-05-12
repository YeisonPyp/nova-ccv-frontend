import { Component, OnInit, signal, computed } from "@angular/core";
import { CommonModule, CurrencyPipe } from "@angular/common";
import { RouterLink } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { PatApiService } from "@/app/core/services/pat-api.service";
import { ProgramWithMetrics, ProgramStatus } from "../../models/pat.models";

@Component({
  selector: "app-programs",
  imports: [CommonModule, RouterLink, FormsModule, CurrencyPipe],
  templateUrl: "./programs.component.html",
  styleUrl: "./programs.component.scss",
})
export class ProgramsComponent implements OnInit {
  programs = signal<ProgramWithMetrics[]>([]);
  loading = signal(true);
  searchTerm = "";
  statusFilter = signal<ProgramStatus | null>(null);

  statusOptions = [
    { value: "IN_PROGRESS" as ProgramStatus, label: "En Ejecución" },
    { value: "APPROVED" as ProgramStatus, label: "Aprobado" },
    { value: "DRAFT" as ProgramStatus, label: "Borrador" },
    { value: "CLOSED" as ProgramStatus, label: "Cerrado" },
  ];

  filteredPrograms = computed(() => {
    let result = this.programs();

    const status = this.statusFilter();
    if (status) {
      result = result.filter((p) => p.status === status);
    }

    const term = this.searchTerm.toLowerCase().trim();
    if (term) {
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.code.toLowerCase().includes(term) ||
          p.areaName.toLowerCase().includes(term) ||
          p.employeeName.toLowerCase().includes(term),
      );
    }

    return result;
  });

  totalBudget = computed(() =>
    this.filteredPrograms().reduce((sum, p) => sum + p.plannedBudget, 0),
  );

  averageMetaProgress = computed(() => {
    const progs = this.filteredPrograms();
    if (progs.length === 0) return 0;
    const sum = progs.reduce((s, p) => s + p.goalAchievedPct, 0);
    return Math.round(sum / progs.length);
  });

  constructor(private patApi: PatApiService) {}

  ngOnInit(): void {
    this.loadPrograms();
  }

  loadPrograms(): void {
    this.loading.set(true);
    this.patApi.getProgramsWithMetrics().subscribe((programs) => {
      this.programs.set(programs);
      this.loading.set(false);
    });
  }

  filterByStatus(status: ProgramStatus | null): void {
    this.statusFilter.set(status);
  }

  countByStatus(status: ProgramStatus): number {
    return this.programs().filter((p) => p.status === status).length;
  }

  applyFilters(): void {
    // Triggers computed recalculation
  }

  clearFilters(): void {
    this.searchTerm = "";
    this.statusFilter.set(null);
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      DRAFT: "Borrador",
      APPROVED: "Aprobado",
      IN_PROGRESS: "En Ejecución",
      CLOSED: "Cerrado",
    };
    return labels[status] || status;
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      DRAFT: "borrador",
      APPROVED: "aprobado",
      IN_PROGRESS: "ejecucion",
      CLOSED: "cerrado",
    };
    return map[status] ?? status.toLowerCase();
  }
}
