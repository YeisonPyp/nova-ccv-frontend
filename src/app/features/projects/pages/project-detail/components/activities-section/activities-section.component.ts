import { Component, effect, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectActivity } from '@/app/core/models/projects/project.model';
import { ProjectService } from '@/app/core/services/projects/project.service';
import { ActivityCardComponent } from './activity-card.component/activity-card.component';
import { LoadingSpinnerComponent } from '@/app/shared/components/loading-spinner/loading-spinner.component';
import { ProjectSectionCardComponent } from '../project-section-card/project-section-card.component';
import { GanntSectionComponent } from '../gantt-section/gannt-section.component';
import { ActivityUpsertModalComponent } from '../activity-upsert-modal/activity-upsert-modal.component';

@Component({
  selector: 'app-activities-section',
  standalone: true,
  imports: [
    CommonModule,
    ProjectSectionCardComponent,
    ActivityCardComponent,
    LoadingSpinnerComponent,
    GanntSectionComponent,
    ActivityUpsertModalComponent,
  ],
  templateUrl: './activities-section.component.html',
})
export class ActivitesSectionComponent {
  private readonly service = inject(ProjectService);
  projectId = input.required<number>();

  activities = signal<ProjectActivity[]>([]);
  modalGanntIsOpen = signal(false);
  isLoading = signal<boolean>(false);

  activityModalOpen = signal(false);
  editingActivity = signal<ProjectActivity | null>(null);

  constructor() {
    effect(() => {
      this.isLoading.set(true);
      this.service.findActivities(this.projectId()).subscribe((res) => {
        this.isLoading.set(false);
        this.activities.set(res.data);
      });
    });
  }

  openCreateActivity(): void {
    this.editingActivity.set(null);
    this.activityModalOpen.set(true);
  }

  openEditActivity(activity: ProjectActivity): void {
    this.editingActivity.set(activity);
    this.activityModalOpen.set(true);
  }

  closeActivityModal(): void {
    this.activityModalOpen.set(false);
    this.editingActivity.set(null);
  }

  onActivitySaved(activity: ProjectActivity): void {
    const current = this.activities();
    const idx = current.findIndex((a) => a.id === activity.id);
    if (idx >= 0) {
      const updated = [...current];
      updated[idx] = activity;
      this.activities.set(updated);
    } else {
      this.activities.set([...current, activity]);
    }
    this.closeActivityModal();
  }

  openGannt() {
    this.modalGanntIsOpen.set(true);
  }

  closeGannt() {
    this.modalGanntIsOpen.set(false);
  }
}
