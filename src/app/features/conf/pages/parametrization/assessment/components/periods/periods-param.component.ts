import { CommonModule } from "@angular/common";
import { Component, inject, signal } from "@angular/core";
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { AuthService } from "@/app/core/services/auth.service";
import { PeriodService } from "@/app/core/services/assessment/period.service";
import { Period } from "@/app/core/models/assessment/period.model";
import {
  DynamicTableComponent,
  TableColumn,
} from "@/app/shared/components/dynamic-table/dynamic-table.component";
import { PaginationComponent } from "@/app/shared/components/pagination/pagination.component";

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

  periodColumns: TableColumn[] = [
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
