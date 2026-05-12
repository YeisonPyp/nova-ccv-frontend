import { Component } from "@angular/core";
import { AgencyParamComponent } from "./components/agency/agency-param.component";
import { ContractStatusParamComponent } from "./components/contract-status/contract-status-param.component";
import { EpsAffiliationTypeParamComponent } from "./components/eps-affiliation-type/eps-affiliation-type-param.component";
import { EpsEntityParamComponent } from "./components/eps-entity/eps-entity-param.component";
import { CotizationTypeParamComponent } from "./components/cotization-type/cotization-type-param.component";
import { PensionTypeParamComponent } from "./components/pension-type/pension-type-param.component";
import { CompensationEntityParamComponent } from "./components/compensation-entity/compensation-entity-param.component";
import { RangeRetentionParamComponent } from "./components/range-retention/range-retention-param.component";
import { SalaryParameterParamComponent } from "./components/salary-parameter/salary-parameter-param.component";
import { CancellationTypeParamComponent } from "./components/cancellation-type/cancellation-type-param.component";
import { AssignmentStatusParamComponent } from "./components/assignment-status/assignment-status-param.component";
import { ContractTypesParamComponent } from "./components/contract-types/contract-types-param.component";

@Component({
  selector: "app-contracts-param",
  standalone: true,
  imports: [
    AgencyParamComponent,
    ContractStatusParamComponent,
    EpsAffiliationTypeParamComponent,
    EpsEntityParamComponent,
    CotizationTypeParamComponent,
    PensionTypeParamComponent,
    CompensationEntityParamComponent,
    RangeRetentionParamComponent,
    SalaryParameterParamComponent,
    CancellationTypeParamComponent,
    AssignmentStatusParamComponent,
    ContractTypesParamComponent,
  ],
  templateUrl: "./contracts-param.component.html",
})
export class ContractsParamComponent {}
