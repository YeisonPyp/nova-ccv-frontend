import { Component, inject, signal, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router";
import { ProjectService } from "@/app/core/services/projects/project.service";
import { Project } from "@/app/core/models/projects/project.model";
import {
  DynamicTableComponent,
  TableColumn,
} from "@/app/shared/components/dynamic-table/dynamic-table.component";
import { PaginationComponent } from "@/app/shared/components/pagination/pagination.component";

@Component({
  selector: "app-project-list",
  standalone: true,
  imports: [CommonModule, DynamicTableComponent, PaginationComponent],
  templateUrl: "./project-list.component.html",
})
export class ProjectListComponent implements OnInit {
  private readonly service = inject(ProjectService);
  private readonly router = inject(Router);

  items = signal<Project[]>([]);
  currentPage = signal(1);
  totalPages = signal(0);
  loading = signal(false);
  pageSize = 10;

  columns: TableColumn[] = [
    { key: "code", label: "Código" },
    { key: "name", label: "Nombre" },
    { key: "areaName", label: "Área" },
    { key: "status", label: "Estado" },
    { key: "priority", label: "Prioridad" },
    { key: "startDate", label: "Inicio" },
    { key: "endDate", label: "Fin" },
    { key: "totalBudget", label: "Presupuesto" },
  ];

  ngOnInit(): void {
    this.load();
  }

  load(page = 1): void {
    this.loading.set(true);
    this.service.findAll({ page: page - 1, size: this.pageSize }).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.items.set(res.data.content);
          this.currentPage.set(res.data.pageable.pageNumber + 1);
          this.totalPages.set(res.data.totalPages);
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onPageChange(page: number): void {
    this.load(page);
  }

  openDetail(project: Project): void {
    this.router.navigate(["/projects", project.id]);
  }
}
