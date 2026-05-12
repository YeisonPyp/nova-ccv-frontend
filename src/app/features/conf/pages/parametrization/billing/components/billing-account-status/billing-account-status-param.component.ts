import { CommonModule } from "@angular/common";
import { Component, inject, signal } from "@angular/core";
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { AuthService } from "@/app/core/services/auth.service";
import { BillingAccountStatusParamService } from "@/app/core/services/billing/billing-account-status.service";
import { BillingAccountStatus } from "@/app/core/models/billing/billing-params.model";
import {
  DynamicTableComponent,
  TableColumn,
} from "@/app/shared/components/dynamic-table/dynamic-table.component";
import { PaginationComponent } from "@/app/shared/components/pagination/pagination.component";

@Component({
  selector: "app-billing-account-status-param",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DynamicTableComponent,
    PaginationComponent,
  ],
  templateUrl: "./billing-account-status-param.component.html",
})
export class BillingAccountStatusParamComponent {
  private readonly auth = inject(AuthService);
  private readonly billingAccountStatusService = inject(
    BillingAccountStatusParamService,
  );

  billingAccountStatusItems = signal<BillingAccountStatus[]>([]);
  billingAccountStatusPage = signal(1);
  billingAccountStatusSize = signal(10);
  billingAccountStatusTotalPages = signal(0);
  billingAccountStatusLoaded = signal(false);
  billingAccountStatusModalMode = signal<"create" | null>(null);

  billingAccountStatusForm = new FormGroup({
    name: new FormControl("", [Validators.required, Validators.maxLength(20)]),
  });

  billingAccountStatusColumns: TableColumn<BillingAccountStatus>[] = [
    { key: "name", label: "Nombre" },
  ];

  get canReadBillingAccountStatus() {
    return this.auth.hasPermission("BILLING_ACCOUNT_STATUS_READ");
  }
  get canCreateBillingAccountStatus() {
    return this.auth.hasPermission("BILLING_ACCOUNT_STATUS_CREATE");
  }

  onBillingAccountStatusToggle(e: Event) {
    if (
      (e.target as HTMLDetailsElement).open &&
      !this.billingAccountStatusLoaded()
    ) {
      this.loadBillingAccountStatus(1);
    }
  }

  loadBillingAccountStatus(page: number) {
    this.billingAccountStatusPage.set(page);
    this.billingAccountStatusLoaded.set(true);
    this.billingAccountStatusService
      .findAll({ page: page - 1, size: this.billingAccountStatusSize() })
      .subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.billingAccountStatusItems.set(res.data.content);
            this.billingAccountStatusTotalPages.set(res.data.totalPages);
          }
        },
        error: () => this.billingAccountStatusLoaded.set(false),
      });
  }

  openCreateBillingAccountStatus() {
    this.billingAccountStatusForm.reset({ name: "" });
    this.billingAccountStatusModalMode.set("create");
  }

  closeBillingAccountStatusModal() {
    this.billingAccountStatusModalMode.set(null);
  }

  submitBillingAccountStatus() {
    if (this.billingAccountStatusForm.invalid) return;
    const { name } = this.billingAccountStatusForm.value;
    this.billingAccountStatusService.create(name!).subscribe({
      next: () => {
        this.closeBillingAccountStatusModal();
        this.loadBillingAccountStatus(this.billingAccountStatusPage());
      },
    });
  }
}
