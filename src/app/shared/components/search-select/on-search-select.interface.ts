export interface SearchSelectOption {
  id: number | string;
  title: string;
}

export interface OnSearchSelect<T extends SearchSelectOption> {
  searchElementsResult: Array<T>;
  onSearch(s: string): void;
  onSelectSearchResult(result: T): void;
}
