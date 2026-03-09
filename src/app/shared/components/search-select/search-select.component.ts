import { Component, EventEmitter, Input, Output, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { SearchSelectOption } from "./on-search-select.interface";
import { debounceTime, interval, Subject } from "rxjs";

@Component({
  selector: "app-search-select",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./search-select.component.html",
  styleUrl: "./search-select.component.scss",
})
export class SearchSelectComponent {
  @Input() id = "search-select-" + Math.random().toString(36).substring(2);
  @Input() label = "";
  @Input() placeholder = "Buscar...";
  @Input() required = false;
  @Input() isInvalid = false;
  @Input() errorMessage = "";
  @Input() maxElements = 1;
  @Input() items: SearchSelectOption[] = [];
  @Input() emptyMessage = "No se encontraron resultados.";
  @Input() selectedItems : Array<SearchSelectOption> = [];

  @Output() onSearch = new EventEmitter<string>();
  @Output() onSelect = new EventEmitter<SearchSelectOption>();
  @Output() onRemove = new EventEmitter<SearchSelectOption>();

  searchTerm = signal("");
  isOpen = signal(false);

  private searchSubject = new Subject<string>();

  constructor() {
    this.searchSubject.pipe(debounceTime(400)).subscribe((term) => {
      this.onSearch.emit(term);
      this.isOpen.set(true);
    })
  }

  onInput(event: Event) {
    this.searchSubject.next((event.target as HTMLInputElement).value);
  }

  toggleDropdown(event: Event) {
    event.preventDefault();
    this.isOpen.set(!this.isOpen());
    if (this.isOpen() && this.items.length === 0) {
      this.onSearch.emit(this.searchTerm());
    }
  }

  selectItem(item: SearchSelectOption, event: Event) {
    console.log('selected item', item);
    // event.preventDefault();
    this.onSelect.emit(item);
    this.isOpen.set(false);
  }

  removeItem(item: SearchSelectOption, event: Event) {
    event.preventDefault();
    this.onRemove.emit(item);
    this.isOpen.set(false);
  }

  closeDropdown() {
    this.isOpen.set(false);
  }
}
