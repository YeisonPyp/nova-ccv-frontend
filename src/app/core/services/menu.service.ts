import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, of, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';

export interface MenuModule {
  id: number;
  code: string;
  name: string;
  description?: string;
  icon: string;
  color: string;
  basePath: string;
  displayOrder: number;
  routes: MenuItem[];
}

export interface MenuItem {
  id: number;
  name: string;
  path: string;
  component?: string;
  icon?: string;
  description?: string;
  displayOrder: number;
  showInMenu: boolean;
  isPublic: boolean;
  external: boolean;
  openInNewTab: boolean;
  requiredPermissions: string[];
  hasAccess: boolean;
  subRoutes: MenuItem[];
}

// Para el TreeMenu
export interface MenuNode {
  label: string;
  icon?: string;
  route?: string;
  external?: boolean;
  expanded?: boolean;
  children?: MenuNode[];
  target?: '_blank' | '_self';
}

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/menu`;

  // Signals
  menuModules = signal<MenuModule[]>([]);
  menuNodes = signal<MenuNode[]>([]);
  isLoading = signal<boolean>(false);
  isCollapsed = signal<boolean>(false);

  /**
   * Cargar menú desde el backend
   */
  loadMenu(): Observable<ApiResponse<MenuModule[]>> {
    this.isLoading.set(true);

    return this.http.get<ApiResponse<MenuModule[]>>(this.API_URL).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.menuModules.set(response.data);
          this.menuNodes.set(this.transformToMenuNodes(response.data));
        }
        this.isLoading.set(false);
      }),
      catchError(error => {
        console.error('Error cargando menú:', error);
        this.isLoading.set(false);
        // Cargar menú de fallback
        this.menuNodes.set(this.getFallbackMenu());
        return of({ success: false, message: error.message, data: [], timestamp: new Date().toISOString() });
      })
    );
  }

  /**
   * Toggle del sidebar
   */
  toggleSidebar(): void {
    this.isCollapsed.update(value => !value);
  }

  /**
   * Transformar respuesta del backend a MenuNode[]
   */
  private transformToMenuNodes(modules: MenuModule[]): MenuNode[] {
    return modules.map(module => ({
      label: module.name,
      icon: module.icon,
      expanded: false,
      children: this.transformRoutes(module.routes)
    }));
  }

  private transformRoutes(routes: MenuItem[]): MenuNode[] {
    return routes
      .filter(route => route.showInMenu && route.hasAccess)
      .map(route => ({
        label: route.name,
        icon: route.icon,
        route: route.path === '#' ? undefined : route.path,
        external: route.external,
        target: route.openInNewTab ? '_blank' as const : '_self' as const,
        expanded: false,
        children: route.subRoutes?.length 
          ? this.transformRoutes(route.subRoutes) 
          : undefined
      }));
  }

  /**
   * Menú de fallback si el backend falla
   */
  private getFallbackMenu(): MenuNode[] {
    return [
      {
        label: 'Dashboard',
        icon: '🏠',
        route: '/dashboard'
      },
      {
        label: 'PAT',
        icon: '📊',
        expanded: true,
        children: [
          { label: 'Dashboard PAT', icon: '📈', route: '/pat/dashboard' },
          { label: 'Programas', icon: '📋', route: '/pat/programs' }
        ]
      },
      {
        label: 'Configuración',
        icon: '⚙️',
        children: [
          { label: 'Usuarios', icon: '👥', route: '/settings/users' },
          { label: 'Roles', icon: '🔐', route: '/settings/roles' }
        ]
      }
    ];
  }
}