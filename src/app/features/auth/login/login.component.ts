import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  FormBuilder, 
  FormGroup, 
  Validators, 
  ReactiveFormsModule 
} from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { LoginRequest } from '../../../core/models/auth.models';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    RouterLink
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  loginForm!: FormGroup;
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  showPassword = signal(false);
  returnUrl: string = '/dashboard';

  ngOnInit(): void {
    this.initForm();
    this.getReturnUrl();
    this.checkAlreadyAuthenticated();
  }

  private initForm(): void {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  private getReturnUrl(): void {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
    console.log('🎯 Return URL:', this.returnUrl);
  }

  private checkAlreadyAuthenticated(): void {
    if (this.authService.isAuthenticated()) {
      console.log('✅ Ya autenticado, redirigiendo...');
      this.router.navigate([this.returnUrl]);
    }
  }

  onSubmit(): void {
    console.log('📝 Formulario enviado');
    
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      console.warn('⚠️ Formulario inválido');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const credentials: LoginRequest = this.loginForm.value;
    console.log('🔐 Intentando login con:', credentials.username);

    this.authService.login(credentials).subscribe({
      next: (response) => {
        console.log('✅ Login exitoso:', response);
        console.log('📊 Estado autenticación:', this.authService.isAuthenticated());
        
        this.isLoading.set(false);
        
        // ✅ REDIRECCIÓN EXPLÍCITA DESPUÉS DEL LOGIN
        console.log('🚀 Redirigiendo a:', this.returnUrl);
        
        // Usar setTimeout para asegurar que el estado se actualice
        setTimeout(() => {
          this.router.navigate([this.returnUrl]).then(success => {
            if (success) {
              console.log('✅ Navegación exitosa');
            } else {
              console.error('❌ Navegación falló');
            }
          });
        }, 100);
      },
      error: (error) => {
        console.error('❌ Error en login:', error);
        this.isLoading.set(false);
        this.errorMessage.set(
          error.message || 'Error al iniciar sesión. Verifica tus credenciales.'
        );
      }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword.update(value => !value);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    
    if (field?.hasError('required')) {
      return `${this.getFieldLabel(fieldName)} es requerido`;
    }
    
    if (field?.hasError('minlength')) {
      const minLength = field.errors?.['minlength'].requiredLength;
      return `Mínimo ${minLength} caracteres`;
    }
    
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      username: 'Usuario',
      password: 'Contraseña'
    };
    return labels[fieldName] || fieldName;
  }
}