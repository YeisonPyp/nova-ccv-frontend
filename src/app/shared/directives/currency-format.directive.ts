import {
  Directive,
  effect,
  ElementRef,
  HostListener,
  inject,
} from "@angular/core";
import { NgControl } from "@angular/forms";

@Directive({
  selector: "[appCurrencyFormat]",
  standalone: true,
})
export class CurrencyFormatDirective {
  private el = inject(ElementRef);
  private control = inject(NgControl);

  private formatter = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  constructor() {
    effect(() => {
      const cleanValue = this.el.nativeElement.value.replace(/\D/g, "");
      const numericValue = parseInt(cleanValue, 10);
      this.el.nativeElement.value = this.formatter.format(numericValue);
    });
  }

  @HostListener("input", ["$event.target.value"])
  onInput(value: string) {
    const cleanValue = value.replace(/\D/g, "");

    if (!cleanValue) {
      this.updateValues("", null);
      return;
    }

    const numericValue = parseInt(cleanValue, 10);

    const formatted = this.formatter.format(numericValue);

    this.updateValues(formatted, numericValue);
  }

  @HostListener("focus")
  onFocus() {
    const value = this.el.nativeElement.value;
    if (value) {
      const cleanValue = value.replace(/[^\d.]/g, "");
      this.el.nativeElement.value = cleanValue;
    }
  }

  @HostListener("blur")
  onBlur() {
    const value = this.el.nativeElement.value;
    if (value) {
      const numericValue = parseInt(value.replace(/\D/g, ""), 10);
      if (!isNaN(numericValue)) {
        this.el.nativeElement.value = this.formatter.format(numericValue);
      }
    }
  }

  private updateValues(viewValue: string, modelValue: number | null) {
    this.el.nativeElement.value = viewValue;

    if (this.control && this.control.control) {
      this.control.control.setValue(modelValue, {
        emitModelToViewChange: false,
      });
    }
  }
}
