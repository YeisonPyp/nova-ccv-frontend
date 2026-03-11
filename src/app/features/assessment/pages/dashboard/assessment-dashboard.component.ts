import { Component, inject, OnInit, signal } from "@angular/core";
import { AssessmentService } from "../../../../core/services/assessment/assessment.service";
import { CommonModule } from "@angular/common";
import { CurrentPeriodsCarouselComponent } from "../periods/current-periods-carousel/current-periods-carousel.component";
import { Period } from "../../../../core/models/assessment/period.model";
import { AssessmentTableComponent } from "./assessment-table/assessment-table.component";
import { AuthService } from "../../../../core/services/auth.service";
import { Assessment } from "../../../../core/models/assessment/assessment.model";
import {
  EditAssesmentDto,
  EditAssessmentModalComponent,
} from "./edit-assessment-modal/edit-assessment-modal.component";
import {
  CreateAssessmentDto,
  CreateAssessmentModalComponent,
} from "./create-assessment-modal/create-assessment-modal.component";
import { PaginatorComponent } from "../../../../shared/components/paginator/paginator.component";

@Component({
  selector: "app-assessment-dashboard",
  imports: [
    CommonModule,
    CurrentPeriodsCarouselComponent,
    AssessmentTableComponent,
    EditAssessmentModalComponent,
    CreateAssessmentModalComponent,
    PaginatorComponent,
  ],
  templateUrl: "./assessment-dashboard.component.html",
  styleUrl: "./assessment-dashboard.component.scss",
})
export class AssessmentDashboardComponent implements OnInit {
  assesmentService = inject(AssessmentService);
  authService = inject(AuthService);
  selectedPeriod = signal<Period | undefined>(undefined);
  size = signal(20);
  page = signal(0);
  pages = signal(0);
  isModalOpen = signal<boolean>(false);
  selectedAssessment = signal<Assessment | null>(null);

  assessments = signal<Assessment[]>([]);

  selectPeriod(period: Period) {
    this.selectedPeriod.set(period);
  }

  get canCreate(): boolean {
    return (
      this.authService.hasRole("ROLE_ADMIN") ||
      this.authService.hasRole("ROLE_HR")
    );
  }

  openEditModal(a: Assessment) {
    this.selectedAssessment.set(a);
    this.isModalOpen.set(true);
  }

  ngOnInit(): void {
    this.fetchPage(this.page());
  }

  fetchPage(p: number) {
    this.page.set(p);
    const period = this.selectedPeriod();
    // if (!period) return;
    this.assesmentService
      .findAssessments({ page: p, size: this.size() })
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

  onEditSubmit(data: EditAssesmentDto) {}

  onCreateSubmit(data: CreateAssessmentDto) {
    this.assesmentService.createAssessment(data).subscribe((result) => {
      if (result.success && result.data) {
        this.fetchPage(this.page());
        this.closeModal();
      }
    });
  }

  openCreateModal() {
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
    this.selectedAssessment.set(null);
  }
}
