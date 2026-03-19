import { Component, OnInit, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ControlEntityModalComponent } from "../control-entity-modal/control-entity-modal.component";
import {
  DynamicTableComponent,
  TableColumn,
} from "../../../../../shared/components/dynamic-table/dynamic-table.component";
import { PaginationComponent } from "../../../../../shared/components/pagination/pagination.component";
import { ControlEntityService } from "../../../../../core/services/improvement-plan/control-entity.service";
import { ControlEntity } from "../../../../../core/models/improvement-plan/control-entity.model";

@Component({
  selector: "app-control-entity-list",
  standalone: true,
  imports: [
    CommonModule,
    DynamicTableComponent,
    PaginationComponent,
    ControlEntityModalComponent,
  ],
  templateUrl: "./control-entity-list.component.html",
  styleUrls: ["./control-entity-list.component.scss"],
})
export class ControlEntityListComponent implements OnInit {
  private readonly controlEntityService = inject(ControlEntityService);

  entities = signal<ControlEntity[]>([]);
  currentPage = signal<number>(0);
  totalPages = signal<number>(0);
  pageSize = 10;

  loading = signal(false);
  error = signal<String | null>(null);

  isModalOpen = signal(false);
  selectedEntity = signal<ControlEntity | null>(null);

  columns: TableColumn<ControlEntity>[] = [
    { key: "id", label: "ID" },
    { key: "name", label: "Nombre" },
  ];

  ngOnInit(): void {
    this.loadEntities();
  }

  loadEntities(page: number = 1): void {
    this.controlEntityService.findAll({ page, size: this.pageSize }).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.entities.set(response.data.content);
          this.currentPage.set(response.data.pageable.pageNumber + 1);
          this.totalPages.set(response.data.totalPages);
        }
      },
      error: (err) => console.error("Error loading control entities:", err),
    });
  }

  onPageChange(page: number): void {
    this.loadEntities(page);
  }

  openModal(entity?: ControlEntity): void {
    this.selectedEntity.set(entity || null);
    this.isModalOpen.set(true);
  }

  closeModal(shouldReload: boolean = false): void {
    this.isModalOpen.set(false);
    this.selectedEntity.set(null);
    if (shouldReload) {
      this.loadEntities(this.currentPage());
    }
  }

  deleteEntity(entity: ControlEntity): void {
    if (confirm(`¿Estás seguro de eliminar la entidad "${entity.name}"?`)) {
      this.controlEntityService.delete(entity.id).subscribe({
        next: (res) => {
          if (res.success) {
            this.loadEntities(this.currentPage());
          }
        },
        error: (err) => console.error("Error deleting entity:", err),
      });
    }
  }

  onEntitySaved() {
    this.closeModal(true);
  }
}
