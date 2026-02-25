import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { StorageService } from '../services/storage.service';
import { environment } from '../../../environments/environment';

/**
 * Interceptor para agregar el token JWT a las peticiones HTTP
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const storage = inject(StorageService);
  
  // Lista de endpoints que NO requieren token
  const publicEndpoints = [
    '/auth/login',
    '/auth/register'
  ];

  // Verificar si es un endpoint público
  const isPublicEndpoint = publicEndpoints.some(endpoint => 
    req.url.includes(endpoint)
  );

  // Si no es público y hay token, agregarlo
  if (!isPublicEndpoint) {
    const token = storage.getItem<string>(environment.tokenKey);
    
    if (token) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }
  }

  return next(req);
};