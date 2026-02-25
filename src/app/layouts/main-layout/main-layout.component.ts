import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { MenuService } from '../../core/services/menu.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    HeaderComponent,
    SidebarComponent
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent implements OnInit {
  private menuService = inject(MenuService);

  isCollapsed = this.menuService.isCollapsed;

  ngOnInit(): void {
    // Cargar menú al iniciar
    this.menuService.loadMenu().subscribe({
      next: (response) => {
        console.log('✅ Menú cargado:', response);
      },
      error: (error) => {
        console.error('❌ Error cargando menú:', error);
      }
    });
  }

  onToggleSidebar(): void {
    this.menuService.toggleSidebar();
  }
}