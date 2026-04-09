import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  DynamicTableComponent,
  TableColumn,
} from '../../../../../shared/components/dynamic-table/dynamic-table.component';
import { PaginatorComponent } from '../../../../../shared/components/paginator/paginator.component';
import { ImprovementPlanService } from '../../../../../core/services/improvement-plan/improvement-plan.service';
import { ImprovementPlan } from '../../../../../core/models/improvement-plan/improvement-plan.model';
import { EditImprovementPlanModalComponent } from '../edit-improvement-plan-modal/edit-improvement-plan-modal.component';
import { ImprovementPlanMetricsCardsComponent } from '../components/improvement-plan-metrics-cards/improvement-plan-metrics-cards.component';

@Component({
  selector: 'app-improvement-plan-list',
  standalone: true,
  imports: [
    CommonModule,
    DynamicTableComponent,
    PaginatorComponent,
    EditImprovementPlanModalComponent,
    ImprovementPlanMetricsCardsComponent,
  ],
  templateUrl: './improvement-plan-list.component.html',
  styleUrls: ['./improvement-plan-list.component.scss'],
})
export class ImprovementPlanListComponent implements OnInit {
  private improvementPlanService = inject(ImprovementPlanService);

  plans = signal<ImprovementPlan[]>([]);
  currentPage = signal<number>(1);
  totalPages = signal<number>(1);
  pageSize = signal<number>(10);

  loading = signal(false);
  error = signal<string | null>(null);

  isModalOpen = signal(false);
  selectedPlanId = signal<number | null>(null);

  columns: TableColumn<ImprovementPlan>[] = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Nombre' },
    { key: 'controlEntityName', label: 'Entidad de Control' },
    { key: 'completedAt', label: 'Completado en' },
    { key: 'createdAt', label: 'Creado en' },
  ];

  ngOnInit(): void {
    this.loadPlans();
  }

  loadPlans(page: number = 1): void {
    this.loading.set(true);
    this.improvementPlanService
      .findElements(page - 1, this.pageSize())
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.plans.set(response.data.content);
            this.currentPage.set(response.data.pageable.pageNumber + 1);
            this.totalPages.set(Math.max(1, response.data.totalPages));
          }
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set('Error loading improvement plans');
          this.loading.set(false);
          console.error(err);
        },
      });
  }

  onPageChange(page: number): void {
    this.loadPlans(page);
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.loadPlans(1);
  }

  openModal(plan?: ImprovementPlan): void {
    if (plan) {
      this.selectedPlanId.set(plan.id);
    } else {
      this.selectedPlanId.set(null);
    }
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.selectedPlanId.set(null);
  }

  onPlanSaved(p: ImprovementPlan): void {
    this.loadPlans(this.currentPage());
  }

  onPlanUpdated(p: ImprovementPlan) {
    console.log(p);
    this.plans.set(
      this.plans().map((i) => {
        if (i.id === p.id) {
          return p;
        }
        return i;
      }),
    );
  }

  deletePlan(plan: ImprovementPlan): void {
    if (confirm(`¿Estás seguro de eliminar el plan "${plan.name}"?`)) {
      this.improvementPlanService.deleteById(plan.id).subscribe({
        next: (res) => {
          if (res.success) {
            this.loadPlans(this.currentPage());
          }
        },
        error: (err) => console.error('Error deleting plan:', err),
      });
    }
  }

  isAdmin(): boolean {
    return true;
  }
}
