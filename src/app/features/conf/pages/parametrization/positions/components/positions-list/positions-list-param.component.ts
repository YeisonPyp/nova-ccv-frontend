import { CommonModule } from "@angular/common";
import { Component, inject, signal } from "@angular/core";
import { AuthService } from "../../../../../../../core/services/auth.service";
import {
  PositionService,
  CreatePositionDto,
  UpdatePositionDto,
} from "../../../../../../../core/services/assessment/position.service";
import { Position } from "../../../../../../../core/models/assessment/position.model";
import {
  DynamicTableComponent,
  TableColumn,
} from "../../../../../../../shared/components/dynamic-table/dynamic-table.component";
import { PaginationComponent } from "../../../../../../../shared/components/pagination/pagination.component";
import { JobModalComponent } from "../../job-modal/job-modal.component";

@Component({
  selector: "app-positions-list-param",
  standalone: true,
  imports: [CommonModule, DynamicTableComponent, PaginationComponent, JobModalComponent],
  templateUrl: "./positions-list-param.component.html",
  styles: [
    `
      @keyframes slideUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .modal-overlay {
        position: fixed; inset: 0; z-index: 50;
        display: flex; align-items: center; justify-content: center;
        background: rgba(0,0,0,0.4); backdrop-filter: blur(4px);
      }
      .modal-box {
        background: #fff; border-radius: 12px; padding: 24px;
        width: 100%; max-width: 480px;
        box-shadow: 0 20px 60px rgba(0,0,0,0.15);
        animation: slideUp 0.2s ease-out;
      }
      .modal-title { font-size: 1.1rem; font-weight: 600; margin-bottom: 16px; }
      .modal-footer { display: flex; justify-content: flex-end; gap: 8px; margin-top: 20px; }
    `,
  ],
})
export class PositionsListParamComponent {
  private readonly auth = inject(AuthService);
  private readonly positionService = inject(PositionService);

  positions = signal<Position[]>([]);
  positionPage = signal(1);
  positionSize = signal(10);
  positionTotalPages = signal(0);
  positionsLoaded = signal(false);

  jobModalOpen = signal(false);
  isEditPosition = signal(false);
  editingPosition = signal<Position | null>(null);

  showDeletePositionModal = signal(false);
  deletingPosition = signal<Position | null>(null);

  positionColumns: TableColumn<Position>[] = [
    { key: "name", label: "Nombre" },
    { key: "areaName", label: "Área" },
    { key: "description", label: "Descripción" },
  ];

  get canReadPosition() { return this.auth.hasPermission("POSITION_READ"); }
  get canCreatePosition() { return this.auth.hasPermission("POSITION_CREATE"); }
  get canUpdatePosition() { return this.auth.hasPermission("POSITION_UPDATE"); }
  get canDeletePosition() { return this.auth.hasPermission("POSITION_DELETE"); }

  onPositionsToggle(event: Event) {
    if ((event.target as HTMLDetailsElement).open && !this.positionsLoaded()) {
      this.loadPositions(1);
    }
  }

  loadPositions(page: number) {
    this.positionPage.set(page);
    this.positionsLoaded.set(true);
    this.positionService
      .findPositions({ page: page - 1, size: this.positionSize() })
      .subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.positions.set(res.data.content);
            this.positionTotalPages.set(res.data.totalPages);
          }
        },
        error: () => this.positionsLoaded.set(false),
      });
  }

  openCreatePosition() {
    this.editingPosition.set(null);
    this.isEditPosition.set(false);
    this.jobModalOpen.set(true);
  }

  openEditPosition(position: Position) {
    this.editingPosition.set(position);
    this.isEditPosition.set(true);
    this.jobModalOpen.set(true);
  }

  closeJobModal() {
    this.jobModalOpen.set(false);
    this.editingPosition.set(null);
    this.isEditPosition.set(false);
  }

  onSaveJob(dto: CreatePositionDto | UpdatePositionDto) {
    if (this.isEditPosition()) {
      const position = this.editingPosition()!;
      this.positionService.updatePosition(position.id, dto as UpdatePositionDto).subscribe({
        next: () => { this.closeJobModal(); this.loadPositions(this.positionPage()); },
      });
    } else {
      this.positionService.createPosition(dto as CreatePositionDto).subscribe({
        next: () => { this.closeJobModal(); this.loadPositions(this.positionPage()); },
      });
    }
  }

  openDeletePosition(position: Position) {
    this.deletingPosition.set(position);
    this.showDeletePositionModal.set(true);
  }

  closeDeletePositionModal() {
    this.showDeletePositionModal.set(false);
    this.deletingPosition.set(null);
  }

  confirmDeletePosition() {
    const position = this.deletingPosition();
    if (!position) return;
    this.positionService.deletePosition(position.id).subscribe({
      next: () => { this.closeDeletePositionModal(); this.loadPositions(this.positionPage()); },
    });
  }
}
