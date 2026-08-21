import { Component, effect, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PatActivityTaskService } from '@/app/core/services/pat/pat-activity-task.service';
import { PatActivityTask } from '@/app/core/models/pat/pat-models';
import {
  DynamicTableComponent,
  TableColumn,
} from '@/app/shared/components/dynamic-table/dynamic-table.component';
import { PaginatorComponent } from '@/app/shared/components/paginator/paginator.component';
import { ExpressionNode } from '@rsql/ast';

@Component({
  selector: 'app-tasks-tab',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    DynamicTableComponent,
    PaginatorComponent,
  ],
  templateUrl: './tasks-tab.component.html',
})
export class TasksTabComponent {
  private readonly service = inject(PatActivityTaskService);

  year = input.required<number>();
  areaId = input<number | null>(null);

  /** Cut-off dates: only tasks with budget planning inside the range. */
  since = signal<string | null>(null);
  before = signal<string | null>(null);

  tasks = signal<PatActivityTask[]>([]);
  page = signal(1);
  size = signal(10);
  totalPages = signal(0);
  loading = signal(false);
  searchNodes = signal<ExpressionNode[]>([]);

  columns: TableColumn[] = [
    {
      key: 'name',
      label: 'Tarea',
      filterSet: { valueType: 'text', search: true },
    },
    {
      key: 'description',
      label: 'Descripción',
      filterSet: { valueType: 'text', search: true },
    },
    {
      key: 'activityName',
      label: 'Actividad Táctica',
      valueCallBack: (t: PatActivityTask) => t.activityName ?? '—',
    },
    {
      key: 'area',
      label: 'Área',
      valueCallBack: (t: PatActivityTask) => t.area?.name ?? '—',
    },
    {
      key: 'costCenter',
      label: 'Centro de Costo',
      valueCallBack: (t: PatActivityTask) => t.costCenter?.name ?? '—',
    },
  ];

  constructor() {
    effect(() => {
      this.year();
      this.areaId();
      this.page();
      this.size();
      this.searchNodes();
      this.since();
      this.before();
      this.loadTasks();
    });
  }

  private loadTasks(): void {
    this.loading.set(true);
    this.service
      .search(
        {
          page: this.page() - 1,
          size: this.size(),
          nodes: this.searchNodes(),
        },
        this.year(),
        this.areaId(),
        this.since(),
        this.before(),
      )
      .subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.tasks.set(res.data.content);
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

  onCutOffChange(field: 'since' | 'before', event: Event) {
    const value = (event.target as HTMLInputElement).value || null;
    this.page.set(1);
    if (field === 'since') this.since.set(value);
    else this.before.set(value);
  }

  clearCutOff() {
    this.page.set(1);
    this.since.set(null);
    this.before.set(null);
  }

  onPageSizeChange(size: number) {
    this.page.set(1);
    this.size.set(size);
  }
}
