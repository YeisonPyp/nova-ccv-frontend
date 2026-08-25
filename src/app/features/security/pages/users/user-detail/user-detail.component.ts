import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { AuthService } from '@/app/core/services/auth.service';
import {
  UpdateUserDto,
  UserService,
} from '@/app/core/services/user/user.service';
import { RoleService } from '@/app/core/services/user/role.service';
import { UserStatusChangeService } from '@/app/core/services/user/user-status-change.service';
import { UserResponse } from '@/app/core/models/user/user.model';
import { RoleResponse } from '@/app/core/models/user/role.model';
import {
  USER_STATUSES,
  UserStatus,
  UserStatusChange,
} from '@/app/core/models/user/user-status-change.model';
import {
  DynamicTableComponent,
  TableColumn,
} from '@/app/shared/components/dynamic-table/dynamic-table.component';
import { PaginationComponent } from '@/app/shared/components/pagination/pagination.component';
import { PaginatorComponent } from '@/app/shared/components/paginator/paginator.component';
import { ForbiddenComponent } from '@/app/shared/components/forbidden/forbidden.component';
import { UserEmployeeComponent } from '../user-employee/user-employee.component';
import { PermissionsManagerComponent } from '@/app/shared/components/permissions-manager/permissions-manager.component';

const PAGE_SIZE = 10;
const AUTOSAVE_DELAY_MS = 700;

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DynamicTableComponent,
    PaginationComponent,
    PaginatorComponent,
    ForbiddenComponent,
    UserEmployeeComponent,
    PermissionsManagerComponent,
  ],
  templateUrl: './user-detail.component.html',
})
export class UserDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private auth = inject(AuthService);
  private userService = inject(UserService);
  private roleService = inject(RoleService);
  private statusChangeService = inject(UserStatusChangeService);
  private fb = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);

  user = signal<UserResponse | null>(null);
  loading = signal(false);
  saving = signal(false);
  autoSaving = signal(false);

  allRoles = signal<RoleResponse[]>([]);

  rolesLoaded = signal(false);

  rolesPage = signal(1);

  statusChanges = signal<UserStatusChange[]>([]);
  statusChangesLoaded = signal(false);
  statusChangesLoading = signal(false);
  statusChangesPage = signal(1);
  statusChangesSize = signal(10);
  statusChangesTotalPages = signal(0);

  showStatusChangeModal = signal(false);
  savingStatusChange = signal(false);

  readonly availableStatuses = USER_STATUSES;

  form = this.fb.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
  });

  statusChangeForm = this.fb.group({
    newStatus: this.fb.control<UserStatus | null>(null, Validators.required),
    reason: ['', [Validators.required, Validators.minLength(1)]],
  });

  private autoSave$ = new Subject<void>();

  statusChangeColumns: TableColumn[] = [
    { key: 'oldStatus', label: 'Estado anterior' },
    { key: 'newStatus', label: 'Nuevo estado' },
    { key: 'reason', label: 'Motivo' },
    { key: 'createdAt', label: 'Fecha' },
  ];

  roleColumns: TableColumn[] = [
    { key: 'name', label: 'Nombre' },
    { key: 'description', label: 'Descripción' },
  ];

  availableRoles = computed(() => {
    const assigned = new Set(this.user()?.roles ?? []);
    return this.allRoles().filter((r) => !assigned.has(r.name));
  });

  rolesTotalPages = computed(() =>
    Math.max(1, Math.ceil(this.availableRoles().length / PAGE_SIZE)),
  );

  pagedRoles = computed(() => {
    const start = (this.rolesPage() - 1) * PAGE_SIZE;
    return this.availableRoles().slice(start, start + PAGE_SIZE);
  });

  // edit-mode flag kept true so HTML branches gated on it still work
  readonly isEditMode = () => true;

  get canUpdate() {
    return this.auth.hasPermission('USERS_UPDATE');
  }
  get canRead() {
    return this.auth.hasPermission('USERS_READ');
  }
  get canReadRoles() {
    return this.auth.hasPermission('ROLE_READ');
  }
  get canReadPermissions() {
    return this.auth.hasPermission('PERMISSION_READ');
  }
  get canReadStatusChanges() {
    return this.auth.hasPermission('USER_STATUS_CHANGE_READ');
  }
  get canCreateStatusChange() {
    return this.auth.hasPermission('USER_STATUS_CHANGE_CREATE');
  }

  ngOnInit(): void {
    if (!this.canRead) return;
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.goBack();
      return;
    }
    this.loadUser(id);
    this.wireAutoSave();
  }

  isFieldInvalid(field: string): boolean {
    const c = this.form.get(field);
    return !!(c?.touched && c?.invalid);
  }

  onFieldChange() {
    if (!this.canUpdate || this.form.invalid) return;
    this.autoSave$.next();
  }

  private wireAutoSave() {
    this.autoSave$
      .pipe(
        debounceTime(AUTOSAVE_DELAY_MS),
        distinctUntilChanged(),
        switchMap(() => {
          this.autoSaving.set(true);
          const u = this.user()!;
          return this.userService.updateUser(
            u.id,
            this.form.getRawValue() as UpdateUserDto,
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (res) => {
          if (res.success && res.data) this.user.set(res.data);
          this.autoSaving.set(false);
        },
        error: () => this.autoSaving.set(false),
      });
  }

  onRolesToggle(event: Event) {
    const open = (event.target as HTMLDetailsElement).open;
    if (open && !this.rolesLoaded() && this.canReadRoles) this.loadRoles();
  }

  onStatusChangesToggle(event: Event) {
    const open = (event.target as HTMLDetailsElement).open;
    if (open && !this.statusChangesLoaded() && this.canReadStatusChanges) {
      this.statusChangesLoaded.set(true);
      this.loadStatusChanges(1);
    }
  }

  loadStatusChanges(page: number) {
    const u = this.user();
    if (!u) return;
    this.statusChangesPage.set(page);
    this.statusChangesLoading.set(true);
    this.statusChangeService
      .findByUser({
        userId: u.id,
        page: page - 1,
        size: this.statusChangesSize(),
      })
      .subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.statusChanges.set(res.data.content);
            this.statusChangesTotalPages.set(res.data.totalPages);
          }
          this.statusChangesLoading.set(false);
        },
        error: () => {
          this.statusChangesLoading.set(false);
          this.statusChangesLoaded.set(false);
        },
      });
  }

  changeStatusPageSize(size: number) {
    this.statusChangesSize.set(size);
    this.loadStatusChanges(1);
  }

  openStatusChangeModal() {
    this.statusChangeForm.reset();
    this.showStatusChangeModal.set(true);
  }

  closeStatusChangeModal() {
    this.showStatusChangeModal.set(false);
  }

  submitStatusChange() {
    const u = this.user();
    if (!u || this.statusChangeForm.invalid) {
      this.statusChangeForm.markAllAsTouched();
      return;
    }
    const val = this.statusChangeForm.getRawValue();
    this.savingStatusChange.set(true);
    this.statusChangeService
      .create({
        userId: u.id,
        newStatus: val.newStatus!,
        reason: val.reason!,
      })
      .subscribe({
        next: () => {
          this.savingStatusChange.set(false);
          this.showStatusChangeModal.set(false);
          this.loadUser(u.id);
          this.loadStatusChanges(1);
        },
        error: () => this.savingStatusChange.set(false),
      });
  }

  private loadUser(id: number) {
    this.loading.set(true);
    this.userService.getUserById(id).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.user.set(res.data);
          this.form.patchValue(
            { firstName: res.data.firstName, lastName: res.data.lastName },
            { emitEvent: false },
          );
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  private loadRoles() {
    this.rolesLoaded.set(true);
    this.roleService.findAll().subscribe({
      next: (res) => {
        if (res.success && res.data) this.allRoles.set(res.data);
      },
      error: () => this.rolesLoaded.set(false),
    });
  }

  assignRole(role: RoleResponse) {
    const u = this.user();
    if (!u || this.saving()) return;
    this.saving.set(true);
    this.userService.assignRole(u.id, role.name).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.user.set(res.data);
          this.clampPages();
        }
        this.saving.set(false);
      },
      error: () => this.saving.set(false),
    });
  }

  removeRole(roleName: string) {
    const u = this.user();
    if (!u || this.saving()) return;
    this.saving.set(true);
    this.userService.removeRole(u.id, roleName).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.user.set(res.data);
          this.clampPages();
        }
        this.saving.set(false);
      },
      error: () => this.saving.set(false),
    });
  }

  assignPermission(permission: string) {
    const u = this.user();
    if (!u || this.saving()) return;
    this.saving.set(true);
    this.userService.assignPermission(u.id, permission).subscribe({
      next: (res) => {
        if (res.success && res.data) this.user.set(res.data);
        this.saving.set(false);
      },
      error: () => this.saving.set(false),
    });
  }

  removePermission(permissionName: string) {
    const u = this.user();
    if (!u || this.saving()) return;
    this.saving.set(true);
    this.userService.removePermission(u.id, permissionName).subscribe({
      next: (res) => {
        if (res.success && res.data) this.user.set(res.data);
        this.saving.set(false);
      },
      error: () => this.saving.set(false),
    });
  }

  private clampPages() {
    if (this.rolesPage() > this.rolesTotalPages()) {
      this.rolesPage.set(this.rolesTotalPages());
    }
  }

  goBack() {
    this.router.navigate(['/security/users']);
  }
}
