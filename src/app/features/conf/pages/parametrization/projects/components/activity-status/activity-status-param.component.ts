import { CommonModule } from "@angular/common";
import { Component, inject, signal } from "@angular/core";
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { AuthService } from "@/app/core/services/auth.service";
import { ActivityStatusService } from "@/app/core/services/projects/activity-status.service";
import { ActivityStatus } from "@/app/core/models/projects/project-params.model";
import {
  DynamicTableComponent,
  TableColumn,
} from "@/app/shared/components/dynamic-table/dynamic-table.component";
import { PaginationComponent } from "@/app/shared/components/pagination/pagination.component";
import { ParametrizationSectionComponent } from "@/app/features/conf/components/parametrization-section.component";

@Component({
  selector: "app-activity-status-param",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DynamicTableComponent,
    PaginationComponent,
    ParametrizationSectionComponent,
  ],
  templateUrl: "./activity-status-param.component.html",
})
export class ActivityStatusParamComponent {
  private readonly auth = inject(AuthService);
  private readonly activityStatusService = inject(ActivityStatusService);

  activityStatusItems = signal<ActivityStatus[]>([]);
  activityStatusPage = signal(1);
  activityStatusSize = signal(10);
  activityStatusTotalPages = signal(0);
  activityStatusLoaded = signal(false);
  activityStatusModalMode = signal<"create" | "update" | null>(null);
  showDeleteActivityStatusModal = signal(false);
  editingActivityStatus = signal<ActivityStatus | null>(null);

  activityStatusForm = new FormGroup({
    name: new FormControl("", [Validators.required, Validators.maxLength(20)]),
  });

  activityStatusColumns: TableColumn[] = [{ key: "name", label: "Nombre" }];

  get canReadActivityStatus() {
    return this.auth.hasPermission("ACTIVITY_STATUS_READ");
  }
  get canCreateActivityStatus() {
    return this.auth.hasPermission("ACTIVITY_STATUS_CREATE");
  }
  get canUpdateActivityStatus() {
    return this.auth.hasPermission("ACTIVITY_STATUS_UPDATE");
  }
  get canDeleteActivityStatus() {
    return this.auth.hasPermission("ACTIVITY_STATUS_DELETE");
  }

  onActivityStatusToggle(open: boolean) {
    if (open && !this.activityStatusLoaded()) {
      this.loadActivityStatus(1);
    }
  }

  loadActivityStatus(page: number) {
    this.activityStatusPage.set(page);
    this.activityStatusLoaded.set(true);
    this.activityStatusService
      .findAll({ page: page - 1, size: this.activityStatusSize() })
      .subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.activityStatusItems.set(res.data.content);
            this.activityStatusTotalPages.set(res.data.totalPages);
          }
        },
        error: () => this.activityStatusLoaded.set(false),
      });
  }

  openCreateActivityStatus() {
    this.activityStatusForm.reset({ name: "" });
    this.editingActivityStatus.set(null);
    this.activityStatusModalMode.set("create");
  }

  openEditActivityStatus(item: ActivityStatus) {
    this.activityStatusForm.reset({ name: item.name });
    this.editingActivityStatus.set(item);
    this.activityStatusModalMode.set("update");
  }

  closeActivityStatusModal() {
    this.activityStatusModalMode.set(null);
  }

  submitActivityStatus() {
    if (this.activityStatusForm.invalid) return;
    const { name } = this.activityStatusForm.value;
    const mode = this.activityStatusModalMode();
    if (mode === "create") {
      this.activityStatusService.create(name!).subscribe({
        next: () => {
          this.closeActivityStatusModal();
          this.loadActivityStatus(this.activityStatusPage());
        },
      });
    } else if (mode === "update") {
      const item = this.editingActivityStatus()!;
      this.activityStatusService.update(item.id, name!).subscribe({
        next: () => {
          this.closeActivityStatusModal();
          this.loadActivityStatus(this.activityStatusPage());
        },
      });
    }
  }

  openDeleteActivityStatus(item: ActivityStatus) {
    this.editingActivityStatus.set(item);
    this.showDeleteActivityStatusModal.set(true);
  }

  closeDeleteActivityStatusModal() {
    this.showDeleteActivityStatusModal.set(false);
    this.editingActivityStatus.set(null);
  }

  confirmDeleteActivityStatus() {
    const item = this.editingActivityStatus();
    if (!item) return;
    this.activityStatusService.delete(item.id).subscribe({
      next: () => {
        this.closeDeleteActivityStatusModal();
        this.loadActivityStatus(this.activityStatusPage());
      },
    });
  }
}
