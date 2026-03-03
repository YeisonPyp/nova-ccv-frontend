import { CommonModule } from "@angular/common";
import { Component, inject, OnInit, signal } from "@angular/core";
import { PeriodService } from "../../../../../core/services/assessment/period.service";
import { Period } from "../../../../../core/models/assessment/period.model";
import {
  EditPeriodModalComponent,
  EditPeriodDto,
} from "../edit-period-modal/edit-period-modal.component";

@Component({
  selector: "app-dashboard",
  imports: [CommonModule, EditPeriodModalComponent],
  templateUrl: "./dashboard.component.html",
  styleUrl: "./dashboard.component.scss",
})
export class DashboardComponent implements OnInit {
  service = inject(PeriodService);
  periods = signal<Array<Period>>([]);

  size = signal<number>(10);
  page = signal<number>(1);

  isModalOpen = signal<boolean>(false);
  selectedPeriod = signal<Period | null>(null);

  private fetchPeriods() {
    this.service
      .findCurrentPeriods({ size: this.size(), page: this.page() })
      .subscribe((response) => {
        this.periods.set(response.data.content);
      });
  }

  ngOnInit(): void {
    this.fetchPeriods();
  }

  onPageChange(page: number): void {
    this.page.set(page);
    this.fetchPeriods();
  }

  onSizeChange(size: number): void {
    this.size.set(size);
    this.fetchPeriods();
  }

  openCreateModal(): void {
    this.selectedPeriod.set(null);
    this.isModalOpen.set(true);
  }

  openEditModal(period: Period): void {
    this.selectedPeriod.set(period);
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.selectedPeriod.set(null);
  }

  onSavePeriod(dto: EditPeriodDto): void {
    const currentPeriod = this.selectedPeriod();

    const request$ = currentPeriod
      ? this.service.updatePeriod(currentPeriod.id, dto)
      : this.service.createPeriod(dto);

    request$.subscribe({
      next: () => {
        this.closeModal();
        this.fetchPeriods();
      },
      error: (err) => {
        console.error("Failed to save period", err);
      },
    });
  }
}
