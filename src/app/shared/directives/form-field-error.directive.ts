import {
  Directive,
  ElementRef,
  Renderer2,
  inject,
  input,
  OnInit,
  OnDestroy,
} from "@angular/core";
import { NgControl } from "@angular/forms";
import { Subscription } from "rxjs";

@Directive({
  selector: "[appFormFieldError]",
  standalone: true,
})
export class FormFieldErrorDirective implements OnInit, OnDestroy {
  private readonly ngControl = inject(NgControl, {
    self: true,
    optional: true,
  });
  private readonly el = inject(ElementRef);
  private readonly renderer = inject(Renderer2);

  appFormFieldError = input<Record<string, string> | undefined>({});

  private errorElement: HTMLElement | null = null;
  private statusSub?: Subscription;

  private defaultMessages: Record<string, string> = {
    required: "Este campo es requerido.",
    email: "El formato del correo no es válido.",
    minlength: "El campo no cumple con el mínimo de caracteres.",
  };

  ngOnInit(): void {
    if (!this.ngControl) {
      console.warn(
        "FormFieldErrorDirective debe usarse en un elemento con formControl o formControlName",
      );
      return;
    }

    this.statusSub = this.ngControl.statusChanges?.subscribe(() => {
      this.checkValidity();
    });

    this.renderer.listen(this.el.nativeElement, "blur", () => {
      this.checkValidity();
    });
  }

  private checkValidity(): void {
    const control = this.ngControl?.control;

    const isInvalid = !!(control && control.touched && control.invalid);

    if (isInvalid) {
      this.showError();
    } else {
      this.removeError();
    }
  }

  private showError(): void {
    const control = this.ngControl?.control;
    if (!control || !control.errors) return;

    const firstErrorKey = Object.keys(control.errors)[0];

    const errorMessage =
      this.appFormFieldError()?.[firstErrorKey] ||
      this.defaultMessages[firstErrorKey] ||
      "Campo inválido.";

    if (!this.errorElement) {
      this.errorElement = this.renderer.createElement("small");
      this.renderer.addClass(this.errorElement, "form-error-message");
      this.renderer.setStyle(this.errorElement, "color", "#dc3545");
      this.renderer.setStyle(this.errorElement, "display", "block");
      this.renderer.setStyle(this.errorElement, "margin-top", "4px");

      const parent = this.renderer.parentNode(this.el.nativeElement);
      if (parent) {
        this.renderer.appendChild(parent, this.errorElement);
      }
    }

    this.renderer.setProperty(this.errorElement, "textContent", errorMessage);
    this.renderer.addClass(this.el.nativeElement, "is-invalid-input");
  }

  private removeError(): void {
    if (this.errorElement) {
      this.renderer.removeChild(
        this.renderer.parentNode(this.errorElement),
        this.errorElement,
      );
      this.errorElement = null;
    }
    this.renderer.removeClass(this.el.nativeElement, "is-invalid-input");
  }

  ngOnDestroy(): void {
    this.statusSub?.unsubscribe();
    this.removeError();
  }
}
