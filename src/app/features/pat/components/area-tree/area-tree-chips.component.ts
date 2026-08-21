import { Component, computed, effect, inject, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AreaService } from '@/app/core/services/assessment/area.service';
import {
  AREA_TYPE_LABELS,
  AreaTreeNode,
} from '@/app/core/models/assessment/area.model';

/**
 * Area selector for the dashboard, laid out as a horizontal drill-down:
 * each level of the org chart is its own column, and picking a node opens
 * its children in a new column to the right instead of pushing the rest of
 * the dashboard down.
 *
 * Selecting an area scopes the dashboard to it *and its descendants*, which
 * the backend resolves.
 */
@Component({
  selector: 'app-area-tree-chips',
  standalone: true,
  imports: [CommonModule],
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

  clear(): void {
    this.path.set([]);
  }
}
