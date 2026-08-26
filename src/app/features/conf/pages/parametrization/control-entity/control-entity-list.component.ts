import { Component, OnInit, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ControlEntityModalComponent } from "./components/control-entity-modal/control-entity-modal.component";
import { ControlEntity } from "@/app/core/models/improvement-plan/control-entity.model";
import { ControlEntityService } from "@/app/core/services/improvement-plan/control-entity.service";
import {
  DynamicTableComponent,
  TableColumn,
} from "@/app/shared/components/dynamic-table/dynamic-table.component";
@Component({
  selector: "app-control-entity-list",
  standalone: true,
  imports: [CommonModule, DynamicTableComponent, ControlEntityModalComponent],
  templateUrl: "./control-entity-list.component.html",
  styleUrls: ["./control-entity-list.component.scss"],
})
export class ControlEntityListComponent implements OnInit {
  private readonly controlEntityService = inject(ControlEntityService);

  entities = signal<ControlEntity[]>([]);

  loading = signal(false);
  error = signal<String | null>(null);

  isModalOpen = signal(false);
  selectedEntity = signal<ControlEntity | null>(null);

  columns: TableColumn[] = [
    { key: "id", label: "ID" },
    { key: "name", label: "Nombre" },
  ];

  ngOnInit(): void {
    this.loadEntities();
  }

  loadEntities(): void {
    this.loading.set(true);
    this.controlEntityService.findAll().subscribe({
      next: (response) => {
        this.loading.set(false);
        if (response.success && response.data) {
          this.entities.set(response.data);
        }
      },
      error: (err) => {
        this.loading.set(false);
        console.error("Error loading control entities:", err);
      },
    });
  }

  openModal(entity?: ControlEntity): void {
    this.selectedEntity.set(entity || null);
    this.isModalOpen.set(true);
  }

  closeModal(shouldReload: boolean = false): void {
    this.isModalOpen.set(false);
    this.selectedEntity.set(null);
    if (shouldReload) {
      this.loadEntities();
    }
  }

  deleteEntity(entity: ControlEntity): void {
    if (confirm(`¿Estás seguro de eliminar la entidad "${entity.name}"?`)) {
      this.controlEntityService.delete(entity.id).subscribe({
        next: (res) => {
          if (res.success) {
            this.loadEntities();
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
