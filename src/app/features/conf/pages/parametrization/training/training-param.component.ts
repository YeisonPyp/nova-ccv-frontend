import { Component } from '@angular/core';
import { CatalogSectionComponent } from './components/catalog-section/catalog-section.component';
import { TrainerSectionComponent } from './components/trainer-section/trainer-section.component';

@Component({
  selector: 'app-training-param',
  standalone: true,
  imports: [CatalogSectionComponent, TrainerSectionComponent],
  templateUrl: './training-param.component.html',
})
export class TrainingParamComponent {}
