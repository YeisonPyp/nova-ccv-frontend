import { AuthService } from '@/app/core/services/auth.service';
import {
  ProjectFile,
  ProjectService,
} from '@/app/core/services/projects/project.service';
import { FileItemComponent } from '@/app/shared/components/file-item/file-item.component';
import { LoadingSpinnerComponent } from '@/app/shared/components/loading-spinner/loading-spinner.component';
import { CommonModule } from '@angular/common';
import { Component, effect, inject, input, signal } from '@angular/core';

@Component({
  selector: 'app-files-tab',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent, FileItemComponent],
  templateUrl: './files-tab.component.html',
})
export class FilesTabComponent {
  private readonly service = inject(ProjectService);
  private readonly authService = inject(AuthService);
  projectId = input.required<number>();

  loading = signal(false);
  elements = signal<ProjectFile[]>([]);

  constructor() {
    effect(() => {
      this.loading.set(true);
      this.service.findProjectFiles(this.projectId()).subscribe((res) => {
        this.elements.set(res.data);
        this.loading.set(false);
      });
    });
  }

  uploadFile(file: File, element?: ProjectFile) {
    const $req = element?.id
      ? this.service.updateProjectFile(element.id, file)
      : this.service.uploadProjectFile(this.projectId(), file);
    $req.subscribe((res) => {
      const elementsMap = this.elements().reduce(
        (prev, curr) => {
          prev[curr.id] = curr;
          return prev;
        },
        {} as Record<number, ProjectFile>,
      );
      elementsMap[res.data.id] = res.data;
      this.elements.set(Object.values(elementsMap));
    });
  }

  deleteFile(element: ProjectFile) {
    this.service.deleteProjectFile(element.id).subscribe(() => {
      this.elements.set(this.elements().filter((e) => e.id !== element.id));
    });
  }

  canEdit() {
    return this.authService.hasPermission('PROJECTS_UPDATE');
  }
}
