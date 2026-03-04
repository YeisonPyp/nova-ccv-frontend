import { Component, inject, OnInit, signal } from "@angular/core";
import {
  CompetencieService,
  CreateCompetencyDto,
} from "../../../../../core/services/assessment/competencie.service";
import { Competencie } from "../../../../../core/models/assessment/competencie.model";
import { CommonModule } from "@angular/common";
import {
  DynamicTableComponent,
  TableColumn,
} from "../../../../../shared/components/dynamic-table/dynamic-table.component";
import { PaginatorComponent } from "../../../../../shared/components/paginator/paginator.component";
import { CompetencyModalComponent } from "./competency-modal/competency-modal.component";

@Component({
  selector: "app-dashboard",
  standalone: true,
  imports: [
    CommonModule,
    DynamicTableComponent,
    PaginatorComponent,
    CompetencyModalComponent,
  ],
  templateUrl: "./dashboard.component.html",
  styleUrl: "./dashboard.component.scss",
})
export class DashboardComponent implements OnInit {
  private service = inject(CompetencieService);

  competencies = signal<Competencie[]>([]);
  size = signal<number>(10);
  page = signal<number>(1);
  totalPages = signal<number>(0);

  isModalOpen = signal(false);

  columns: TableColumn<Competencie>[] = [
    { key: "name", label: "Nombre" },
    { key: "type", label: "Tipo" },
    { key: "description", label: "Descripción" },
  ];

  ngOnInit(): void {
    this.fetchCompetencies();
  }

  fetchCompetencies() {
    this.service
      .getCompetencies({ page: this.page(), size: this.size() })
      .subscribe((res) => {
        if (res.data && res.data.content) {
          this.competencies.set(res.data.content);
          this.totalPages.set(res.data.totalPages);
        }
      });
  }

  onPageChange(newPage: number) {
    this.page.set(newPage);
    this.fetchCompetencies();
  }

  onSizeChange(newSize: number) {
    this.size.set(newSize);
    this.page.set(1);
    this.fetchCompetencies();
  }

  openCreateModal() {
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
  }

  onSaveCompetency(dto: CreateCompetencyDto) {
    this.service.createCompetency(dto).subscribe({
      next: () => {
        this.closeModal();
        this.fetchCompetencies();
      },
      error: (err) => {
        console.error("Failed to create competency", err);
      },
    });
  }
}
