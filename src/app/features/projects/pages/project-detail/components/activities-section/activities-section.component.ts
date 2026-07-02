import { Component, effect, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectActivity } from '@/app/core/models/projects/project.model';
import { Router } from '@angular/router';
import { ProjectService } from '@/app/core/services/projects/project.service';
import { ActivityCardComponent } from './activity-card.component/activity-card.component';
import { LoadingSpinnerComponent } from '@/app/shared/components/loading-spinner/loading-spinner.component';
import { ProjectSectionCardComponent } from '../project-section-card/project-section-card.component';
import { GanntSectionComponent } from '../gantt-section/gannt-section.component';

@Component({
  selector: 'app-activities-section',
  standalone: true,
  imports: [
    CommonModule,
    ProjectSectionCardComponent,
    ActivityCardComponent,
    LoadingSpinnerComponent,
    GanntSectionComponent,
  ],
  templateUrl: './activities-section.component.html',
})
export class ActivitesSectionComponent {
  private readonly router = inject(Router);
  private readonly service = inject(ProjectService);
  projectId = input.required<number>();

  activities = signal<ProjectActivity[]>([]);
  modalGanntIsOpen = signal(false);
  isLoading = signal<boolean>(false);
  constructor() {
    effect(() => {
      this.isLoading.set(true);
      this.service.findActivities(this.projectId()).subscribe((res) => {
        this.isLoading.set(false);
        this.activities.set(res.data);
      });
    });
  }

  openCreateActivity() {
    this.router.navigate([`/projects/${this.projectId()}/activities/create`]);
  }

  openGannt() {
    this.modalGanntIsOpen.set(true);
  }

  closeGannt() {
    this.modalGanntIsOpen.set(false);
  }
}
