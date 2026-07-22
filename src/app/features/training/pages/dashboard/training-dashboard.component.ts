import { Component, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TrainingService } from '@/app/core/services/training/training.service';
import { Training } from '@/app/core/models/training/training.models';
import { TrainingCardComponent } from '../../components/training-card/training-card.component';
import { PaginatorComponent } from '@/app/shared/components/paginator/paginator.component';
import { LoadingSpinnerComponent } from '@/app/shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-training-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    PaginatorComponent,
    TrainingCardComponent,
    LoadingSpinnerComponent,
  ],
  templateUrl: './training-dashboard.component.html',
})
export class TrainingDashboardComponent {
  private readonly service = inject(TrainingService);
  private readonly router = inject(Router);

  items = signal<Training[]>([]);
  isLoading = signal(false);
  page = signal(1);
  pages = signal(0);
  size = signal(10);

  constructor() {
    effect(() => {
      this.isLoading.set(true);
      this.service.findAll({ page: this.page() - 1, size: 9 }).subscribe({
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

  openCreateModal() {
    this.router.navigate(['/training/create']);
  }
}
