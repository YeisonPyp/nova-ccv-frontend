import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { StorageService } from '../services/storage.service';
import { NotificationService } from '../services/notification.service';
import { environment } from '../../../environments/environment';

/** Code sent by the backend when the employee is outside their schedule. */
const EMPLOYEE_NOT_AVAILABLE = 'EMPLOYEE_NOT_AVAILABLE';

/**
 * Interceptor para manejar errores HTTP globalmente
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const storage = inject(StorageService);
  const notifications = inject(NotificationService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Ocurrió un error inesperado';

      // Employee outside their schedule: take them to the dedicated screen
      // instead of showing a generic toast on every request.
      if (error.status === 403 && error.error?.code === EMPLOYEE_NOT_AVAILABLE) {
        router.navigate(['/unavailable']);
        return throwError(
          () => new Error(error.error?.message ?? 'Empleado no disponible'),
        );
      }

      if (error.error instanceof ErrorEvent) {
        // Error del lado del cliente
        errorMessage = `Error del cliente: ${error.error.message}`;
      } else {
        // Error del lado del servidor
        switch (error.status) {
          case 0:
            errorMessage = '❌ No se pudo conectar con el servidor';
            break;

          case 200:
            return next(req);
          case 401:
            errorMessage = '🔒 No autorizado. Por favor inicia sesión.';
            // Limpiar sesión y redirigir al login
            storage.removeItem(environment.tokenKey);
            storage.removeItem(environment.userKey);
            router.navigate(['/auth/login']);
            break;

          case 403:
            errorMessage = 'No tienes permisos para realizar esta acción.';
            break;

          case 404:
            errorMessage = 'Recurso no encontrado.';
            break;

          case 500:
            errorMessage =
              'Error interno del servidor: ' + error.error?.message;
            break;

          case 503:
            errorMessage = 'Servicio no disponible temporalmente.';
            break;

          default:
            if (error.error?.message) {
              errorMessage = error.error.message;
            } else {
              errorMessage = `Error ${error.status}: ${error.statusText}`;
            }
        }
      }

      console.error('HTTP Error:', {
        status: error.status,
        message: errorMessage,
        url: error.url,
        error: error.error,
      });
      // Show a floating toast for the error.
      notifications.error(errorMessage);
      return throwError(() => new Error(errorMessage));
    }),
  );
};
