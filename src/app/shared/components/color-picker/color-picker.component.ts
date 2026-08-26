import { Component, forwardRef, input, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { ColorPickerDirective } from "ngx-color-picker";
import { toObservable } from "@angular/core/rxjs-interop";

@Component({
  selector: "app-color-picker",
  standalone: true,
  imports: [CommonModule, ColorPickerDirective],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ColorPickerComponent),
      multi: true,
    },
  ],
  templateUrl: "./color-picker.component.html",
})
export class ColorPickerComponent implements ControlValueAccessor {
  label = input<string>("Color");

  selectedColor = signal<string>("#FFFFFF");

  public color1: string = "#2889e9";
  public color2: string = "#e920e9";
  public color3: string = "#fff500";
  public color4: string = "rgb(236,64,64)";
  public color5: string = "rgba(45,208,45,1)";
  public color6: string = "#1973c0";
  public color7: string = "#f200bd";
  public color8: string = "#a8ff00";
  public color9: string = "#278ce2";
  public color10: string = "#0a6211";
  public color11: string = "#f2ff00";
  public color12: string = "#f200bd";
  public color13: string = "rgba(0,255,0,0.5)";
  public color14: string = "rgb(0,255,255)";
  public color15: string = "rgb(255,0,0)";
  public color16: string = "#a51ad633";
  public color17: string = "#666666";
  public color18: string = "#fa8072";
  public color19: string = "#f88888";
  public color20: string = "#ff0000";
  isDisabled = false;

  setDisabledState(disabled: boolean): void {
    this.isDisabled = disabled;
  }

  onChange = (_: string) => {};
  onTouched = () => {};

  writeValue(color: string): void {
    this.selectedColor.set(color || this.color1);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  constructor() {
    toObservable(this.selectedColor).subscribe((color) => {
      this.onChange(color);
      this.onTouched();
    });
  }
}
