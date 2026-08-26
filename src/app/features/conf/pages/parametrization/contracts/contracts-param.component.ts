import { Component } from "@angular/core";
import { ContractAlertsConfigParamComponent } from "./components/contract-alerts-config/contract-alerts-config-param.component";

@Component({
  selector: "app-contracts-param",
  standalone: true,
  imports: [ContractAlertsConfigParamComponent],
  templateUrl: "./contracts-param.component.html",
})
export class ContractsParamComponent {}
