import { Component, effect, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { PatActivityService } from '@/app/core/services/pat/pat-activity.service';
import { PatActivity } from '@/app/core/models/pat/pat-models';
import {
  DynamicTableComponent,
  TableColumn,
} from '@/app/shared/components/dynamic-table/dynamic-table.component';
import { PaginatorComponent } from '@/app/shared/components/paginator/paginator.component';
import { ExpressionNode } from '@rsql/ast';
import builder from '@rsql/builder';

@Component({
  selector: 'app-tactical-activities-tab',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    DynamicTableComponent,
    PaginatorComponent,
  ],
  templateUrl: './tactical-activities-tab.component.html',
})
export class TacticalActivitiesTabComponent {
  private readonly router = inject(Router);
  private readonly service = inject(PatActivityService);

  year = input.required<number>();
  areaId = input<number | null>(null);

  activities = signal<PatActivity[]>([]);
  page = signal(1);
  size = signal(10);
  totalPages = signal(0);
  loading = signal(false);
  searchNodes = signal<ExpressionNode[]>([]);

  columns: TableColumn[] = [
    {
      key: 'code',
      label: 'Código',
      filterSet: { valueType: 'text', search: true },
    },
    {
      key: 'name',
      label: 'Nombre',
      filterSet: { valueType: 'text', search: true },
    },
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

  constructor() {
    effect(() => {
      this.year();
      this.areaId();
      this.page();
      this.size();
      this.searchNodes();
      this.loadActivities();
    });
  }

  private loadActivities(): void {
    this.loading.set(true);
    this.service
      .findAllForDashboard(
        {
          page: this.page() - 1,
          size: this.size(),
          nodes: [builder.eq('year', String(this.year())), ...this.searchNodes()],
        },
        this.areaId(),
      )
      .subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.activities.set(res.data.content);
            this.totalPages.set(res.data.totalPages);
          }
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  onSearchChange(nodes: ExpressionNode[]) {
    this.page.set(1);
    this.searchNodes.set(nodes);
  }

  onPageSizeChange(size: number) {
    this.page.set(1);
    this.size.set(size);
  }

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
