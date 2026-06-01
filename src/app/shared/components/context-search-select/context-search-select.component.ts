import { Component, input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { SearchSelectComponent } from "../search-select/search-select.component";
import { SearchSelectContext } from "../search-select/on-search-select.interface";

@Component({
  selector: "app-context-search-select",
  standalone: true,
  imports: [CommonModule, SearchSelectComponent],
  template: `
    <app-search-select
      [label]="label()"
      [required]="required()"
      [items]="ctx().options()"
      [selectedItems]="ctx().selectedOptions()"
      (onSearch)="ctx().search($event)"
      (onSelect)="ctx().select($event)"
      (onRemove)="ctx().remove($event)"
    />
  `,
})
export class ContextSearchSelectComponent {
  ctx = input.required<SearchSelectContext<any>>();
  required = input.required<boolean>();
  label = input.required<string>();
}
