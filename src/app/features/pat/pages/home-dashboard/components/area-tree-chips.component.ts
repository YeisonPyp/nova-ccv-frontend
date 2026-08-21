import { Component, computed, effect, inject, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AreaService } from '@/app/core/services/assessment/area.service';
import { AreaTreeNode } from '@/app/core/models/assessment/area.model';

/** One chip row, flattened from the tree so depth can be shown by indent. */
interface AreaChip {
  id: number;
  name: string;
  depth: number;
}

/**
 * Area selector for the dashboard. Shows the org chart flattened into
 * chips ordered by depth; selecting one scopes the dashboard to that area
 * *and its descendants*, which the backend resolves.
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

  tree = signal<AreaTreeNode[]>([]);
  selectedId = signal<number | null>(null);

  chips = computed<AreaChip[]>(() => flatten(this.tree(), 0));

  constructor() {
    this.areaService.tree().subscribe((res) => {
      if (!res.success || !res.data) return;
      this.tree.set(res.data);

      // Preselect the topmost node of the operating structure (the
      // presidency), so the dashboard opens showing everything.
      const root = res.data.find((n) => n.type === 'PRESIDENCY') ?? res.data[0];
      if (root) this.select(root.id);
    });

    effect(() => this.selectedChange.emit(this.selectedId()));
  }

  select(id: number | null): void {
    this.selectedId.set(id);
  }
}

function flatten(nodes: AreaTreeNode[], depth: number): AreaChip[] {
  const out: AreaChip[] = [];
  for (const n of nodes) {
    out.push({ id: n.id, name: n.name, depth });
    out.push(...flatten(n.children ?? [], depth + 1));
  }
  return out;
}
