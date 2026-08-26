import {
  Component,
  computed,
  effect,
  inject,
  output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { AreaService } from '@/app/core/services/assessment/area.service';
import {
  AREA_TYPE_LABELS,
  AreaTreeNode,
} from '@/app/core/models/assessment/area.model';
import { HomeIconComponent } from '@/app/shared/components/home-icon/home-icon.component';

/**
 * Area selector for the dashboard, laid out as a drill-down: only the level
 * currently being browsed is shown, and picking a node with children replaces
 * the list with them. The breadcrumb plus the back/root buttons are what move
 * between levels.
 *
 * Selecting an area scopes the dashboard to it *and its descendants*, which
 * the backend resolves.
 */
@Component({
  selector: 'app-area-tree-chips',
  standalone: true,
  imports: [CommonModule, HomeIconComponent],
  templateUrl: './area-tree-chips.component.html',
})
export class AreaTreeChipsComponent {
  private readonly areaService = inject(AreaService);

  readonly selectedChange = output<number | null>();

  readonly typeLabels = AREA_TYPE_LABELS;

  tree = signal<AreaTreeNode[]>([]);

  /** One selected id per level; drives both the columns and the filter. */
  path = signal<number[]>([]);

  selectedId = computed<number | null>(() => {
    const p = this.path();
    return p.length ? p[p.length - 1] : null;
  });

  /** Level 0 is the roots; each further column holds the children of the
   * node picked in the column before it. */
  columns = computed<AreaTreeNode[][]>(() => {
    const cols: AreaTreeNode[][] = [this.tree()];
    for (const id of this.path()) {
      const node = cols[cols.length - 1].find((n) => n.id === id);
      if (!node?.children?.length) break;
      cols.push(node.children);
    }
    return cols.filter((c) => c.length > 0);
  });

  /** Deepest opened level: the only column rendered. */
  currentLevel = computed<number>(() => this.columns().length - 1);

  currentColumn = computed<AreaTreeNode[]>(
    () => this.columns()[this.currentLevel()] ?? [],
  );

  canGoBack = computed<boolean>(() => this.path().length > 0);

  /** Names along the current path, for the breadcrumb. */
  breadcrumb = computed<string[]>(() => {
    const names: string[] = [];
    let level = this.tree();
    for (const id of this.path()) {
      const node = level.find((n) => n.id === id);
      if (!node) break;
      names.push(node.name);
      level = node.children ?? [];
    }
    return names;
  });

  constructor() {
    this.areaService.tree().subscribe((res) => {
      if (!res.success || !res.data) return;
      this.tree.set(res.data);

      // Open on the topmost node of the operating structure (the
      // presidency), so the dashboard starts showing everything.
      const root = res.data.find((n) => n.type === 'PRESIDENCY') ?? res.data[0];
      if (root) this.path.set([root.id]);
    });

    effect(() => this.selectedChange.emit(this.selectedId()));
  }

  isSelected(level: number, id: number): boolean {
    return this.path()[level] === id;
  }

  /** Picking a node truncates the path to its level, then appends it.
   * Picking the already-selected node deselects it and everything under. */
  select(level: number, id: number): void {
    const current = this.path();
    if (current[level] === id) {
      this.path.set(current.slice(0, level));
      return;
    }
    this.path.set([...current.slice(0, level), id]);
  }

  /** Climbs one level, deselecting the node whose children are on screen. */
  back(): void {
    this.path.update((p) => p.slice(0, -1));
  }

  clear(): void {
    this.path.set([]);
  }
}
