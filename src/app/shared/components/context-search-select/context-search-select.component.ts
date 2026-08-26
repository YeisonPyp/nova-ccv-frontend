import { Component, input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { SelectSearchComponent } from "../select-search/select-search.component";
import { SearchSelectContext } from "../search-select/on-search-select.interface";

@Component({
  selector: "app-context-search-select",
  standalone: true,
  imports: [CommonModule, SelectSearchComponent],
  template: `
    <app-select-search
      [label]="label()"
      [required]="required()"
      [maxElements]="ctx().op?.maxItems ?? 1"
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
