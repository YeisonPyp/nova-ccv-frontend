import { Component, OnInit, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ControlEntityModalComponent } from "./components/control-entity-modal/control-entity-modal.component";
import { ControlEntity } from "@/app/core/models/improvement-plan/control-entity.model";
import { ControlEntityService } from "@/app/core/services/improvement-plan/control-entity.service";
import {
  DynamicTableComponent,
  TableColumn,
} from "@/app/shared/components/dynamic-table/dynamic-table.component";
import { PaginationComponent } from "@/app/shared/components/pagination/pagination.component";
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
    this.controlEntityService
      .findAll({ page: page - 1, size: this.pageSize })
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.entities.set(response.data.content);
            this.currentPage.set(response.data.pageable.pageNumber);
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
