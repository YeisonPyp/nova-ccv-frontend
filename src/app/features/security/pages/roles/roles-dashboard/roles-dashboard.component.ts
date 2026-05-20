import { CommonModule } from "@angular/common";
import { Component, computed, inject, OnInit, signal } from "@angular/core";
import { Router } from "@angular/router";
import { RoleService } from "@/app/core/services/user/role.service";
import { RoleResponse } from "@/app/core/models/user/role.model";
import {
  DynamicTableComponent,
  TableColumn,
} from "@/app/shared/components/dynamic-table/dynamic-table.component";
import { PaginationComponent } from "@/app/shared/components/pagination/pagination.component";

const PAGE_SIZE = 10;

@Component({
  selector: "app-roles-dashboard",
  standalone: true,
  imports: [CommonModule, DynamicTableComponent, PaginationComponent],
  templateUrl: "./roles-dashboard.component.html",
})
export class RolesDashboardComponent implements OnInit {
  private roleService = inject(RoleService);
  private router = inject(Router);

  roles = signal<RoleResponse[]>([]);
  loading = signal(false);
  deleting = signal(false);
  deleteTargetId = signal<number | null>(null);
  page = signal(1);

  totalPages = computed(() =>
    Math.max(1, Math.ceil(this.roles().length / PAGE_SIZE)),
  );

  pagedRoles = computed(() => {
    const start = (this.page() - 1) * PAGE_SIZE;
    return this.roles().slice(start, start + PAGE_SIZE);
  });

  columns: TableColumn[] = [
    { key: "name", label: "Nombre" },
    { key: "description", label: "Descripción" },
    { key: "permissionsCount", label: "Permisos" },
  ];

  // Augment data with count
  tableData = computed(() =>
    this.pagedRoles().map((r) => ({
      ...r,
      permissionsCount: r.permissions?.length ?? 0,
    })),
  );

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.roleService.findAll().subscribe({
      next: (res) => {
        if (res.success && res.data) this.roles.set(res.data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  goToCreate(): void {
    this.router.navigate(["/security/roles/new"]);
  }

  goToEdit(role: RoleResponse): void {
    this.router.navigate(["/security/roles", role.id]);
  }

  confirmDelete(role: RoleResponse): void {
    this.deleteTargetId.set(role.id);
  }

  cancelDelete(): void {
    this.deleteTargetId.set(null);
  }

  doDelete(): void {
    const id = this.deleteTargetId();
    if (id == null || this.deleting()) return;
    this.deleting.set(true);
    this.roleService.delete(id).subscribe({
      next: () => {
        this.roles.update((list) => list.filter((r) => r.id !== id));
        this.deleteTargetId.set(null);
        this.deleting.set(false);
        if (this.page() > this.totalPages()) this.page.set(this.totalPages());
      },
      error: () => this.deleting.set(false),
    });
  }
}
