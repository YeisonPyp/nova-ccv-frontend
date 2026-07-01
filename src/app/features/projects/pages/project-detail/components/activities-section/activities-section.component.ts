import {
  Component,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  DynamicTableComponent,
  TableColumn,
} from '@/app/shared/components/dynamic-table/dynamic-table.component';
import { ProjectActivity } from '@/app/core/models/projects/project.model';
import { PriorityLabelPipe } from '../pipes/priority';
import { Router } from '@angular/router';
import { ProjectActivitiesService } from '@/app/core/services/projects/project-activites.service';
import { PaginatorComponent } from '@/app/shared/components/paginator/paginator.component';
import { ProjectService } from '@/app/core/services/projects/project.service';
import { ActivityCardComponent } from './activity-card.component/activity-card.component';
import { LoadingSpinnerComponent } from '@/app/shared/components/loading-spinner/loading-spinner.component';
import { ProjectSectionCardComponent } from '../project-section-card/project-section-card.component';

@Component({
  selector: 'app-activities-section',
  standalone: true,
  imports: [
    CommonModule,
    ProjectSectionCardComponent,
    PaginatorComponent,
    ActivityCardComponent,
    LoadingSpinnerComponent,
  ],
  templateUrl: './activities-section.component.html',
})
export class ActivitesSectionComponent {
  private readonly router = inject(Router);
  private readonly service = inject(ProjectService);
  projectId = input.required<number>();

  pageSize = signal<number>(10);
  page = signal<number>(1);
  totalPages = signal<number>(1);

  activities = signal<ProjectActivity[]>([]);

  isLoading = signal<boolean>(false);

  constructor() {
    effect(() => {
      const [projectId, page, size] = [
        this.projectId(),
        this.page(),
        this.pageSize(),
      ];
      this.isLoading.set(true);
      this.service
        .findActivities({ page, projectId, size })
        .subscribe((res) => {
          this.isLoading.set(false);
          this.totalPages.set(res.data.totalPages);
          this.activities.set(res.data.content);
        });
    });
  }

  openCreateActivity() {
    // this.router.navigate([])
  }
}
