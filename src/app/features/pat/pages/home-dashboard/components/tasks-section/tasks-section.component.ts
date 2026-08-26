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
import { PatActivityTask } from '@/app/core/models/pat/pat-models';
import { PatActivityTaskService } from '@/app/core/services/pat/pat-activity-task.service';
import { buildRsqlPredicate } from '@/app/shared/utils/rsql-predicate.util';

@Component({
  selector: 'app-tasks-section',
  standalone: true,
  imports: [SelectableListComponent],
  templateUrl: './tasks-section.component.html',
})
export class TasksSectionComponent {
  private readonly service = inject(PatActivityTaskService);
  programId = input<number | null>(null);
  areaId = input<number | null>(null);
  year = input.required<number>();

  loading = signal(false);

  selectedActivities = output<string[]>();

  page = signal(1);
  size = signal(20);
  totalPages = signal<number>(0);

  search = signal('');

  tasks = signal<PatActivityTask[]>([]);

  items = computed(() => {
    return this.tasks().map(
      (task) =>
        ({
          id: task.id,
          label: task.name,
          sublabel: task.description,
        }) as SelectableItem,
    );
  });

  /** Any change here starts the listing over from the first page. */
  private readonly filterKey = computed(
    () =>
      `${this.year()}|${this.areaId() ?? ''}|${this.programId() ?? ''}|${this.search()}`,
  );
  private lastFilterKey: string | null = null;

  constructor() {
    effect(() => {
      const filterKey = this.filterKey();
      if (this.lastFilterKey !== null && filterKey !== this.lastFilterKey) {
        this.page.set(1);
      }
      this.lastFilterKey = filterKey;

      const search = this.search();
      this.loading.set(true);
      this.service
        .findAll({
          year: this.year(),
          programId: this.programId(),
          areaId: this.areaId(),
          // The paginator is 1-based, Spring's Pageable is 0-based.
          page: this.page() - 1,
          size: this.size(),
          nodes: !search
            ? undefined
            : [
                buildRsqlPredicate('name', 'lk', search),
                buildRsqlPredicate('description', 'lk', search),
              ],
        })
        .subscribe((res) => {
          this.loading.set(false);
          this.tasks.set(res.data.content);
          this.totalPages.set(res.data.totalPages);
        });
    });
  }
}
