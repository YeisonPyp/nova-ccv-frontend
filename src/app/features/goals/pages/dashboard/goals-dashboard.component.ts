import { Component, computed, inject, signal, effect } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  DynamicTableComponent,
  TableColumn,
} from "../../../../shared/components/dynamic-table/dynamic-table.component";
import { PaginatorComponent } from "../../../../shared/components/paginator/paginator.component";
import { GoalService } from "../../../../core/services/goals/goal.service";
import { Goal } from "../../../../core/models/goals/goal.model";
import { APIPage } from "../../../../core/models/api-page.model";
import { Router } from "@angular/router";

@Component({
  selector: "app-goals-dashboard",
  standalone: true,
  imports: [CommonModule, DynamicTableComponent, PaginatorComponent],
  templateUrl: "./goals-dashboard.component.html",
  styleUrl: "./goals-dashboard.component.scss",
})
export class GoalsDashboardComponent {
  goalService = inject(GoalService);
  router = inject(Router);

  pageSize = signal<number>(10);
  currentPage = signal<number>(1);

  goalsData = signal<APIPage<Goal> | undefined>(undefined);

  columns: TableColumn<Goal>[] = [
    { key: "id", label: "ID" },
    { key: "title", label: "Título" },
    { key: "description", label: "Descripción" },
    { key: "targetValue", label: "Valor Objetivo" },
    { key: "currentValue", label: "Valor Actual" },
    { key: "weight", label: "Peso" },
    { key: "goalType.name", label: "Tipo" },
  ];

  totalPages = computed(() => Math.max(1, this.goalsData()?.totalPages || 1));
  data = computed(() => this.goalsData()?.content || []);

  constructor() {
    effect(() => {
      this.fetchGoals(this.currentPage(), this.pageSize());
    });
  }

  fetchGoals(page: number, size: number) {
    this.goalService.findGoals(page - 1, size).subscribe((res) => {
      if (res.success && res.data) {
        this.goalsData.set(res.data);
      }
    });
  }

  onPageChange(p: number) {
    this.currentPage.set(p);
  }

  onPageSizeChange(size: number) {
    this.pageSize.set(size);
    this.currentPage.set(1);
  }

  navigateToCreate() {
    this.router.navigate(["/goals/dashboard/create"]);
  }
}
