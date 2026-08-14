import { Component, computed, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { PatActivityService } from '@/app/core/services/pat/pat-activity.service';
import { PatActivity } from '@/app/core/models/pat/pat-models';
import { PaginationTableComponent } from '@/app/shared/components/pagination-table/pagination-table.component';
import { TableColumn } from '@/app/shared/components/dynamic-table/dynamic-table.component';

@Component({
  selector: 'app-tactical-activities-tab',
  standalone: true,
  imports: [CommonModule, RouterLink, PaginationTableComponent],
  templateUrl: './tactical-activities-tab.component.html',
})
export class TacticalActivitiesTabComponent {
  private readonly router = inject(Router);
  readonly service = inject(PatActivityService);

  year = input.required<number>();

  baseRsqlQuery = computed(() => `year==${this.year()}`);

  tableColumns: TableColumn[] = [
    { key: 'code', label: 'Código' },
    { key: 'name', label: 'Nombre' },
    {
      key: 'startsAt',
      label: 'Inicio',
      valueCallBack: (a: PatActivity) => this.date(a.startsAt),
    },
    {
      key: 'endsAt',
      label: 'Fin',
      valueCallBack: (a: PatActivity) => this.date(a.endsAt),
    },
    {
      key: 'approvedBudget',
      label: 'Presupuesto Aprobado',
      valueCallBack: (a: PatActivity) => this.money(a.approvedBudget),
    },
    {
      key: 'executedBudget',
      label: 'Presupuesto Ejecutado',
      valueCallBack: (a: PatActivity) => this.money(a.executedBudget),
    },
  ];

  openCreate(): void {
    this.router.navigate([`/pat/${this.year()}/activities/create`]);
  }

  private money(v: number | null | undefined): string {
    return (v ?? 0).toLocaleString('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    });
  }

  private date(v: string | null | undefined): string {
    if (!v) return '—';
    return new Date(v).toLocaleDateString('es-CO');
  }
}
