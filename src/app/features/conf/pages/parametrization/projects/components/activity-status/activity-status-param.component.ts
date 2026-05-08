import { CommonModule } from "@angular/common";
import { Component, inject, signal } from "@angular/core";
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { AuthService } from "../../../../../../../core/services/auth.service";
import { ActivityStatusService } from "../../../../../../../core/services/projects/activity-status.service";
import { ActivityStatus } from "../../../../../../../core/models/projects/project-params.model";
import {
  DynamicTableComponent,
  TableColumn,
} from "../../../../../../../shared/components/dynamic-table/dynamic-table.component";
import { PaginationComponent } from "../../../../../../../shared/components/pagination/pagination.component";

@Component({
  selector: "app-activity-status-param",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DynamicTableComponent, PaginationComponent],
  templateUrl: "./activity-status-param.component.html",
  styles: [
    `
      @keyframes slideUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .modal-overlay {
        position: fixed; inset: 0; z-index: 50;
        display: flex; align-items: center; justify-content: center;
        background: rgba(0,0,0,0.4); backdrop-filter: blur(4px);
      }
      .modal-box {
        background: #fff; border-radius: 12px; padding: 24px;
        width: 100%; max-width: 480px;
        box-shadow: 0 20px 60px rgba(0,0,0,0.15);
        animation: slideUp 0.2s ease-out;
      }
      .modal-title { font-size: 1.1rem; font-weight: 600; margin-bottom: 16px; }
      .modal-footer { display: flex; justify-content: flex-end; gap: 8px; margin-top: 20px; }
    `,
  ],
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

  activityStatusColumns: TableColumn<ActivityStatus>[] = [
    { key: "name", label: "Nombre" },
  ];

  get canReadActivityStatus() { return this.auth.hasPermission("ACTIVITY_STATUS_READ"); }
  get canCreateActivityStatus() { return this.auth.hasPermission("ACTIVITY_STATUS_CREATE"); }
  get canUpdateActivityStatus() { return this.auth.hasPermission("ACTIVITY_STATUS_UPDATE"); }
  get canDeleteActivityStatus() { return this.auth.hasPermission("ACTIVITY_STATUS_DELETE"); }

  onActivityStatusToggle(e: Event) {
    if ((e.target as HTMLDetailsElement).open && !this.activityStatusLoaded()) {
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

  closeActivityStatusModal() { this.activityStatusModalMode.set(null); }

  submitActivityStatus() {
    if (this.activityStatusForm.invalid) return;
    const { name } = this.activityStatusForm.value;
    const mode = this.activityStatusModalMode();
    if (mode === "create") {
      this.activityStatusService.create(name!).subscribe({
        next: () => { this.closeActivityStatusModal(); this.loadActivityStatus(this.activityStatusPage()); },
      });
    } else if (mode === "update") {
      const item = this.editingActivityStatus()!;
      this.activityStatusService.update(item.id, name!).subscribe({
        next: () => { this.closeActivityStatusModal(); this.loadActivityStatus(this.activityStatusPage()); },
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
      next: () => { this.closeDeleteActivityStatusModal(); this.loadActivityStatus(this.activityStatusPage()); },
    });
  }
}
