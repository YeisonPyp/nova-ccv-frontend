import { CommonModule } from '@angular/common';
import { Component, effect, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { PatAdendaProgramSummaryService } from '@/app/core/services/pat/pat-adenda-program-summary.service';
import { PatAdendaService } from '@/app/core/services/pat/pat-adenda.service';
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
  readonly year = input<number | null>(null);

  private readonly service = inject(PatAdendaProgramSummaryService);
  private readonly adendaService = inject(PatAdendaService);
  private readonly programService = inject(PatProgramService);
  private readonly router = inject(Router);

  loading = signal(false);
  items = signal<PatAdendaProgramSummary[]>([]);
  yearFilter = signal<number | null>(null);
  adendaIdFilter = signal<number | null>(null);
  resolvingId = signal<string | null>(null);

  adendaCtx = this.adendaService.newSearchSelectContext(
    (a) => this.adendaIdFilter.set(a.id),
    { isRequired: false, label: 'Adenda' },
    () => this.adendaIdFilter.set(null),
  );

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
      this.yearFilter.set(this.year());
    });
    effect(() => {
      const year = this.yearFilter();
      const adendaId = this.adendaIdFilter();
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

  onYearInputChange(value: number | null): void {
    this.yearFilter.set(value ?? null);
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
