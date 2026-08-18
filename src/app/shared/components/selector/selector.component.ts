import { Component, forwardRef, input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface Option {
  value: string | number;
  label: string;
}

/**
 * Drives a native `<select>` as its own ControlValueAccessor instead of
 * relying on Angular's built-in SelectControlValueAccessor: that one tracks
 * `<option>` elements via a @ContentChildren query, which never sees options
 * rendered by this component's own template (a child component's view isn't
 * "content" of the host element from the outer formControlName's point of
 * view), so writeValue() could never find a match and the select stayed
 * blank whenever a form was patched with an existing value.
 */
@Component({
  selector: 'select[app-selector]',
  standalone: true,
  templateUrl: './selector.component.html',
  host: {
    '(change)': 'onSelectChange($any($event.target).value)',
    '(blur)': 'onTouched()',
    '[disabled]': 'disabled',
    '[value]': 'stringValue',
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectorComponent),
      multi: true,
    },
  ],
})
export class SelectorComponent implements ControlValueAccessor {
  options = input.required<Option[]>();

  value: string | number | null = null;
  disabled = false;

  private onChange: (value: string | number | null) => void = () => {};
  onTouched: () => void = () => {};

  get stringValue(): string {
    return this.value == null ? '' : String(this.value);
  }

  writeValue(value: string | number | null): void {
    this.value = value ?? null;
  }

  registerOnChange(fn: (value: string | number | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onSelectChange(rawValue: string): void {
    const match = this.options().find((o) => String(o.value) === rawValue);
    this.value = match ? match.value : null;
    this.onChange(this.value);
  }
}
