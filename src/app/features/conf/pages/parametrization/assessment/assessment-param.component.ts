import { Component } from "@angular/core";
import { PeriodsParamComponent } from "./components/periods/periods-param.component";
import { CompetenciesParamComponent } from "./components/competencies/competencies-param.component";
import { ImpactRulesParamComponent } from "./components/impact-rules/impact-rules-param.component";

@Component({
  selector: "app-assessment-param",
  standalone: true,
  imports: [PeriodsParamComponent, CompetenciesParamComponent, ImpactRulesParamComponent],
  templateUrl: "./assessment-param.component.html",
})
export class AssessmentParamComponent {}
