import { Component } from "@angular/core";
import { PillarSectionComponent } from "./components/pillar-section.component";
import { PolicySectionComponent } from "./components/policy-section.component";
import { ProductSectionComponent } from "./components/product-section.component";
import { MeasurementSectionComponent } from "./components/measurement-section.component";
import { CuantitativeIndicatorSectionComponent } from "./components/cuantitative-indicator-section.component";
import { CualitativeIndicatorSectionComponent } from "./components/cualitative-indicator-section.component";

@Component({
  selector: "app-pat-param",
  standalone: true,
  imports: [
    PillarSectionComponent,
    PolicySectionComponent,
    ProductSectionComponent,
    MeasurementSectionComponent,
    CuantitativeIndicatorSectionComponent,
    CualitativeIndicatorSectionComponent,
  ],
  template: `
    <div class="max-w-7xl mx-auto">
      <h1 class="text-2xl font-bold text-secondary mb-6">
        Parametrización PAT
      </h1>

      <div class="flex flex-col">
        <app-pillar-section />
        <app-policy-section />
        <app-product-section />
        <app-measurement-section />
        <app-cuantitative-indicator-section />
        <app-cualitative-indicator-section />
      </div>
    </div>
  `,
})
export class PatParamComponent {}
