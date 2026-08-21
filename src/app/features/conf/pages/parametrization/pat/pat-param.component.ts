import { Component } from "@angular/core";
import { PillarSectionComponent } from "./components/pillar-section.component";
import { PolicySectionComponent } from "./components/policy-section.component";
import { BenefitTypeSectionComponent } from "./components/benefit-type-section.component";
import { ProductSectionComponent } from "./components/product-section.component";
import { ManagementIndicatorSectionComponent } from "./components/management-indicator-section.component";
import { PatPlanningNotificationConfigSectionComponent } from "./components/planning-notification-config-section.component";

@Component({
  selector: "app-pat-param",
  standalone: true,
  imports: [
    PillarSectionComponent,
    PolicySectionComponent,
    BenefitTypeSectionComponent,
    ProductSectionComponent,
    ManagementIndicatorSectionComponent,
    PatPlanningNotificationConfigSectionComponent,
  ],
  template: `
    <div class="max-w-7xl mx-auto">
      <h1 class="text-2xl font-bold text-secondary mb-6">
        Parametrización PAT
      </h1>

      <div class="flex flex-col">
        <app-pillar-section />
        <app-policy-section />
        <app-benefit-type-section />
        <app-product-section />
        <app-management-indicator-section />
        <app-pat-planning-notification-config-section />
      </div>
    </div>
  `,
})
export class PatParamComponent {}
