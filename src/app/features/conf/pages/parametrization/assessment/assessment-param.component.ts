import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PeriodsParamComponent } from './components/periods/periods-param.component';
import { AssessmentConfigParamComponent } from './components/config/assessment-config-param.component';

@Component({
  selector: 'app-assessment-param',
  standalone: true,
  imports: [RouterLink, PeriodsParamComponent, AssessmentConfigParamComponent],
  templateUrl: './assessment-param.component.html',
})
export class AssessmentParamComponent {}
