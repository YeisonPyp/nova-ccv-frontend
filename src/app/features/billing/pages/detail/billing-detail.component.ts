import { Component, computed, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, Router } from "@angular/router";
import { BillingService } from "@/app/core/services/billing/billing.service";
import { ChargePaymentsSectionComponent } from "./charge-payments-section/charge-payments-section.component";
import { BillingDocumentsSectionComponent } from "./documents-section/billing-documents-section.component";
import { catchError, finalize, map, of, switchMap, tap } from "rxjs";
import { toObservable, toSignal } from "@angular/core/rxjs-interop";

@Component({
  selector: "app-billing-detail",
  standalone: true,
  imports: [
    CommonModule,
    ChargePaymentsSectionComponent,
    BillingDocumentsSectionComponent,
  ],
  templateUrl: "./billing-detail.component.html",
})
export class BillingDetailComponent {
  private readonly service = inject(BillingService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  id = computed(() => Number(this.route.snapshot.paramMap.get("id")));
  loading = signal(false);

  account = toSignal(
    toObservable(this.id).pipe(
      tap(() => this.loading.set(true)),
      switchMap((id) =>
        this.service.findById(id).pipe(
          map((res) => res.data),
          catchError(() => of(null)),
          finalize(() => this.loading.set(false)),
        ),
      ),
    ),
    { initialValue: null },
  );

  goBack(): void {
    this.router.navigate(["/billing/dashboard"]);
  }
}
