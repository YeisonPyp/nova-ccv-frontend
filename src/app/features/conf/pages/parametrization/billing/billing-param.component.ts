import { Component } from "@angular/core";
import { AccountingPeriodParamComponent } from "./components/accounting-period/accounting-period-param.component";
import { BillingAccountStatusParamComponent } from "./components/billing-account-status/billing-account-status-param.component";

@Component({
  selector: "app-billing-param",
  standalone: true,
  imports: [AccountingPeriodParamComponent, BillingAccountStatusParamComponent],
  templateUrl: "./billing-param.component.html",
})
export class BillingParamComponent {}
