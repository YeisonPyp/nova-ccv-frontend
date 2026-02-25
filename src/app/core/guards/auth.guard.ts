import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard para proteger rutas que requieren autenticación
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Verificar si está autenticado
  if (authService.isAuthenticated()) {
    return true;
  }

  // Si no está autenticado, guardar URL de destino y redirigir al login
  console.warn('⚠️ Acceso denegado. Redirigiendo al login...');
  
  router.navigate(['/auth/login'], {
    queryParams: {
      returnUrl: state.url
    }
  });

  return false;
};