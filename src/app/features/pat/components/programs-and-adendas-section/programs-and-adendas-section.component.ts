import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { AdendaListComponent } from '../adenda-list/adenda-list.component';
import { ProgramsTabComponent } from '../programs-tab/programs-tab.component';
import { PatAdenda } from '@/app/core/models/pat/pat-models';

@Component({
  selector: 'app-programs-and-adendas-section',
  standalone: true,
  imports: [CommonModule, AdendaListComponent, ProgramsTabComponent],
  templateUrl: './programs-and-adendas-section.component.html',
})
export class ProgramsAndAdendasSectionComponent {
  selectedAdenda = signal<PatAdenda | null>(null);

  onSelectAdenda(adenda: PatAdenda | null): void {
    this.selectedAdenda.set(adenda);
  }
}
