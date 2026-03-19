import { signal, Signal } from "@angular/core";
import { map, Observable } from "rxjs";

export interface SearchOptionWithId {
  id: number | string;
}

export interface SearchSelectOption extends SearchOptionWithId {
  title: string;
}

export interface SearchSelectContext<T extends SearchOptionWithId> {
  selectedOptions: Signal<SearchSelectOption[]>;
  options: Signal<SearchSelectOption[]>;
  results: Signal<Array<T>>;
  search(term: string): void;
  select(item: SearchSelectOption): void;
  remove(item: SearchSelectOption): void;
}

export interface SearchSelectContextFactoryOptions {
  maxItems?: number;
  isRequired?: boolean;
  emptyMessage?: string;
  placeholder?: string;
  label?: string;
}

export type OnSelectCallback<T> = (item: T) => void;
export type SelectOptionMapper<T> = (item: T) => SearchSelectOption;

export class SearchSelectContextFactory<T extends SearchOptionWithId> implements SearchSelectContext<T> {
  options = signal<SearchSelectOption[]>([]);
  selectedOptions = signal<SearchSelectOption[]>([]);
  results = signal<T[]>([]);

  constructor(
    private fetchFn: (term: string) => Observable<T[]>,
    private mapper: SelectOptionMapper<T>,
    private onSelectCallback?: OnSelectCallback<T>,
    public op?: SearchSelectContextFactoryOptions
  ) { }

  search(term: string) {
    this.fetchFn(term).pipe(
      map(items => {
        this.results.set(items);
        return items.map(this.mapper);
      })
    ).subscribe(o => this.options.set(o));
  }

  select(option: SearchSelectOption) {
    if (!this.selectedOptions().some(i => i.id === option.id)) {
      this.selectedOptions.update(items => [...items, option]);
      if (this.onSelectCallback) {
        const original = this.results().find((v) => v.id === option.id);
        if (original)
          this.onSelectCallback(original);
      }
    }
  }

  selectResults(r: Array<T>) {
    this.selectedOptions.set(r.map((i) => this.mapper(i)));
  }

  remove(option: SearchSelectOption) {
    this.selectedOptions.update(items => items.filter(i => i.id !== option.id));
  }
}