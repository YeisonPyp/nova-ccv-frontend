import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  HostListener,
  computed,
  effect,
  input,
  output,
  signal,
  viewChild,
  viewChildren,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime } from 'rxjs';
import { SearchSelectOption } from '../search-select/on-search-select.interface';

/**
 * Select with live search. Behaves like a native <select>: a closed trigger
 * shows the current selection, and clicking it opens a panel that has its own
 * search box above the option list (the search box is never the trigger).
 *
 * Drop-in friendly with `app-search-select`: same option shape and the same
 * onSearch / onSelect / onRemove outputs.
 */
@Component({
  selector: 'app-select-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './select-search.component.html',
})
export class SelectSearchComponent {
  id = input<string>('select-search-' + Math.random().toString(36).slice(2));
  label = input<string>('');
  /** Text shown on the trigger when nothing is selected. */
  placeholder = input<string>('Seleccionar…');
  /** Text shown inside the panel's search box. */
  searchPlaceholder = input<string>('Buscar…');
  required = input<boolean>(false);
  isInvalid = input<boolean>(false);
  errorMessage = input<string>('');
  disabled = input<boolean>(false);
  /** 1 = single select (default). 0 or less = unlimited. */
  maxElements = input<number>(1);
  items = input<SearchSelectOption[]>([]);
  selectedItems = input<SearchSelectOption[]>([]);
  emptyMessage = input<string>('No se encontraron resultados.');
  /** Emit the search term as soon as the panel opens. */
  searchOnOpen = input<boolean>(true);

  onSearch = output<string>();
  onSelect = output<SearchSelectOption>();
  onRemove = output<SearchSelectOption>();

  private readonly searchBox =
    viewChild<ElementRef<HTMLInputElement>>('searchBox');
  private readonly optionRefs =
    viewChildren<ElementRef<HTMLLIElement>>('optionRef');

  isOpen = signal(false);
  searchTerm = signal('');
  activeIndex = signal(-1);

  private readonly search$ = new Subject<string>();

  isSingle = computed(() => this.maxElements() === 1);

  isFull = computed(() => {
    const max = this.maxElements();
    return max > 0 && this.selectedItems().length >= max;
  });

  /** Label rendered on the closed trigger. */
  triggerLabel = computed(() => {
    const selected = this.selectedItems();
    if (!selected.length) return this.placeholder();
    if (this.isSingle()) return selected[0].title;
    return `${selected.length} seleccionados`;
  });

  hasSelection = computed(() => this.selectedItems().length > 0);

  activeOptionId = computed(() => {
    const idx = this.activeIndex();
    return idx >= 0 && this.items()[idx] ? `${this.id()}-option-${idx}` : null;
  });

  constructor(private readonly host: ElementRef<HTMLElement>) {
    this.search$
      .pipe(debounceTime(350))
      .subscribe((term) => this.onSearch.emit(term));

    // keep the highlighted option in view
    effect(() => {
      console.log('is single', this.isSingle());
      const idx = this.activeIndex();
      if (idx < 0) return;
      this.optionRefs()[idx]?.nativeElement?.scrollIntoView({
        block: 'nearest',
      });
    });
  }

  isSelected(item: SearchSelectOption): boolean {
    return this.selectedItems().some((s) => s.id === item.id);
  }

  // ── Open / close ──────────────────────────────────────────────────────────

  toggle(): void {
    this.isOpen() ? this.close() : this.open();
  }

  open(): void {
    if (this.disabled()) return;
    this.isOpen.set(true);
    this.activeIndex.set(-1);
    if (this.searchOnOpen()) this.onSearch.emit(this.searchTerm());
    // focus the panel's own search box, not the trigger
    setTimeout(() => this.searchBox()?.nativeElement.focus());
  }

  close(): void {
    this.isOpen.set(false);
    this.activeIndex.set(-1);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.isOpen()) return;
    if (!this.host.nativeElement.contains(event.target as Node)) this.close();
  }

  // ── Search ────────────────────────────────────────────────────────────────

  onSearchInput(value: string): void {
    this.searchTerm.set(value);
    this.activeIndex.set(-1);
    this.search$.next(value);
  }

  clearSearch(): void {
    this.searchTerm.set('');
    this.onSearch.emit('');
    this.searchBox()?.nativeElement.focus();
  }

  // ── Selection ─────────────────────────────────────────────────────────────

  selectItem(item: SearchSelectOption): void {
    if (this.isSelected(item)) {
      // clicking a selected option toggles it off (like a multi-select)
      this.onRemove.emit(item);
      if (this.isSingle()) this.close();
      return;
    }
    if (this.isFull() && !this.isSingle()) return;

    this.onSelect.emit(item);
    if (this.isSingle()) {
      this.close();
    }
  }

  removeItem(item: SearchSelectOption, event?: Event): void {
    event?.stopPropagation();
    this.onRemove.emit(item);
  }

  clearAll(event: Event): void {
    event.stopPropagation();
    this.selectedItems().forEach((i) => this.onRemove.emit(i));
  }

  // ── Keyboard ──────────────────────────────────────────────────────────────

  onTriggerKeydown(event: KeyboardEvent): void {
    if (['ArrowDown', 'Enter', ' '].includes(event.key)) {
      event.preventDefault();
      this.open();
    }
  }

  onPanelKeydown(event: KeyboardEvent): void {
    const total = this.items().length;
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (total) this.activeIndex.set((this.activeIndex() + 1) % total);
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (total) {
          this.activeIndex.set(
            this.activeIndex() <= 0 ? total - 1 : this.activeIndex() - 1,
          );
        }
        break;
      case 'Home':
        event.preventDefault();
        if (total) this.activeIndex.set(0);
        break;
      case 'End':
        event.preventDefault();
        if (total) this.activeIndex.set(total - 1);
        break;
      case 'Enter': {
        event.preventDefault();
        const item = this.items()[this.activeIndex()];
        if (item) this.selectItem(item);
        break;
      }
      case 'Escape':
        event.preventDefault();
        this.close();
        break;
      case 'Tab':
        this.close();
        break;
    }
  }
}
