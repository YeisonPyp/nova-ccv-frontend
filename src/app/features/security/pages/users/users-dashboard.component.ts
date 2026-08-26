import { CommonModule } from '@angular/common';
import { Component, effect, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@/app/core/services/auth.service';
import { UserService } from '@/app/core/services/user/user.service';
import { UserResponse } from '@/app/core/models/user/user.model';
import {
  DynamicTableComponent,
  TableColumn,
} from '@/app/shared/components/dynamic-table/dynamic-table.component';
import { ForbiddenComponent } from '@/app/shared/components/forbidden/forbidden.component';
import { ExpressionNode } from '@rsql/ast';
import { SeedUsersModalComponent } from './seed-users-modal/seed-users-modal.component';
import { PaginatorComponent } from '@/app/shared/components/paginator/paginator.component';

@Component({
  selector: 'app-users-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    DynamicTableComponent,
    PaginatorComponent,
    ForbiddenComponent,
    SeedUsersModalComponent,
  ],
  templateUrl: './users-dashboard.component.html',
})
export class UsersDashboardComponent {
  private auth = inject(AuthService);
  private service = inject(UserService);
  private router = inject(Router);

  users = signal<UserResponse[]>([]);
  page = signal(1);
  size = signal(10);
  totalPages = signal(0);
  loading = signal(false);
  searchNodes = signal<ExpressionNode[]>([]);
  seedModalOpen = signal(false);

  columns: TableColumn[] = [
    {
      key: 'username',
      label: 'Usuario',
      filterSet: {
        valueType: 'text',
        search: true,
      },
    },
    {
      key: 'firstName',
      label: 'Nombre',
      filterSet: {
        valueType: 'text',
        search: true,
      },
    },
    {
      key: 'lastName',
      label: 'Apellido',
      filterSet: {
        valueType: 'text',
        search: true,
      },
    },
    {
      key: 'email',
      label: 'Correo',
      filterSet: {
        valueType: 'email',
        search: true,
      },
    },
    { key: 'status', label: 'Estado' },
  ];

  constructor() {
    effect(() => {
      this.page();
      this.size();
      this.searchNodes();
      this.loadUsers();
    });
  }

  private loadUsers(): void {
    this.loading.set(true);
    this.service
      .getAllUsers({
        page: this.page() - 1,
        size: this.size(),
        nodes: this.searchNodes(),
      })
      .subscribe({
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

  get canRead() {
    return this.auth.hasPermission('USERS_READ');
  }

  get canUpdate() {
    return this.auth.hasPermission('USERS_UPDATE');
  }

  onSearchChange(nodes: ExpressionNode[]) {
    this.page.set(1);
    this.searchNodes.set(nodes);
  }

  manage(user: UserResponse) {
    this.router.navigate(['/security/users/', user.id]);
  }

  onCreateClicked() {
    this.router.navigate(['/security/users/new']);
  }

  get canCreate() {
    return this.auth.hasPermission('USERS_CREATE');
  }

  openSeedModal(): void {
    this.seedModalOpen.set(true);
  }

  closeSeedModal(): void {
    this.seedModalOpen.set(false);
  }

  onUsersSeeded(): void {
    this.seedModalOpen.set(false);
    this.loadUsers();
  }
}
