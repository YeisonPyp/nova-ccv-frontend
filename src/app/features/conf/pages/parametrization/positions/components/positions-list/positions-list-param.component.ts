import { CommonModule } from '@angular/common';
import { Component, effect, inject, signal } from '@angular/core';
import { AuthService } from '@/app/core/services/auth.service';
import {
  PositionService,
  CreatePositionDto,
  UpdatePositionDto,
} from '@/app/core/services/assessment/position.service';
import { Position } from '@/app/core/models/assessment/position.model';
import {
  DynamicTableComponent,
  TableColumn,
} from '@/app/shared/components/dynamic-table/dynamic-table.component';
import { JobModalComponent } from '../../job-modal/job-modal.component';
import { Router } from '@angular/router';
import { EditIconComponent } from '@/app/shared/components/edit-icon/edit-icon.component';
import { ParametrizationSectionComponent } from '@/app/features/conf/components/parametrization-section.component';
import { PaginatorComponent } from '@/app/shared/components/paginator/paginator.component';

@Component({
  selector: 'app-positions-list-param',
  standalone: true,
  imports: [
    CommonModule,
    DynamicTableComponent,
    PaginatorComponent,
    JobModalComponent,
    EditIconComponent,
    ParametrizationSectionComponent,
  ],
  templateUrl: './positions-list-param.component.html',
})
export class PositionsListParamComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly positionService = inject(PositionService);

  positions = signal<Position[]>([]);
  positionPage = signal(1);
  positionSize = signal(10);
  positionTotalPages = signal(0);
  positionsLoaded = signal(false);

  isOpen = signal(false);

  jobModalOpen = signal(false);
  isEditPosition = signal(false);
  editingPosition = signal<Position | null>(null);

  showDeletePositionModal = signal(false);
  deletingPosition = signal<Position | null>(null);

  positionColumns: TableColumn[] = [
    { key: 'name', label: 'Nombre' },
    { key: 'areaName', label: 'Área' },
    { key: 'description', label: 'Descripción' },
  ];

  constructor() {
    effect(() => {
      if (this.isOpen()) {
        this.positionService
          .findPositions({
            page: this.positionPage() - 1,
            size: this.positionSize(),
          })
          .subscribe({
            next: (res) => {
              if (res.success && res.data) {
                this.positionsLoaded.set(true);
                this.positions.set(res.data.content);
                this.positionTotalPages.set(res.data.totalPages);
              }
            },
            error: () => this.positionsLoaded.set(false),
          });
      }
    });
  }

  get canReadPosition() {
    return this.auth.hasPermission('POSITION_READ');
  }
  get canCreatePosition() {
    return this.auth.hasPermission('POSITION_CREATE');
  }
  get canUpdatePosition() {
    return this.auth.hasPermission('POSITION_UPDATE');
  }
  get canDeletePosition() {
    return this.auth.hasPermission('POSITION_DELETE');
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

  onPositionDetail(position: Position) {
    this.router.navigate(['/conf/parametrization/positions', position.id]);
  }

  closeJobModal() {
    this.jobModalOpen.set(false);
    this.editingPosition.set(null);
    this.isEditPosition.set(false);
  }

  onSaveJob(dto: CreatePositionDto | UpdatePositionDto) {
    if (this.isEditPosition()) {
      const position = this.editingPosition()!;
      this.positionService
        .updatePosition(position.id, dto as UpdatePositionDto)
        .subscribe({
          next: () => {
            this.closeJobModal();
          },
        });
    } else {
      this.positionService.createPosition(dto as CreatePositionDto).subscribe({
        next: () => {
          this.closeJobModal();
        },
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
      next: () => {
        this.closeDeletePositionModal();
      },
    });
  }
}
