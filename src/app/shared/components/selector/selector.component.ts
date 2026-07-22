import { Component, input } from '@angular/core';

export interface Option {
  value: string | number;
  label: string;
}

@Component({
  selector: 'select[app-selector]',
  standalone: true,
  templateUrl: './selector.component.html',
})
export class SelectorComponent {
  options = input.required<Option[]>();
}
