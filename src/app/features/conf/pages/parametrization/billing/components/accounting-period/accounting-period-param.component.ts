import { CommonModule } from "@angular/common";
import { Component, inject, signal } from "@angular/core";
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { AuthService } from "@/app/core/services/auth.service";
import { AccountingPeriodService } from "@/app/core/services/billing/accounting-period.service";
import { AccountingPeriod } from "@/app/core/models/billing/billing-params.model";
import {
  DynamicTableComponent,
  TableColumn,
} from "@/app/shared/components/dynamic-table/dynamic-table.component";
import { PaginationComponent } from "@/app/shared/components/pagination/pagination.component";

@Component({
  selector: "app-accounting-period-param",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DynamicTableComponent,
    PaginationComponent,
  ],
  templateUrl: "./accounting-period-param.component.html",
})
export class AccountingPeriodParamComponent {
  private readonly auth = inject(AuthService);
  private readonly accountingPeriodService = inject(AccountingPeriodService);

  accountingPeriodItems = signal<AccountingPeriod[]>([]);
  accountingPeriodPage = signal(1);
  accountingPeriodSize = signal(10);
  accountingPeriodTotalPages = signal(0);
  accountingPeriodLoaded = signal(false);
  accountingPeriodModalMode = signal<"create" | null>(null);
  showDeleteAccountingPeriodModal = signal(false);
  editingAccountingPeriod = signal<AccountingPeriod | null>(null);

  accountingPeriodForm = new FormGroup({
    period: new FormControl("", [
      Validators.required,
      Validators.maxLength(6),
      Validators.pattern(/^\d{6}$/),
    ]),
    startDate: new FormControl("", [Validators.required]),
    endDate: new FormControl("", [Validators.required]),
  });

  accountingPeriodColumns: TableColumn[] = [
    { key: "period", label: "Período" },
    { key: "startDate", label: "Inicio" },
    { key: "endDate", label: "Fin" },
  ];

  get canReadAccountingPeriod() {
    return this.auth.hasPermission("ACCOUNTING_PERIOD_READ");
  }
  get canCreateAccountingPeriod() {
    return this.auth.hasPermission("ACCOUNTING_PERIOD_CREATE");
  }
  get canDeleteAccountingPeriod() {
    return this.auth.hasPermission("ACCOUNTING_PERIOD_DELETE");
  }

  onAccountingPeriodToggle(e: Event) {
    if (
      (e.target as HTMLDetailsElement).open &&
      !this.accountingPeriodLoaded()
    ) {
      this.loadAccountingPeriod(1);
    }
  }

  loadAccountingPeriod(page: number) {
    this.accountingPeriodPage.set(page);
    this.accountingPeriodLoaded.set(true);
    this.accountingPeriodService
      .findAll({ page: page - 1, size: this.accountingPeriodSize() })
      .subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.accountingPeriodItems.set(res.data.content);
            this.accountingPeriodTotalPages.set(res.data.totalPages);
          }
        },
        error: () => this.accountingPeriodLoaded.set(false),
      });
  }

  openCreateAccountingPeriod() {
    this.accountingPeriodForm.reset({ period: "", startDate: "", endDate: "" });
    this.accountingPeriodModalMode.set("create");
  }

  closeAccountingPeriodModal() {
    this.accountingPeriodModalMode.set(null);
  }

  submitAccountingPeriod() {
    if (this.accountingPeriodForm.invalid) return;
    const { period, startDate, endDate } = this.accountingPeriodForm.value;
    this.accountingPeriodService
      .create({ period: period!, startDate: startDate!, endDate: endDate! })
      .subscribe({
        next: () => {
          this.closeAccountingPeriodModal();
          this.loadAccountingPeriod(this.accountingPeriodPage());
        },
      });
  }

  openDeleteAccountingPeriod(item: AccountingPeriod) {
    this.editingAccountingPeriod.set(item);
    this.showDeleteAccountingPeriodModal.set(true);
  }

  closeDeleteAccountingPeriodModal() {
    this.showDeleteAccountingPeriodModal.set(false);
    this.editingAccountingPeriod.set(null);
  }

  confirmDeleteAccountingPeriod() {
    const item = this.editingAccountingPeriod();
    if (!item) return;
    this.accountingPeriodService.delete(item.period).subscribe({
      next: () => {
        this.closeDeleteAccountingPeriodModal();
        this.loadAccountingPeriod(this.accountingPeriodPage());
      },
    });
  }
}
