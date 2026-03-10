import { Component, inject, OnInit, signal } from "@angular/core";
import {
  AreaService,
  CreateAreaDto,
} from "../../../../core/services/assessment/area.service";
import { Area } from "../../../../core/models/assessment/area.model";
import { CommonModule } from "@angular/common";
import {
  DynamicTableComponent,
  TableColumn,
} from "../../../../shared/components/dynamic-table/dynamic-table.component";
import { PaginatorComponent } from "../../../../shared/components/paginator/paginator.component";
import { CreateAreaModalComponent } from "./create-area-modal/create-area-modal.component";

@Component({
  selector: "app-areas",
  standalone: true,
  imports: [
    CommonModule,
    DynamicTableComponent,
    PaginatorComponent,
    CreateAreaModalComponent,
  ],
  templateUrl: "./areas.component.html",
  styleUrl: "./areas.component.scss",
})
export class AreasComponent implements OnInit {
  private service = inject(AreaService);

  areas = signal<Area[]>([]);
  size = signal<number>(10);
  page = signal<number>(0);
  totalPages = signal<number>(0);

  isCreateModalOpen = signal(false);

  columns: TableColumn<Area>[] = [
    { key: "id", label: "ID" },
    { key: "name", label: "Nombre del Área" },
  ];

  ngOnInit(): void {
    this.fetchAreas();
  }

  fetchAreas() {
    this.service
      .findAreas({ page: this.page(), size: this.size() })
      .subscribe((res) => {
        if (res.data && res.data.content) {
          this.areas.set(res.data.content);
          this.totalPages.set(res.data.totalPages);
        }
      });
  }

  onPageChange(newPage: number) {
    this.page.set(newPage);
    this.fetchAreas();
  }

  onSizeChange(newSize: number) {
    this.size.set(newSize);
    this.page.set(1);
    this.fetchAreas();
  }

  openCreateModal() {
    this.isCreateModalOpen.set(true);
  }

  closeModal() {
    this.isCreateModalOpen.set(false);
  }

  onSaveArea(dto: CreateAreaDto) {
    this.service.createArea(dto).subscribe({
      next: () => {
        this.closeModal();
        this.fetchAreas();
      },
      error: (err) => {
        console.error("Failed to create area", err);
      },
    });
  }
}
