import { CommonModule } from "@angular/common";
import { Component, inject, OnInit, signal } from "@angular/core";
import { Router } from "@angular/router";
import { AuthService } from "@/app/core/services/auth.service";
import { UserService } from "@/app/core/services/user/user.service";
import { UserResponse } from "@/app/core/models/user/user.model";
import {
  DynamicTableComponent,
  TableColumn,
} from "@/app/shared/components/dynamic-table/dynamic-table.component";
import { PaginationComponent } from "@/app/shared/components/pagination/pagination.component";
import { ForbiddenComponent } from "@/app/shared/components/forbidden/forbidden.component";

@Component({
  selector: "app-users-dashboard",
  standalone: true,
  imports: [
    CommonModule,
    DynamicTableComponent,
    PaginationComponent,
    ForbiddenComponent,
  ],
  templateUrl: "./users-dashboard.component.html",
})
export class UsersDashboardComponent implements OnInit {
  private auth = inject(AuthService);
  private service = inject(UserService);
  private router = inject(Router);

  users = signal<UserResponse[]>([]);
  page = signal(1);
  size = signal(10);
  totalPages = signal(0);
  loading = signal(false);

  columns: TableColumn<UserResponse>[] = [
    { key: "username", label: "Usuario" },
    { key: "firstName", label: "Nombre" },
    { key: "lastName", label: "Apellido" },
    { key: "email", label: "Correo" },
    { key: "status", label: "Estado" },
  ];

  get canRead() {
    return this.auth.hasPermission("USERS_READ");
  }

  get canUpdate() {
    return this.auth.hasPermission("USERS_UPDATE");
  }

  ngOnInit(): void {
    if (this.canRead) this.load(1);
  }

  load(page: number) {
    this.page.set(page);
    this.loading.set(true);
    this.service.getAllUsers({ page: page - 1, size: this.size() }).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.users.set(res.data.content);
          this.totalPages.set(res.data.totalPages);
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  manage(user: UserResponse) {
    this.router.navigate(["/conf/users", user.id]);
  }
}
