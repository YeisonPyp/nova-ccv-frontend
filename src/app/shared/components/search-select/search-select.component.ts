import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  QueryList,
  SimpleChanges,
  ViewChildren,
  effect,
  signal,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { SearchSelectOption } from "./on-search-select.interface";
import { debounceTime, Subject } from "rxjs";
import { ChipItemComponent } from "./chip-item/chip-item.component";

@Component({
  selector: "app-search-select",
  standalone: true,
  imports: [CommonModule, FormsModule, ChipItemComponent],
  templateUrl: "./search-select.component.html",
  styleUrl: "./search-select.component.scss",
})
export class SearchSelectComponent implements OnChanges {
  @Input() id = "search-select-" + Math.random().toString(36).substring(2);
  @Input() label = "";
  @Input() placeholder = "Buscar...";
  @Input() required = false;
  @Input() isInvalid = false;
  @Input() errorMessage = "";
  @Input() maxElements = 1;
  @Input() items: SearchSelectOption[] = [];
  @Input() emptyMessage = "No se encontraron resultados.";
  @Input() selectedItems: Array<SearchSelectOption> = [];

  @Output() onSearch = new EventEmitter<string>();
  @Output() onSelect = new EventEmitter<SearchSelectOption>();
  @Output() onRemove = new EventEmitter<SearchSelectOption>();

  @ViewChildren("itemRef") private itemRefs!: QueryList<ElementRef<HTMLLIElement>>;

  searchTerm = signal("");
  isOpen = signal(false);
  activeIndex = signal(-1);

  private searchSubject = new Subject<string>();

  constructor() {
    this.searchSubject.pipe(debounceTime(400)).subscribe((term) => {
      this.onSearch.emit(term);
      this.isOpen.set(true);
      this.activeIndex.set(-1);
    });

    effect(() => {
      const idx = this.activeIndex();
      const refs = this.itemRefs;
      if (!refs || idx < 0) return;
      refs.toArray()[idx]?.nativeElement?.scrollIntoView({ block: "nearest" });
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["items"]) {
      this.activeIndex.set(-1);
    }
  }

  get activeOptionId(): string | null {
    const idx = this.activeIndex();
    return idx >= 0 && this.items[idx] ? `${this.id}-option-${idx}` : null;
  }

  onInput(event: Event) {
    this.searchTerm.set((event.target as HTMLInputElement).value);
    this.searchSubject.next(this.searchTerm());
  }

  onKeydown(event: KeyboardEvent) {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        if (!this.isOpen()) {
          this.isOpen.set(true);
          if (this.items.length === 0) this.onSearch.emit(this.searchTerm());
          return;
        }
        if (this.items.length === 0) return;
        this.activeIndex.set(
          Math.min(this.activeIndex() + 1, this.items.length - 1),
        );
        break;
      case "ArrowUp":
        event.preventDefault();
        if (this.items.length === 0) return;
        this.activeIndex.set(Math.max(this.activeIndex() - 1, 0));
        break;
      case "Enter": {
        if (!this.isOpen()) return;
        event.preventDefault();
        const item = this.items[this.activeIndex()];
        if (item) this.selectItem(item, event);
        break;
      }
      case "Escape":
        event.preventDefault();
        this.closeDropdown();
        break;
    }
  }

  toggleDropdown(event: Event) {
    event.preventDefault();
    this.isOpen.set(!this.isOpen());
    if (this.isOpen() && this.items.length === 0) {
      this.onSearch.emit(this.searchTerm());
    }
  }

  selectItem(item: SearchSelectOption, event: Event) {
    this.onSelect.emit(item);
    this.isOpen.set(false);
    this.activeIndex.set(-1);
  }

  removeItem(item: SearchSelectOption) {
    this.onRemove.emit(item);
    this.isOpen.set(false);
  }

  closeDropdown() {
    this.isOpen.set(false);
    this.activeIndex.set(-1);
  }
}
