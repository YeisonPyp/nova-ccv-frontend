import { CommonModule } from '@angular/common';
import { Component, input, forwardRef, signal, computed } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-score-slider',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './score-slider.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ScoreSliderComponent),
      multi: true,
    },
  ],
})
export class ScoreSliderComponent implements ControlValueAccessor {
  min = input<number>(0);
  max = input<number>(5);

  protected val = signal<number>(0);

  protected fillPercent = computed(() => {
    const range = this.max() - this.min();
    if (range === 0) return 0;
    return ((this.val() - this.min()) / range) * 100;
  });

  private onChange: (value: number) => void = () => {};
  private onTouched: () => void = () => {};
  protected isDisabled = signal<boolean>(false);

  writeValue(value: number): void {
    if (value !== undefined && value !== null) {
      this.val.set(value);
    }
  }

  registerOnChange(fn: (value: number) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.isDisabled.set(disabled);
  }

  onInput(event: Event): void {
    const numericValue = Number((event.target as HTMLInputElement).value);
    this.val.set(numericValue);
    this.onChange(numericValue);
  }

  onBlur(): void {
    this.onTouched();
  }
}
