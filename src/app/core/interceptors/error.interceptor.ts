import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { StorageService } from '../services/storage.service';
import { environment } from '../../../environments/environment';

/**
 * Interceptor para manejar errores HTTP globalmente
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const storage = inject(StorageService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Ocurrió un error inesperado';

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
            errorMessage = '⛔ No tienes permisos para realizar esta acción.';
            break;

          case 404:
            errorMessage = '🔍 Recurso no encontrado.';
            break;

          case 500:
            errorMessage = '💥 Error interno del servidor.';
            break;

          case 503:
            errorMessage = '🔧 Servicio no disponible temporalmente.';
            break;

          default:
            if (error.error?.message) {
              errorMessage = error.error.message;
            } else {
              errorMessage = `Error ${error.status}: ${error.statusText}`;
            }
        }
      }

      console.error('🚨 HTTP Error:', {
        status: error.status,
        message: errorMessage,
        url: error.url,
        error: error.error
      });

      return throwError(() => new Error(errorMessage));
    })
  );
};