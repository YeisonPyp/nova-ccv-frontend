import { PatAdendaProgramSummary } from '@/app/core/models/pat/pat-models';
import {
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import {
  SelectableItem,
  SelectableListComponent,
} from '../selectable-list/selectable-list.component';
import { PatAdendaProgramSummaryService } from '@/app/core/services/pat/pat-adenda-program-summary.service';

@Component({
  selector: 'app-programs-section',
  standalone: true,
  imports: [SelectableListComponent],
  templateUrl: './programs-section.component.html',
})
export class ProgramsSectionComponent {
  private readonly service = inject(PatAdendaProgramSummaryService);

  year = input.required<number>();
  areaId = input.required<number | null>();

  onSelectedPrograms = output<string[]>();

  items = signal<PatAdendaProgramSummary[]>([]);
  loading = signal<boolean>(false);
  search = signal<string>('');

  selectableItems = computed(() => {
    const term = this.search().trim().toLowerCase();
    const items = this.items()
      .filter((p) => p.programId)
      .map(
        (p) =>
          ({
            id: p.programId,
            label: p.programCode,
            sublabel: p.description,
          }) as SelectableItem,
      );
    if (!term) return items;
    return items.filter(
      (i) =>
        i.label.toLowerCase().includes(term) ||
        (i.sublabel ?? '').toLowerCase().includes(term),
    );
  });

  constructor() {
    effect(() => {
      this.loading.set(true);
      this.service
        .findSummaries({ areaId: this.areaId(), year: this.year() })
        .subscribe((response) => {
          this.items.set(response.data);
          this.loading.set(false);
        });
    });
  }

  onProgramChange(el: string[]) {
    this.onSelectedPrograms.emit(el);
  }
}
