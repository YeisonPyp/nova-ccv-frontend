import { Component } from "@angular/core";
import { AccountingPeriodParamComponent } from "./components/accounting-period/accounting-period-param.component";
import { BillingAccountStatusParamComponent } from "./components/billing-account-status/billing-account-status-param.component";
import { CostCenterParamComponent } from "./components/cost-center-param/cost-center-param.component";
import { PresupuestalCategoryParamComponent } from "./components/presupuestal-category-param/presupuestal-category-param.component";

@Component({
  selector: "app-billing-param",
  standalone: true,
  imports: [
    AccountingPeriodParamComponent,
    BillingAccountStatusParamComponent,
    CostCenterParamComponent,
    PresupuestalCategoryParamComponent,
  ],
  templateUrl: "./billing-param.component.html",
})
export class BillingParamComponent {}
