import { Component, inject, OnInit, signal } from "@angular/core";
import {
  PositionService,
  CreatePositionDto,
  UpdatePositionDto,
} from "../../../../../core/services/assessment/position.service";
import { Position } from "../../../../../core/models/assessment/position.model";
import { CommonModule } from "@angular/common";
import {
  DynamicTableComponent,
  TableColumn,
} from "../../../../../shared/components/dynamic-table/dynamic-table.component";
import { PaginatorComponent } from "../../../../../shared/components/paginator/paginator.component";
import { JobModalComponent } from "../job-modal/job-modal.component";

@Component({
  selector: "app-dashboard",
  standalone: true,
  imports: [
    CommonModule,
    DynamicTableComponent,
    PaginatorComponent,
    JobModalComponent,
  ],
  templateUrl: "./dashboard.component.html",
  styleUrl: "./dashboard.component.scss",
})
export class DashboardComponent implements OnInit {
  private service = inject(PositionService);

  positions = signal<Position[]>([]);
  size = signal<number>(10);
  page = signal<number>(1);
  totalPages = signal<number>(0);

  isModalOpen = signal(false);
  isEdit = signal(false);
  selectedJob = signal<Position | null>(null);

  columns: TableColumn<Position>[] = [
    { key: "name", label: "Nombre del Puesto" },
    { key: "description", label: "Descripción" },
    { key: "areaName", label: "Área" },
  ];

  ngOnInit(): void {
    this.fetchPositions();
  }

  fetchPositions() {
    this.service
      .findPositions({ page: this.page(), size: this.size() })
      .subscribe((res) => {
        if (res.data && res.data.content) {
          this.positions.set(res.data.content);
          this.totalPages.set(res.data.totalPages);
        }
      });
  }

  onPageChange(newPage: number) {
    this.page.set(newPage);
    this.fetchPositions();
  }

  onSizeChange(newSize: number) {
    this.size.set(newSize);
    this.page.set(1);
    this.fetchPositions();
  }

  openCreateModal() {
    this.isEdit.set(false);
    this.selectedJob.set(null);
    this.isModalOpen.set(true);
  }

  openEditModal(job: Position) {
    this.isEdit.set(true);
    this.selectedJob.set(job);
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
    this.selectedJob.set(null);
  }

  onSaveJob(dto: CreatePositionDto | UpdatePositionDto) {
    if (this.isEdit() && this.selectedJob()) {
      this.service.updatePosition(this.selectedJob()!.id, dto).subscribe({
        next: () => {
          this.closeModal();
          this.fetchPositions();
        },
        error: (err) => {
          console.error("Failed to update position", err);
        },
      });
    } else {
      this.service.createPosition(dto as CreatePositionDto).subscribe({
        next: () => {
          this.closeModal();
          this.fetchPositions();
        },
        error: (err) => {
          console.error("Failed to create position", err);
        },
      });
    }
  }

  onDeleteJob(job: Position) {
    if (
      confirm(`¿Estás seguro de que deseas eliminar el puesto "${job.name}"?`)
    ) {
      this.service.deletePosition(job.id).subscribe({
        next: () => {
          this.fetchPositions();
        },
        error: (err) => {
          console.error("Failed to delete position", err);
        },
      });
    }
  }
}
