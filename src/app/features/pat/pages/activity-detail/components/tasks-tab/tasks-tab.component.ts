import { Component, effect, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  DynamicTableComponent,
  TableColumn,
} from '@/app/shared/components/dynamic-table/dynamic-table.component';
import { PatActivityTaskService } from '@/app/core/services/pat/pat-activity-task.service';
import { PatActivityTask } from '@/app/core/models/pat/pat-models';
import { PatTaskUpsertModalComponent } from './components/task-upsert-modal.component';
import { ProjectSectionCardComponent } from '@/app/features/projects/pages/project-detail/components/project-section-card/project-section-card.component';

@Component({
  selector: 'app-pat-tasks-tab',
  standalone: true,
  imports: [
    CommonModule,
    DynamicTableComponent,
    PatTaskUpsertModalComponent,
    ProjectSectionCardComponent,
  ],
  templateUrl: './tasks-tab.component.html',
})
export class PatTasksTabComponent {
  private readonly service = inject(PatActivityTaskService);
  private readonly router = inject(Router);

  activityId = input.required<number>();
  year = input<number | undefined>(undefined);
  tasks = signal<PatActivityTask[]>([]);

  upsertModalOpen = signal(false);
  editingTask = signal<PatActivityTask | null>(null);

  readonly columns: TableColumn[] = [
    { key: 'name', label: 'Nombre' },
    { key: 'description', label: 'Descripción' },
    { key: 'area.name', label: 'Área' },
    { key: 'costCenter.name', label: 'Centro de Costo' },
  ];

  constructor() {
    effect(() => {
      this.service.findByActivity(this.activityId()).subscribe((res) => {
        if (res.success) this.tasks.set(res.data);
      });
    });
  }

  openCreate(): void {
    this.editingTask.set(null);
    this.upsertModalOpen.set(true);
  }

  openEdit(task: PatActivityTask): void {
    this.editingTask.set(task);
    this.upsertModalOpen.set(true);
  }

  openDetail(task: PatActivityTask): void {
    this.router.navigate([`/pat/${this.year()}/tasks`, task.id]);
  }

  closeUpsertModal(): void {
    this.upsertModalOpen.set(false);
    this.editingTask.set(null);
  }

  onSaved(task: PatActivityTask): void {
    const current = this.tasks();
    const idx = current.findIndex((t) => t.id === task.id);
    if (idx >= 0) {
      const updated = [...current];
      updated[idx] = task;
      this.tasks.set(updated);
    } else {
      this.tasks.set([...current, task]);
    }
    this.closeUpsertModal();
  }

  delete(task: PatActivityTask): void {
    if (!confirm(`¿Eliminar la tarea "${task.name}"?`)) return;
    this.service.delete(task.id).subscribe({
      next: () => {
        this.tasks.set(this.tasks().filter((t) => t.id !== task.id));
      },
    });
  }
}
