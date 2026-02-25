import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { StorageService } from './storage.service';
import { 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse, 
  UserProfile 
} from '../models/auth.models';
import { ApiResponse } from '../models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private storage = inject(StorageService);

  private readonly API_URL = `${environment.apiUrl}/auth`;
  private readonly USER_URL = `${environment.apiUrl}/users`;

  // Signals (Angular 17+)
  isAuthenticated = signal<boolean>(false);
  currentUser = signal<UserProfile | null>(null);

  // BehaviorSubject para compatibilidad con subscripciones tradicionales
  private authStateSubject = new BehaviorSubject<boolean>(this.hasToken());
  authState$ = this.authStateSubject.asObservable();

  constructor() {
    this.checkAuthState();
  }

  // ══════════════════════════════════════════════════════════════
  //  AUTENTICACIÓN
  // ══════════════════════════════════════════════════════════════

  /**
   * Iniciar sesión
   */
  login(credentials: LoginRequest): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(
      `${this.API_URL}/login`,
      credentials
    ).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.setSession(response.data);
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Registrar nuevo usuario
   */
  register(data: RegisterRequest): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(
      `${this.API_URL}/register`,
      data
    ).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.setSession(response.data);
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Cerrar sesión
   */
  logout(): void {
    this.clearSession();
    this.router.navigate(['/auth/login']);
  }

  // ══════════════════════════════════════════════════════════════
  //  PERFIL DE USUARIO
  // ══════════════════════════════════════════════════════════════

  /**
   * Obtener perfil del usuario actual
   */
  getCurrentUser(): Observable<ApiResponse<UserProfile>> {
    return this.http.get<ApiResponse<UserProfile>>(`${this.USER_URL}/me`).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.currentUser.set(response.data);
          this.storage.setItem(environment.userKey, response.data);
        }
      }),
      catchError(this.handleError)
    );
  }

  // ══════════════════════════════════════════════════════════════
  //  GESTIÓN DE SESIÓN
  // ══════════════════════════════════════════════════════════════

  /**
   * Establecer sesión después del login
   */
  private setSession(authResponse: AuthResponse): void {
    // Guardar token
    this.storage.setItem(environment.tokenKey, authResponse.token);
    
    // Guardar datos básicos del usuario
    const userBasicData: Partial<UserProfile> = {
      username: authResponse.username,
      email: authResponse.email,
      roles: authResponse.roles
    };
    
    this.storage.setItem(environment.userKey, userBasicData);
    
    // Actualizar estados
    this.isAuthenticated.set(true);
    this.authStateSubject.next(true);
    
    // Cargar perfil completo del usuario
    this.getCurrentUser().subscribe({
      next: () => {
        console.log('✅ Perfil de usuario cargado');
      },
      error: (err) => {
        console.error('❌ Error cargando perfil:', err);
      }
    });
  }

  /**
   * Limpiar sesión
   */
  private clearSession(): void {
    this.storage.removeItem(environment.tokenKey);
    this.storage.removeItem(environment.userKey);
    this.isAuthenticated.set(false);
    this.currentUser.set(null);
    this.authStateSubject.next(false);
  }

  /**
   * Verificar estado de autenticación al iniciar la app
   */
  private checkAuthState(): void {
    const hasToken = this.hasToken();
    this.isAuthenticated.set(hasToken);
    
    if (hasToken) {
      const userData = this.storage.getItem<UserProfile>(environment.userKey);
      this.currentUser.set(userData);
      this.authStateSubject.next(true);
      
      // Refrescar perfil desde el servidor
      this.getCurrentUser().subscribe({
        error: () => {
          console.warn('⚠️ Token inválido o expirado, cerrando sesión');
          this.clearSession();
        }
      });
    }
  }

  // ══════════════════════════════════════════════════════════════
  //  HELPERS PÚBLICOS
  // ══════════════════════════════════════════════════════════════

  /**
   * Obtener token del localStorage
   */
  getToken(): string | null {
    return this.storage.getItem<string>(environment.tokenKey);
  }

  /**
   * Verificar si existe un token
   */
  hasToken(): boolean {
    return this.storage.hasKey(environment.tokenKey);
  }

  /**
   * Verificar si el usuario tiene un rol específico
   */
  hasRole(role: string): boolean {
    const user = this.currentUser();
    return user?.roles?.includes(role) ?? false;
  }

  /**
   * Verificar si el usuario tiene al menos uno de los roles
   */
  hasAnyRole(roles: string[]): boolean {
    const user = this.currentUser();
    return roles.some(role => user?.roles?.includes(role)) ?? false;
  }

  /**
   * Verificar si el usuario tiene un permiso específico
   */
  hasPermission(permission: string): boolean {
    const user = this.currentUser();
    return user?.permissions?.includes(permission) ?? false;
  }

  /**
   * Verificar si el usuario tiene al menos uno de los permisos
   */
  hasAnyPermission(permissions: string[]): boolean {
    const user = this.currentUser();
    return permissions.some(perm => user?.permissions?.includes(perm)) ?? false;
  }

  // ══════════════════════════════════════════════════════════════
  //  MANEJO DE ERRORES
  // ══════════════════════════════════════════════════════════════

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Ocurrió un error inesperado';

    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      if (error.error?.message) {
        errorMessage = error.error.message;
      } else if (error.status === 0) {
        errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión.';
      } else {
        errorMessage = `Error ${error.status}: ${error.statusText}`;
      }
    }

    console.error('❌ Error en AuthService:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}