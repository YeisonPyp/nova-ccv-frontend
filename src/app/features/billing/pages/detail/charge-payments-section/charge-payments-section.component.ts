import { Component, inject, input, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { BillingService } from "@/app/core/services/billing/billing.service";
import { BillingChargePayment } from "@/app/core/models/billing/billing-account.model";
import { AuthService } from "@/app/core/services/auth.service";
import {
  DynamicTableComponent,
  TableColumn,
} from "@/app/shared/components/dynamic-table/dynamic-table.component";
import { PaginationComponent } from "@/app/shared/components/pagination/pagination.component";

@Component({
  selector: "app-charge-payments-section",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DynamicTableComponent,
    PaginationComponent,
  ],
  templateUrl: "./charge-payments-section.component.html",
})
export class ChargePaymentsSectionComponent implements OnInit {
  private readonly service = inject(BillingService);
  readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  billingAccountId = input.required<number>();

  payments = signal<BillingChargePayment[]>([]);
  currentPage = signal(1);
  totalPages = signal(0);
  pageSize = 10;
  loading = signal(false);
  saving = signal(false);
  showForm = signal(false);
  selectedFile = signal<File | null>(null);

  form = this.fb.group({
    amount: [
      null as number | null,
      [Validators.required, Validators.min(0.01)],
    ],
    paymentDate: ["", Validators.required],
  });

  columns: TableColumn[] = [
    { key: "id", label: "ID" },
    { key: "username", label: "Usuario" },
    { key: "amount", label: "Monto" },
    { key: "paymentDate", label: "Fecha pago" },
  ];

  get canCreate(): boolean {
    return this.auth.hasPermission("BILLING_CHARGE_PAYMENT_CREATE");
  }

  ngOnInit(): void {
    this.load();
  }

  load(page = 1): void {
    this.loading.set(true);
    this.service
      .findPayments(this.billingAccountId(), page - 1, this.pageSize)
      .subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.payments.set(res.data.content);
            this.currentPage.set(res.data.pageable.pageNumber + 1);
            this.totalPages.set(res.data.totalPages);
          }
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedFile.set(input.files[0]);
      input.value = "";
    }
  }

  submit(): void {
    if (this.form.invalid || !this.selectedFile()) {
      this.form.markAllAsTouched();
      return;
    }
    const { amount, paymentDate } = this.form.value;
    this.saving.set(true);
    this.service
      .createPayment(
        this.billingAccountId(),
        amount!,
        paymentDate!,
        this.selectedFile()!,
      )
      .subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.payments.update((list) => [res.data, ...list]);
            this.form.reset();
            this.selectedFile.set(null);
            this.showForm.set(false);
          }
          this.saving.set(false);
        },
        error: () => this.saving.set(false),
      });
  }
}
