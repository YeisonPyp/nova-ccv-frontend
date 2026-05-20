import { Component, OnInit, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
} from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { AuthService } from "../../../core/services/auth.service";

function passwordsMatch(control: AbstractControl): ValidationErrors | null {
  const password = control.get("password")?.value;
  const confirm = control.get("confirmPassword")?.value;
  return password && confirm && password !== confirm
    ? { passwordsMismatch: true }
    : null;
}

@Component({
  selector: "app-reset-password",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: "./reset-password.component.html",
})
export class ResetPasswordComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  token = signal<string | null>(null);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  success = signal(false);
  showPassword = signal(false);
  showConfirm = signal(false);

  form: FormGroup = this.fb.group(
    {
      password: ["", [Validators.required, Validators.minLength(8)]],
      confirmPassword: ["", Validators.required],
    },
    { validators: passwordsMatch },
  );

  ngOnInit(): void {
    const t = this.route.snapshot.queryParamMap.get("token");
    if (!t) {
      this.errorMessage.set("Enlace inválido. Solicita uno nuevo.");
      return;
    }
    this.token.set(t);
  }

  onSubmit(): void {
    if (this.form.invalid || !this.token()) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.authService
      .resetPassword(this.token()!, this.form.value.password)
      .subscribe({
        next: () => {
          this.isLoading.set(false);
          this.success.set(true);
          setTimeout(() => this.router.navigate(["/auth/login"]), 3000);
        },
        error: (error) => {
          this.isLoading.set(false);
          this.errorMessage.set(
            error.message ?? "El enlace es inválido o ha expirado.",
          );
        },
      });
  }

  isFieldInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  toggleShowConfirm() {
    this.showConfirm.update((v) => !v);
  }

  toggleShowPassword() {
    this.showPassword.update((v) => !v);
  }
}
