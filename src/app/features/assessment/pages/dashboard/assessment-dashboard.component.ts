import { Component, inject, OnInit, signal } from '@angular/core';
import { AssessmentService } from '@/app/core/services/assessment/assessment.service';
import { CommonModule } from '@angular/common';
import { Period } from '@/app/core/models/assessment/period.model';
import { AssessmentTableComponent } from './assessment-table/assessment-table.component';
import { AuthService } from '@/app/core/services/auth.service';
import { Assessment } from '@/app/core/models/assessment/assessment.model';
import {
  CreateAssessmentDto,
  CreateAssessmentModalComponent,
} from './create-assessment-modal/create-assessment-modal.component';
import { PaginatorComponent } from '@/app/shared/components/paginator/paginator.component';
import { PeriodSelectorComponent } from './period-selector/period-selector.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-assessment-dashboard',
  imports: [
    CommonModule,
    AssessmentTableComponent,
    CreateAssessmentModalComponent,
    PaginatorComponent,
    PeriodSelectorComponent,
  ],
  templateUrl: './assessment-dashboard.component.html',
  styleUrl: './assessment-dashboard.component.scss',
})
export class AssessmentDashboardComponent implements OnInit {
  assesmentService = inject(AssessmentService);
  authService = inject(AuthService);
  private readonly router = inject(Router);

  selectedPeriod = signal<Period | undefined>(undefined);
  size = signal(20);
  page = signal(1);
  pages = signal(0);
  isCreateModalOpen = signal<boolean>(false);
  assessments = signal<Assessment[]>([]);

  selectPeriod(period: Period) {
    this.selectedPeriod.set(period);
    this.fetchPage(1);
  }

  openEditModal(a: Assessment) {
    this.router.navigate(['/assessment/edit', a.id]);
  }

  goToSurveys() {
    this.router.navigate(['/assessment/surveys']);
  }

  ngOnInit(): void {
    this.fetchPage(this.page());
  }

  fetchPage(p: number) {
    this.page.set(p);
    const period = this.selectedPeriod();
    if (!period) return;
    this.assesmentService
      .findAssessments({ page: p - 1, size: this.size(), periodId: period.id })
      .subscribe((result) => {
        if (result.success && result.data && result.data.content) {
          this.pages.set(result.data.totalPages);
          this.assessments.set(result.data.content);
        }
      });
  }

  onPageSizeChange(newSize: number) {
    this.size.set(newSize);
    this.fetchPage(1);
  }

  onCreateSubmit(data: CreateAssessmentDto) {
    this.assesmentService.createAssessment(data).subscribe((result) => {
      if (result.success && result.data) {
        this.fetchPage(this.page());
        this.closeCreateModal();
      }
    });
  }

  openCreateModal() {
    this.isCreateModalOpen.set(true);
  }

  closeCreateModal() {
    this.isCreateModalOpen.set(false);
  }
}
