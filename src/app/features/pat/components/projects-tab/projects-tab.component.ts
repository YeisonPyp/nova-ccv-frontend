import { Project } from '@/app/core/models/projects/project.model';
import { ProjectService } from '@/app/core/services/projects/project.service';
import { PaginationComponent } from '@/app/shared/components/pagination/pagination.component';
import { Component, effect, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ProjectCardComponent } from './project-card/project-card.component';
import { LoadingSpinnerComponent } from '@/app/shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-projects-tab',
  standalone: true,
  imports: [PaginationComponent, ProjectCardComponent, LoadingSpinnerComponent],
  templateUrl: './projects-tab.component.html',
})
export class ProjectsTabComponent {
  private readonly service = inject(ProjectService);
  private readonly router = inject(Router);

  year = input.required<number>();
  projects = signal<Project[]>([]);
  selectedStatus = signal<string | null>(null);

  currentPage = signal<number>(1);
  totalPages = signal(0);
  isLoading = signal(false);
  size = signal(10);

  constructor() {
    effect(() => {
      const status = this.selectedStatus();
      const year = this.year();
      const page = this.currentPage() - 1;
      const size = this.size();

      this.isLoading.set(true);
      this.service.findAll({ status, page, size, year }).subscribe((res) => {
        this.isLoading.set(false);
        this.projects.set(res.data.content);
        this.totalPages.set(res.data.totalPages);
      });
    });
  }

  openCreate(): void {
    this.router.navigate(['/projects/create']);
  }
}
