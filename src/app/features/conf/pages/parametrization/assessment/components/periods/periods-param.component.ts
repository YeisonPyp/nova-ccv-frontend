import { CommonModule } from "@angular/common";
import { Component, inject, signal } from "@angular/core";
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { AuthService } from "../../../../../../../core/services/auth.service";
import { PeriodService } from "../../../../../../../core/services/assessment/period.service";
import { Period } from "../../../../../../../core/models/assessment/period.model";
import {
  DynamicTableComponent,
  TableColumn,
} from "../../../../../../../shared/components/dynamic-table/dynamic-table.component";
import { PaginationComponent } from "../../../../../../../shared/components/pagination/pagination.component";

@Component({
  selector: "app-periods-param",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DynamicTableComponent,
    PaginationComponent,
  ],
  templateUrl: "./periods-param.component.html",
  styles: [
    `
      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      .modal-overlay {
        position: fixed;
        inset: 0;
        z-index: 50;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(0, 0, 0, 0.4);
        backdrop-filter: blur(4px);
      }
      .modal-box {
        background: #fff;
        border-radius: 12px;
        padding: 24px;
        width: 100%;
        max-width: 480px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
        animation: slideUp 0.2s ease-out;
      }
      .modal-title {
        font-size: 1.1rem;
        font-weight: 600;
        margin-bottom: 16px;
      }
      .modal-footer {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        margin-top: 20px;
      }
    `,
  ],
})
export class PeriodsParamComponent {
  private readonly auth = inject(AuthService);
  private readonly periodService = inject(PeriodService);

  periods = signal<Period[]>([]);
  periodPage = signal(1);
  periodSize = signal(10);
  periodTotalPages = signal(0);
  periodsLoaded = signal(false);

  periodModalMode = signal<"create" | "update" | null>(null);
  showDeletePeriodModal = signal(false);
  editingPeriod = signal<Period | null>(null);

  periodForm = new FormGroup({
    name: new FormControl("", [Validators.required]),
    startDate: new FormControl("", [Validators.required]),
    endDate: new FormControl("", [Validators.required]),
  });

  periodColumns: TableColumn<Period>[] = [
    { key: "name", label: "Nombre" },
    { key: "startDate", label: "Inicio" },
    { key: "endDate", label: "Fin" },
    { key: "isActive", label: "Activo" },
  ];

  get canReadPeriod() {
    return this.auth.hasPermission("EVALUATION_PERIOD_READ");
  }
  get canCreatePeriod() {
    return this.auth.hasPermission("EVALUATION_PERIOD_CREATE");
  }
  get canUpdatePeriod() {
    return this.auth.hasPermission("EVALUATION_PERIOD_UPDATE");
  }
  get canDeletePeriod() {
    return this.auth.hasPermission("EVALUATION_PERIOD_DELETE");
  }

  onPeriodsToggle(event: Event) {
    if ((event.target as HTMLDetailsElement).open && !this.periodsLoaded()) {
      this.loadPeriods(1);
    }
  }

  loadPeriods(page: number) {
    this.periodPage.set(page);
    this.periodsLoaded.set(true);
    this.periodService
      .findCurrentPeriods({ page: page - 1, size: this.periodSize() })
      .subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.periods.set(res.data.content);
            this.periodTotalPages.set(res.data.totalPages);
          }
        },
        error: () => this.periodsLoaded.set(false),
      });
  }

  openCreatePeriod() {
    this.periodForm.reset({ name: "", startDate: "", endDate: "" });
    this.editingPeriod.set(null);
    this.periodModalMode.set("create");
  }

  openEditPeriod(period: Period) {
    this.periodForm.reset({
      name: period.name,
      startDate: period.startDate,
      endDate: period.endDate,
    });
    this.editingPeriod.set(period);
    this.periodModalMode.set("update");
  }

  closePeriodModal() {
    this.periodModalMode.set(null);
  }

  submitPeriod() {
    if (this.periodForm.invalid) return;
    const { name, startDate, endDate } = this.periodForm.value;
    const dto = { name: name!, startDate: startDate!, endDate: endDate! };
    const mode = this.periodModalMode();

    if (mode === "create") {
      this.periodService.createPeriod(dto).subscribe({
        next: () => {
          this.closePeriodModal();
          this.loadPeriods(this.periodPage());
        },
      });
    } else if (mode === "update") {
      const period = this.editingPeriod()!;
      this.periodService.updatePeriod(period.id, dto).subscribe({
        next: () => {
          this.closePeriodModal();
          this.loadPeriods(this.periodPage());
        },
      });
    }
  }

  openDeletePeriod(period: Period) {
    this.editingPeriod.set(period);
    this.showDeletePeriodModal.set(true);
  }

  closeDeletePeriodModal() {
    this.showDeletePeriodModal.set(false);
    this.editingPeriod.set(null);
  }

  confirmDeletePeriod() {
    const period = this.editingPeriod();
    if (!period) return;
    this.periodService.deletePeriod(period.id).subscribe({
      next: () => {
        this.closeDeletePeriodModal();
        this.loadPeriods(this.periodPage());
      },
    });
  }
}
