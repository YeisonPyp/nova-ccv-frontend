import { Component, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { TrainingProgramService } from '@/app/core/services/training/training-program.service';
import { TrainingProgram } from '@/app/core/models/training/training-program.models';
import { ProgramCardComponent } from '../../components/program-card/program-card.component';
import { PaginatorComponent } from '@/app/shared/components/paginator/paginator.component';
import { LoadingSpinnerComponent } from '@/app/shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-programs-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ProgramCardComponent,
    PaginatorComponent,
    LoadingSpinnerComponent,
  ],
  templateUrl: './programs-dashboard.component.html',
})
export class ProgramsDashboardComponent {
  private readonly service = inject(TrainingProgramService);
  private readonly router = inject(Router);

  items = signal<TrainingProgram[]>([]);
  isLoading = signal(false);
  page = signal(1);
  pages = signal(0);
  size = signal(9);

  constructor() {
    effect(() => {
      this.isLoading.set(true);
      this.service
        .findAll({ page: this.page() - 1, size: this.size() })
        .subscribe({
          next: (res) => {
            if (res.success && res.data) {
              this.items.set(res.data.content);
              this.pages.set(res.data.totalPages);
            }
            this.isLoading.set(false);
          },
          error: () => this.isLoading.set(false),
        });
    });
  }

  openCreate() {
    this.router.navigate(['/training/programs/create']);
  }
}
