import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { AdendaContextSectionComponent } from './adenda-context-section/adenda-context-section.component';
import { AdendaProgramSummarySectionComponent } from './adenda-program-summary-section/adenda-program-summary-section.component';

@Component({
  selector: 'app-programs-tab',
  standalone: true,
  imports: [
    CommonModule,
    AdendaContextSectionComponent,
    AdendaProgramSummarySectionComponent,
  ],
  templateUrl: './programs-tab.component.html',
})
export class ProgramsTabComponent {
  readonly year = input.required<number>();
  readonly adendaId = input<number | null>(null);
}
