import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@/app/core/services/auth.service';

/**
 * Shown when the backend rejects the request because the employee is outside
 * their configured schedule (EMPLOYEE_NOT_AVAILABLE).
 */
@Component({
  selector: 'app-unavailable',
  standalone: true,
  template: `
    <div
      class="min-h-screen flex flex-col items-center justify-center text-center py-16 px-6 bg-gray-50"
    >
      <div class="text-6xl mb-4">🕒</div>
      <h1 class="text-2xl font-bold text-secondary mb-2">
        Fuera de tu horario de acceso
      </h1>
      <p class="text-tertiary mb-6 max-w-md">
        No te encuentras dentro del horario asignado para acceder al sistema.
        Intenta nuevamente durante tu jornada o comunícate con un administrador
        si crees que es un error.
      </p>
      <div class="flex gap-3">
        <button class="btn btn-secondary" (click)="retry()">Reintentar</button>
        <button class="btn btn-primary" (click)="logout()">
          Cerrar sesión
        </button>
      </div>
    </div>
  `,
})
export class UnavailableComponent {
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);

  retry() {
    this.router.navigate(['/dashboard']);
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/auth/login']);
  }
}
