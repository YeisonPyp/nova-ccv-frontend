import { CommonModule } from '@angular/common';
import { Component, effect, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { PatAdendaProgramSummaryService } from '@/app/core/services/pat/pat-adenda-program-summary.service';
import { PatProgramService } from '@/app/core/services/pat/pat-program.service';
import { PatAdendaProgramSummary } from '@/app/core/models/pat/pat-models';
import { ContextSearchSelectComponent } from '@/app/shared/components/context-search-select/context-search-select.component';
import {
  DynamicTableComponent,
  TableColumn,
} from '@/app/shared/components/dynamic-table/dynamic-table.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-adenda-program-summary-section',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ContextSearchSelectComponent,
    DynamicTableComponent,
  ],
  templateUrl: './adenda-program-summary-section.component.html',
})
export class AdendaProgramSummarySectionComponent {
  readonly year = input.required<number>();
  adendaId = input<number | null>(null);

  private readonly service = inject(PatAdendaProgramSummaryService);
  private readonly programService = inject(PatProgramService);
  private readonly router = inject(Router);

  loading = signal(false);
  items = signal<PatAdendaProgramSummary[]>([]);
  resolvingId = signal<string | null>(null);

  readonly columns: TableColumn[] = [
    { key: 'programCode', label: 'Código' },
    { key: 'description', label: 'Programa' },
    { key: 'adendaName', label: 'Adenda' },
    { key: 'year', label: 'Año' },
    { key: 'contextName', label: 'Contexto' },
    { key: 'unitMeasureName', label: 'Unidad de medida' },
    { key: 'unitMeasureGoal', label: 'Meta' },
  ];

  constructor() {
    effect(() => {
      const year = this.year();
      const adendaId = this.adendaId();
      this.load(adendaId, year);
    });
  }

  private load(adendaId: number | null, year: number | null): void {
    this.loading.set(true);
    this.service.findSummaries({ adendaId, year }).subscribe((res) => {
      this.loading.set(false);
      if (res.success && res.data) this.items.set(res.data);
    });
  }

  viewProgram(item: PatAdendaProgramSummary): void {
    const year = item.year;
    if (item.programId != null) {
      this.router.navigate(['/pat', year, 'programs', item.programId]);
      return;
    }
    if (item.contextId == null || item.unitMeasureId == null) return;

    this.resolvingId.set(item.programCode);
    this.programService
      .resolveProgram(item.adendaId, item.contextId, item.unitMeasureId)
      .subscribe({
        next: (res) => {
          this.resolvingId.set(null);
          if (res.success && res.data) {
            this.router.navigate(['/pat', year, 'programs', res.data.id]);
          }
        },
        error: () => this.resolvingId.set(null),
      });
  }
}
