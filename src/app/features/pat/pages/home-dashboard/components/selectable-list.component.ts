import { Component, computed, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface SelectableItem {
  id: number;
  label: string;
  sublabel?: string;
}

/**
 * Searchable list of checkboxes used by both the programs and the tasks
 * sections. Programs are single-select (picking one scopes everything
 * below it); tasks are multi-select.
 */
@Component({
  selector: 'app-selectable-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './selectable-list.component.html',
})
export class SelectableListComponent {
  title = input.required<string>();
  items = input.required<SelectableItem[]>();
  multiple = input<boolean>(false);
  loading = input<boolean>(false);
  emptyMessage = input<string>('Sin registros.');

  readonly selectionChange = output<number[]>();

  search = signal('');
  selected = signal<number[]>([]);

  visible = computed(() => {
    const term = this.search().trim().toLowerCase();
    if (!term) return this.items();
    return this.items().filter(
      (i) =>
        i.label.toLowerCase().includes(term) ||
        (i.sublabel ?? '').toLowerCase().includes(term),
    );
  });

  isSelected(id: number): boolean {
    return this.selected().includes(id);
  }

  toggle(id: number): void {
    const current = this.selected();
    let next: number[];

    if (this.multiple()) {
      next = current.includes(id)
        ? current.filter((x) => x !== id)
        : [...current, id];
    } else {
      // Single-select behaves as a radio that can be cleared.
      next = current.includes(id) ? [] : [id];
    }

    this.selected.set(next);
    this.selectionChange.emit(next);
  }

  clear(): void {
    this.selected.set([]);
    this.selectionChange.emit([]);
  }

  onSearch(value: string): void {
    this.search.set(value);
  }
}
