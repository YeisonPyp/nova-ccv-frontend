import { Component, effect, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaginatorComponent } from '@/app/shared/components/paginator/paginator.component';
import { LoadingSpinnerComponent } from '@/app/shared/components/loading-spinner/loading-spinner.component';

export interface SelectableItem {
  id: number | string;
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
  imports: [
    CommonModule,
    FormsModule,
    PaginatorComponent,
    LoadingSpinnerComponent,
  ],
  templateUrl: './selectable-list.component.html',
})
export class SelectableListComponent {
  title = input.required<string>();
  items = input.required<SelectableItem[]>();
  multiple = input<boolean>(false);
  loading = input<boolean>(false);
  emptyMessage = input<string>('Sin registros.');

  search = input('');

  paginated = input<boolean>(false);
  size = input(10);
  totalPages = input<number>();
  currentPage = input<number>();

  onPageChange = output<number>();
  onPageSizeChange = output<number>();
  onSearch = output<string>();

  readonly selectionChange = output<string[]>();
  selected = signal<Set<string>>(new Set());

  constructor() {
    effect(() => {
      this.selectionChange.emit(Array.from(this.selected()));
    });
  }

  isSelected(id: number | string): boolean {
    return this.selected().has(id.toString());
  }

  toggle(id: number | string): void {
    this.selected.update((items) => {
      if (this.multiple()) {
        if (!items.delete(id.toString())) {
          items.add(id.toString());
        }
      } else {
        return new Set([id.toString()]);
      }
      return new Set(items);
    });
  }

  clear(): void {
    this.selected.set(new Set());
    this.selectionChange.emit([]);
  }

  onSearchChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.onSearch.emit(target.value);
  }
}
